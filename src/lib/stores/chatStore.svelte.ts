interface Message {
	id: number;
	role: 'user' | 'assistant';
	content: string;
	model?: string;
	thinking?: string; // Reasoning/thinking content for models that support it
}

interface Chat {
	id: string;
	title: string;
	messages: Message[];
	createdAt: number;
	updatedAt: number;
	userId?: string | null;
	systemPrompt?: string | null;
	temperature?: string | null;
	llmParams?: string | null; // JSON string of custom parameters
}

async function apiRequest(url: string, options?: RequestInit) {
	const response = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options?.headers
		}
	});

	if (!response.ok) {
		throw new Error(`API request failed: ${response.statusText}`);
	}

	return response.json();
}

function generateUUID() {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

function createChatStore() {
	let chats = $state<Chat[]>([]);
	let currentChatId = $state<string | null>(null);
	let isLoading = $state(false);
	let isSending = $state(false);
	let selectedModel = $state('');
	let temperature = $state(0.7);
	let customAttributes = $state<Record<string, string>>({});
	let systemPrompt = $state('');
	let connectionIds = $state<string[]>([]);

	return {
		get chats() {
			return chats;
		},
		get currentChatId() {
			return currentChatId;
		},
		get currentChat() {
			return chats.find((c) => c.id === currentChatId) || null;
		},
		get isLoading() {
			return isLoading;
		},
		get isSending() {
			return isSending;
		},
		get selectedModel() {
			return selectedModel;
		},
		set selectedModel(value: string) {
			selectedModel = value;
		},
		get temperature() {
			return temperature;
		},
		set temperature(value: number) {
			temperature = value;
		},
		get customAttributes() {
			return customAttributes;
		},
		set customAttributes(value: Record<string, string>) {
			customAttributes = value;
		},
		get systemPrompt() {
			return systemPrompt;
		},
		set systemPrompt(value: string) {
			systemPrompt = value;
		},
		get connectionIds() {
			return connectionIds;
		},
		set connectionIds(value: string[]) {
			connectionIds = value;
		},

		async loadDefaultConnection() {
			try {
				const response = await fetch('/api/ai-connections');
				if (response.ok) {
					const connections = await response.json();
					const defaultConn = connections.find((c: any) => c.isDefault);
					if (defaultConn && connectionIds.length === 0) {
						connectionIds = [defaultConn.id];
					}
				}
			} catch {
				// Silently handle errors
			}
		},

		async loadChats() {
			isLoading = true;
			try {
				// Load default connection first if no connections are set
				if (connectionIds.length === 0) {
					await this.loadDefaultConnection();
				}

				const url = '/api/chats';
				const data = await apiRequest(url);
				chats = data.map((chat: Chat & { createdAt: string; updatedAt: string }) => ({
					...chat,
					createdAt: new Date(chat.createdAt).getTime(),
					updatedAt: new Date(chat.updatedAt).getTime()
				}));

				if (chats.length > 0 && !currentChatId) {
					currentChatId = chats[0].id;
				}
			} catch {
				// Silently handle errors
			} finally {
				isLoading = false;
			}
		},

		async createNewChat(): Promise<string> {
			const newChat = {
				id: generateUUID(),
				title: 'New Chat'
			};

			try {
				const data = await apiRequest('/api/chats', {
					method: 'POST',
					body: JSON.stringify(newChat)
				});

				const chat = {
					...data,
					createdAt: new Date(data.createdAt).getTime(),
					updatedAt: new Date(data.updatedAt).getTime()
				};

				chats = [chat, ...chats];
				currentChatId = chat.id;

				return chat.id;
			} catch (error) {
				console.error('Error creating chat:', error);
				throw error;
			}
		},

		async selectChat(chatId: string) {
			const chat = chats.find((c) => c.id === chatId);
			if (chat) {
				currentChatId = chatId;

				// Load chat-specific LLM settings
				systemPrompt = chat.systemPrompt || '';
				temperature = chat.temperature ? parseFloat(chat.temperature) : 0.7;

				// Parse llmParams which may contain both custom attributes and connectionIds
				if (chat.llmParams) {
					try {
						const params = JSON.parse(chat.llmParams);
						const { connectionIds: savedConnectionIds, ...attrs } = params;
						customAttributes = attrs;

						// Restore connection IDs if saved
						if (savedConnectionIds && Array.isArray(savedConnectionIds)) {
							connectionIds = savedConnectionIds;
						}
					} catch {
						// Fallback for old format (just custom attributes)
						customAttributes = chat.llmParams ? JSON.parse(chat.llmParams) : {};
					}
				} else {
					customAttributes = {};
				}
			}
		},

		addMessageToChat(chatId: string, message: Message) {
			chats = chats.map((chat) => {
				if (chat.id === chatId) {
					return {
						...chat,
						messages: [...chat.messages, message],
						updatedAt: Date.now()
					};
				}
				return chat;
			});
		},

		updateMessageInChat(chatId: string, messageId: number, updates: Partial<Message>) {
			chats = chats.map((chat) => {
				if (chat.id === chatId) {
					return {
						...chat,
						messages: chat.messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
						updatedAt: Date.now()
					};
				}
				return chat;
			});
		},

		async saveMessage(chatId: string, message: Message) {
			await apiRequest(`/api/chats/${chatId}/messages`, {
				method: 'POST',
				body: JSON.stringify({
					role: message.role,
					content: message.content,
					...(message.model && { model: message.model }),
					...(message.thinking && { thinking: message.thinking })
				})
			});
		},

		async sendMessage(content: string) {
			if (!content.trim() || isSending) return;

			// Ensure we have a current chat
			if (!currentChatId) {
				await this.createNewChat();
			}
			if (!currentChatId) return;

			const chatId = currentChatId;
			const userMessageId = Date.now();
			const userMessage: Message = {
				id: userMessageId,
				role: 'user',
				content: content.trim()
			};

			// 1. Add user message locally
			this.addMessageToChat(chatId, userMessage);
			isSending = true;

			try {
				// 2. Save user message to server
				await this.saveMessage(chatId, userMessage);

				// 3. Generate title if first message
				const currentChat = chats.find((c) => c.id === chatId);
				if (currentChat && currentChat.messages.length === 1) {
					const title = this.generateChatTitle([userMessage]);
					await this.renameChat(chatId, title);
				}

				// 4. Prepare for assistant response
				const assistantMessageId = Date.now() + 1;
				const assistantMessage: Message = {
					id: assistantMessageId,
					role: 'assistant',
					content: ''
				};
				this.addMessageToChat(chatId, assistantMessage);

				// 5. Stream response
				// Get fresh current chat to include the user message we just added
				const freshChat = chats.find((c) => c.id === chatId);
				const requestBody = {
					messages:
						freshChat?.messages
							.filter((m) => m.id !== assistantMessageId)
							.map((m) => ({ role: m.role, content: m.content })) || [],
					model: selectedModel,
					temperature: temperature,
					customAttributes: customAttributes,
					systemPrompt: systemPrompt,
					connectionIds: connectionIds
				};

				const response = await fetch('/api/chat', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(requestBody)
				});

				if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

				const reader = response.body?.getReader();
				const decoder = new TextDecoder();
				if (!reader) throw new Error('No response body');

				let accumulatedContent = '';
				let accumulatedThinking = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					const chunk = decoder.decode(value);
					const lines = chunk.split('\n');

					for (const line of lines) {
						if (line.startsWith('data: ')) {
							try {
								const parsed = JSON.parse(line.slice(6));

								if (parsed.type === 'content') {
									accumulatedContent += parsed.data;
									this.updateMessageInChat(chatId, assistantMessageId, {
										content: accumulatedContent,
										model: selectedModel,
										thinking: accumulatedThinking || undefined
									});
								} else if (parsed.type === 'thinking') {
									accumulatedThinking += parsed.data;
									this.updateMessageInChat(chatId, assistantMessageId, {
										content: accumulatedContent,
										model: selectedModel,
										thinking: accumulatedThinking
									});
								}
							} catch {
								// Silently handle parsing errors
							}
						}
					}
				}

				// 6. Save assistant message to server
				await this.saveMessage(chatId, {
					...assistantMessage,
					content: accumulatedContent,
					model: selectedModel,
					thinking: accumulatedThinking || undefined
				});
			} catch (error) {
				console.error('Error sending message:', error);
				// Optionally add error message to chat
			} finally {
				isSending = false;
			}
		},

		async deleteChat(chatId: string) {
			try {
				await apiRequest(`/api/chats/${chatId}`, {
					method: 'DELETE'
				});

				chats = chats.filter((c) => c.id !== chatId);

				if (currentChatId === chatId) {
					currentChatId = chats.length > 0 ? chats[0].id : null;
				}
			} catch {
				// Silently handle errors
			}
		},

		async renameChat(chatId: string, newTitle: string) {
			await apiRequest(`/api/chats/${chatId}`, {
				method: 'PATCH',
				body: JSON.stringify({ title: newTitle })
			});

			chats = chats.map((chat) => {
				if (chat.id === chatId) {
					return {
						...chat,
						title: newTitle,
						updatedAt: Date.now()
					};
				}
				return chat;
			});
		},

		async saveChatSettings() {
			if (!currentChatId) return;

			try {
				// Only send non-default values
				const settings: Record<string, string> = {};

				if (systemPrompt) {
					settings.systemPrompt = systemPrompt;
				}

				if (temperature !== 0.7) {
					settings.temperature = temperature.toString();
				}

				// Build llmParams object with both custom attributes and connectionIds
				const paramsObj: Record<string, any> = {};

				// Filter out empty custom attributes
				Object.entries(customAttributes).forEach(([key, value]) => {
					if (value && value.trim()) {
						paramsObj[key] = value.trim();
					}
				});

				// Save connection IDs if not default
				if (connectionIds.length > 0) {
					paramsObj.connectionIds = connectionIds;
				}

				if (Object.keys(paramsObj).length > 0) {
					settings.llmParams = JSON.stringify(paramsObj);
				}

				// Only send request if there are settings to save
				if (Object.keys(settings).length > 0) {
					await apiRequest(`/api/chats/${currentChatId}`, {
						method: 'PATCH',
						body: JSON.stringify(settings)
					});

					// Update local chat object
					chats = chats.map((chat) => {
						if (chat.id === currentChatId) {
							return {
								...chat,
								...settings,
								updatedAt: Date.now()
							};
						}
						return chat;
					});
				}
			} catch {
				// Silently handle errors
			}
		},

		generateChatTitle(messages: Message[]): string {
			const firstUserMessage = messages.find((m) => m.role === 'user');
			if (!firstUserMessage) return 'New Chat';

			const content = firstUserMessage.content.trim();
			return content.length > 50 ? content.substring(0, 50) + '...' : content;
		}
	};
}

export const chatStore = createChatStore();
export type { Message, Chat };
