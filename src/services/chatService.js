// Chat service for ASET - integrates with SpaceDigest backend
import { spaceDigestService } from './spaceDigestService';

const STORAGE_KEY = 'aset_chat_history';

// LocalStorage helper functions
const storage = {
    getChats: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return [];
        }
    },
    
    saveChats: (chats) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    },
    
    getChat: (chatId) => {
        const chats = storage.getChats();
        return chats.find(chat => chat.id === chatId);
    },
    
    updateChat: (chatId, updates) => {
        const chats = storage.getChats();
        const index = chats.findIndex(chat => chat.id === chatId);
        if (index !== -1) {
            chats[index] = { ...chats[index], ...updates, lastUpdated: new Date().toISOString() };
            storage.saveChats(chats);
            return chats[index];
        }
        return null;
    },
    
    deleteChat: (chatId) => {
        const chats = storage.getChats();
        const filtered = chats.filter(chat => chat.id !== chatId);
        storage.saveChats(filtered);
        return filtered.length < chats.length;
    }
};

export const chatService = {
    // Send a message and get AI response with paper search (verification on demand)
    sendMessage: async (message, files = []) => {
        try {
            // Only search for papers, don't verify yet
            const result = await spaceDigestService.searchPapers(message, {}, 50, 0);

            if (!result.success) {
                return {
                    success: false,
                    response: `Error: ${result.error}`,
                    timestamp: new Date().toISOString()
                };
            }

            const { sources, domain, topic, subtopic, totalSources, queryTime } = result.data;

            if (!sources || sources.length === 0) {
                return {
                    success: true,
                    response: 'No papers found for this claim. Try rephrasing your query.',
                    timestamp: new Date().toISOString()
                };
            }

            // Return papers with metadata (verification happens when user clicks button)
            return {
                success: true,
                response: `Found ${totalSources} relevant papers`,
                timestamp: new Date().toISOString(),
                metadata: {
                    papers: sources,
                    searchMetadata: {
                        domain,
                        topic,
                        subtopic,
                        totalSources,
                        queryTime
                    }
                }
            };
        } catch (error) {
            console.error('Send message error:', error);
            return {
                success: false,
                response: 'Sorry, I encountered an error processing your request. Please try again.',
                timestamp: new Date().toISOString()
            };
        }
    },

    // Fetch chat history from localStorage
    getChatHistory: async () => {
        const chats = storage.getChats();
        
        // Sort by lastUpdated descending
        chats.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        
        return {
            success: true,
            chats: chats
        };
    },

    // Create a new chat
    createChat: async (initialMessage, messages = []) => {
        const chatId = Date.now();
        const now = new Date().toISOString();
        
        const newChat = {
            id: chatId,
            name: initialMessage.slice(0, 50) + (initialMessage.length > 50 ? '...' : ''),
            messageCount: messages.length,
            messages: messages,
            lastUpdated: now,
            createdAt: now
        };
        
        const chats = storage.getChats();
        chats.push(newChat);
        storage.saveChats(chats);
        
        return {
            success: true,
            chatId: chatId,
            message: 'Chat created successfully'
        };
    },

    // Update chat (messages or name)
    updateChat: async (chatId, updates) => {
        const chat = storage.updateChat(chatId, updates);
        
        if (chat) {
            return {
                success: true,
                message: 'Chat updated successfully',
                chat: chat
            };
        }
        
        return {
            success: false,
            message: 'Chat not found'
        };
    },

    // Update chat name
    updateChatName: async (chatId, newName) => {
        return chatService.updateChat(chatId, { name: newName });
    },

    // Delete a chat
    deleteChat: async (chatId) => {
        const deleted = storage.deleteChat(chatId);
        
        return {
            success: deleted,
            message: deleted ? 'Chat deleted successfully' : 'Chat not found'
        };
    },

    // Load chat messages
    loadChatMessages: async (chatId) => {
        const chat = storage.getChat(chatId);
        
        if (chat) {
            return {
                success: true,
                messages: chat.messages || [],
                chatName: chat.name
            };
        }
        
        return {
            success: false,
            message: 'Chat not found',
            messages: []
        };
    },
    
    // Save current chat to history
    saveCurrentChat: async (chatName, messages) => {
        if (messages.length === 0) return { success: false };
        
        const firstUserMessage = messages.find(m => m.type === 'user')?.content || 'New Chat';
        
        return chatService.createChat(firstUserMessage, messages);
    }
};
