
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: "Hello! I'm your assistant. How can I help you today?" }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: "user", content: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);
    
    // Simulate bot response (in a real app, this would call an API)
    setTimeout(() => {
      const botResponses = [
        "I'm here to help with any questions about your HR or time tracking needs.",
        "You can check your schedule, attendance records, and project assignments in the corresponding tabs.",
        "Need help with a specific feature? Let me know what you're looking for.",
        "If you're having any technical issues, please describe the problem and I'll try to help.",
        "You can view your team hierarchy in the Team section of the app."
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      const botMessage = { role: "system", content: randomResponse };
      
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="flex flex-col bg-white rounded-lg shadow-lg border border-gray-200 w-80 h-96 overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-hrms-primary text-white">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src="/lovable-uploads/4260d4a1-190f-4554-80a3-c86d5c95e013.png" alt="Bot" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <h3 className="font-medium">TimeLeaf Assistant</h3>
            </div>
            <Button 
              onClick={toggleChat} 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-hrms-primary/80"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex-1 p-3 overflow-y-auto">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-hrms-primary text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 rounded-lg p-3 rounded-tl-none">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex items-center">
              <Input
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 mr-2"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!newMessage.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <Button 
          onClick={toggleChat} 
          size="icon" 
          className="h-12 w-12 rounded-full shadow-lg"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default ChatWidget;
