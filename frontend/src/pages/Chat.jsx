import { useState } from 'react';
import { useQuery } from 'react-query';
import { Send, MessageCircle } from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/common/Loader';

function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');

  const { data: chats, isLoading } = useQuery('chats', async () => {
    const response = await api.get('/chat');
    return response.data.data;
  });

  const { data: chatMessages } = useQuery(
    ['chat-messages', selectedChat],
    async () => {
      if (!selectedChat) return null;
      const response = await api.get(`/chat/${selectedChat}`);
      return response.data.data;
    },
    { enabled: !!selectedChat }
  );

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    try {
      await api.post(`/chat/${selectedChat}/message`, { message });
      setMessage('');
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1 card overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {chats?.map((chat) => (
              <button
                key={chat._id}
                onClick={() => setSelectedChat(chat._id)}
                className={`w-full p-4 text-left hover:bg-gray-50 ${
                  selectedChat === chat._id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="font-semibold mb-1">
                  {chat.participants?.find(p => p._id !== 'current-user')?.name || 'User'}
                </div>
                <div className="text-sm text-gray-600 truncate">{chat.lastMessage}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 card flex flex-col" style={{ height: '500px' }}>
          {selectedChat ? (
            <>
              <div className="p-4 border-b">
                <h2 className="font-semibold">Chat</h2>
              </div>
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {chatMessages?.messages?.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.sender === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender === 'current-user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="input-field flex-grow"
                  />
                  <button type="submit" className="btn-primary">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;