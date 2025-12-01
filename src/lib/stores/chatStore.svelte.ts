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
	let selectedModel = $state('');
	let temperature = $state(0.7);
	let customAttributes = $state<Record<string, string>>({});
	let systemPrompt = $state('');

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

		async loadChats() {
			isLoading = true;
			try {
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
			} catch (error) {
				console.error('Error loading chats:', error);
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
				customAttributes = chat.llmParams ? JSON.parse(chat.llmParams) : {};
			}
		},

		async updateCurrentChat(messages: Message[]) {
			if (!currentChatId) {
				await this.createNewChat();
			}

			if (!currentChatId) return;

			try {
				// Generate title from first user message if needed
				const currentChat = chats.find((c) => c.id === currentChatId);
				const needsTitle = currentChat && currentChat.messages.length === 0;
				const title = needsTitle ? this.generateChatTitle(messages) : undefined;

				// Update title if needed
				if (title) {
					await apiRequest(`/api/chats/${currentChatId}`, {
						method: 'PATCH',
						body: JSON.stringify({ title })
					});
				}

				// Add new messages
				const existingMessageCount = currentChat?.messages.length || 0;
				const newMessages = messages.slice(existingMessageCount);

				for (const message of newMessages) {
					await apiRequest(`/api/chats/${currentChatId}/messages`, {
						method: 'POST',
						body: JSON.stringify({
							role: message.role,
							content: message.content,
							...(message.model && { model: message.model }),
							...(message.thinking && { thinking: message.thinking })
						})
					});
				}

				// Update local state
				chats = chats.map((chat) => {
					if (chat.id === currentChatId) {
						return {
							...chat,
							messages,
							title: title || chat.title,
							updatedAt: Date.now()
						};
					}
					return chat;
				});
			} catch (error) {
				console.error('Error updating chat:', error);
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
			} catch (error) {
				console.error('Error deleting chat:', error);
			}
		},

		async renameChat(chatId: string, newTitle: string) {
			try {
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
			} catch (error) {
				console.error('Error renaming chat:', error);
				throw error;
			}
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

				// Filter out empty custom attributes
				const nonEmptyAttrs: Record<string, string> = {};
				Object.entries(customAttributes).forEach(([key, value]) => {
					if (value && value.trim()) {
						nonEmptyAttrs[key] = value.trim();
					}
				});

				if (Object.keys(nonEmptyAttrs).length > 0) {
					settings.llmParams = JSON.stringify(nonEmptyAttrs);
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
			} catch (error) {
				console.error('Error saving chat settings:', error);
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
