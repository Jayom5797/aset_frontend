import React from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { useSidebar } from './hooks/useSidebar';
import { chatService } from './services/chatService';
import './styles/chat.css';
import './styles/searchResults.css';

function App() {
  const { isExpanded, activeItem, toggleSidebar, setActive } = useSidebar();
  const [currentView, setCurrentView] = React.useState('welcome');
  const [messages, setMessages] = React.useState([]);
  const [chatName, setChatName] = React.useState('New Chat');
  const [currentChatId, setCurrentChatId] = React.useState(null);

  // Auto-save chat when messages change
  React.useEffect(() => {
    if (messages.length > 0) {
      const saveChat = async () => {
        if (currentChatId) {
          // Update existing chat
          await chatService.updateChat(currentChatId, {
            messages: messages,
            messageCount: messages.length,
            name: chatName
          });
        } else {
          // Create new chat
          const firstUserMessage = messages.find(m => m.type === 'user')?.content || 'New Chat';
          const result = await chatService.createChat(firstUserMessage, messages);
          if (result.success) {
            setCurrentChatId(result.chatId);
          }
        }
      };
      saveChat();
    }
  }, [messages, chatName, currentChatId]);

  const handleItemClick = (item) => {
    setActive(item);

    if (item === 'history') {
      setCurrentView('history');
    } else if (item === 'current-chat') {
      if (messages.length > 0) {
        setCurrentView('messages');
      } else {
        setCurrentView('welcome');
      }
    } else if (item === 'trending') {
      alert('Trending page - Coming soon!');
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatName('New Chat');
    setCurrentChatId(null);
    setCurrentView('welcome');
    setActive('current-chat');
  };

  const handleLoadChat = async (chatId) => {
    const result = await chatService.loadChatMessages(chatId);
    if (result.success) {
      setMessages(result.messages);
      setChatName(result.chatName || 'Chat');
      setCurrentChatId(chatId);
      setCurrentView('messages');
      setActive('current-chat');
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        isExpanded={isExpanded}
        onToggle={toggleSidebar}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        onNewChat={handleNewChat}
      />
      <ChatArea 
        userName="Utsav Singh"
        currentView={currentView}
        setCurrentView={setCurrentView}
        messages={messages}
        setMessages={setMessages}
        chatName={chatName}
        setChatName={setChatName}
        onLoadChat={handleLoadChat}
      />
    </div>
  );
}

export default App;
