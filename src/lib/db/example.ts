/**
 * Example usage of the database persistence layer
 * 
 * This file demonstrates how to use both the direct database API
 * and the Svelte store wrapper.
 */

import { getDatabase } from '$lib/db';
import { chatStore } from '$lib/stores/chatStore.svelte';

// ============================================
// Example 1: Direct Database API Usage
// ============================================

export async function directDatabaseExample() {
    const db = getDatabase('sqlite');

    // Create a new chat
    const chatId = crypto.randomUUID();
    await db.createChat({
        id: chatId,
        title: 'My First Chat'
    });

    // Add messages to the chat
    await db.addMessage({
        chatId,
        role: 'user',
        content: 'Hello, how are you?'
    });

    await db.addMessage({
        chatId,
        role: 'assistant',
        content: 'I am doing well, thank you!'
    });

    // Get all chats
    const chats = await db.getChats();
    console.log('All chats:', chats);

    // Get a specific chat with messages
    const chat = await db.getChat(chatId);
    console.log('Chat with messages:', chat);

    // Update chat title
    await db.updateChat(chatId, {
        title: 'Updated Chat Title',
        updatedAt: new Date()
    });

    // Delete the chat
    await db.deleteChat(chatId);
}

// ============================================
// Example 2: Using the Svelte Store (Recommended)
// ============================================

export async function storeExample() {
    // Load all chats from database
    await chatStore.loadChats();

    // Create a new chat
    const chatId = await chatStore.createNewChat();

    // Add messages (this will auto-save to database)
    await chatStore.updateCurrentChat([
        { id: 1, role: 'user', content: 'Hello!' },
        { id: 2, role: 'assistant', content: 'Hi there!' }
    ]);

    // Access current chat
    const currentChat = chatStore.currentChat;
    console.log('Current chat:', currentChat);

    // Switch to another chat
    await chatStore.selectChat('some-other-chat-id');

    // Delete a chat
    await chatStore.deleteChat(chatId);
}

// ============================================
// Example 3: With User Authentication (Future)
// ============================================

export async function authExample() {
    const db = getDatabase('sqlite');

    // Create a user
    const userId = crypto.randomUUID();
    await db.createUser?.({
        id: userId,
        email: 'user@example.com',
        username: 'johndoe'
    });

    // Create a chat for this user
    const chatId = crypto.randomUUID();
    await db.createChat({
        id: chatId,
        userId: userId,
        title: 'User Chat'
    });

    // Get all chats for this user
    const userChats = await db.getChats(userId);
    console.log('User chats:', userChats);

    // In the store, set the user ID
    chatStore.setUserId(userId);
    await chatStore.loadChats(); // Will only load this user's chats
}

// ============================================
// Example 4: Switching Database Types
// ============================================

export async function switchDatabaseExample() {
    // Currently using SQLite
    const sqliteDb = getDatabase('sqlite');

    // In the future, easily switch to PostgreSQL:
    // const postgresDb = getDatabase('postgres', {
    //   connectionString: 'postgresql://user:pass@localhost:5432/nanochat'
    // });

    // Or MySQL:
    // const mysqlDb = getDatabase('mysql', {
    //   host: 'localhost',
    //   database: 'nanochat',
    //   user: 'root',
    //   password: 'password'
    // });

    // All databases implement the same interface!
}
