import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MoreVertical, Bot, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import sylphieLogo from "@/assets/sylphie-logo.png";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat = () => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Generate session ID on component mount
  useEffect(() => {
    const generateSessionId = () => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      return `sylphie_${timestamp}_${random}`;
    };
    
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    console.log('Generated Session ID:', newSessionId);
    
    // Cleanup function to prevent memory leaks
    return () => {
      console.log('Chat component cleanup');
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageText = inputValue.trim();
    setInputValue("");
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    try {
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    } catch (error) {
      console.error('Error adding user message:', error);
      return;
    }

    try {
      // Try direct connection first, then fallback to mock
      let response;
      let isDirectConnection = false;
      
      try {
        console.log('Sending request to N8N with payload:', {
          message: messageText,
          text: messageText,
          input: messageText,
          sessionId: sessionId,
          timestamp: new Date().toISOString(),
          userId: 'user_' + Date.now(),
        });
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        response = await fetch('https://shubh123456.app.n8n.cloud/webhook/62c21d28-be46-45f3-a0f3-9ee500889a92', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId,
            message: messageText,
            text: messageText,
            input: messageText,
            timestamp: new Date().toISOString(),
            userId: 'user_' + Date.now(),
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        console.log('N8N Response Status:', response.status);
        console.log('N8N Response Headers:', Object.fromEntries(response.headers.entries()));
        isDirectConnection = true;
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        
        // Show specific error messages to help debug
        let errorMessage = 'Connection failed. Please check your N8N webhook configuration.';
        
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request timed out. Your N8N webhook is not responding within 10 seconds.';
        } else if (fetchError.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Cannot reach your N8N webhook. Check if the URL is correct.';
        } else if (fetchError.message.includes('CORS')) {
          errorMessage = 'CORS error: Your N8N webhook needs CORS headers.';
        }
        
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: errorMessage,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, errorMsg]);
        return;
      }
      
      if (response.ok) {
        // Handle different response types from N8N
        let responseText = '';
        const contentType = response.headers.get('content-type');
        
        try {
          // Always get the raw response first for debugging
          const rawResponse = await response.clone().text();
          console.log('Raw N8N Response:', rawResponse);
          console.log('Response Content-Type:', contentType);
          console.log('Response Status:', response.status);
          console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
          
          // Check if response is empty
          if (!rawResponse || rawResponse.trim() === '') {
            console.log('Empty response received from N8N');
            responseText = '🔄 I received your message but got an empty response from my backend. This usually means:\n\n1. Your N8N workflow is not configured to send a response\n2. The "Respond to Webhook" node is missing or not connected\n3. The workflow is running but not returning any data\n\nPlease check your N8N workflow and ensure it has a "Respond to Webhook" node that sends back a response.';
          } else if (contentType && contentType.includes('application/json')) {
            // Try to parse as JSON
            try {
              const data = await response.json();
              console.log('N8N JSON Response:', data);
              
              // Handle different JSON response formats
              if (typeof data === 'string') {
                responseText = data;
              } else if (data.response) {
                responseText = data.response;
              } else if (data.message) {
                responseText = data.message;
              } else if (data.text) {
                responseText = data.text;
              } else if (data.answer) {
                responseText = data.answer;
              } else if (data.output) {
                responseText = data.output;
              } else if (data.result) {
                responseText = data.result;
              } else if (data.data) {
                responseText = data.data;
              } else if (data.myField) {
                responseText = data.myField;
              } else if (data.value) {
                responseText = data.value;
              } else {
                // If it's a simple object with one field, use that field's value
                const keys = Object.keys(data);
                if (keys.length === 1) {
                  responseText = data[keys[0]];
                } else {
                  responseText = JSON.stringify(data, null, 2);
                }
              }
              
              // Format the response text for better readability
              if (responseText && typeof responseText === 'string') {
                // Add some basic formatting
                responseText = responseText
                  .replace(/\n/g, '\n') // Preserve line breaks
                  .trim(); // Remove extra whitespace
              }
            } catch (jsonError) {
              console.log('JSON parse failed, using raw text:', jsonError);
              responseText = rawResponse;
            }
          } else {
            // Handle as text response
            responseText = rawResponse;
            console.log('N8N Text Response:', responseText);
          }
        } catch (parseError) {
          // If everything fails, try to get any response
          console.error('All parsing failed:', parseError);
          try {
            const fallbackResponse = await response.text();
            responseText = fallbackResponse || 'Received empty response from N8N.';
            console.log('Fallback response:', responseText);
          } catch (textError) {
            console.error('Complete failure to parse response:', textError);
            responseText = 'Received response but could not parse it properly. Please check your N8N webhook configuration.';
          }
        }
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: responseText || 'No response received',
          isUser: false,
          timestamp: new Date(),
        };
        
        try {
          setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
          console.error('Error adding AI message:', error);
          // Fallback: show error message
          const errorMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: 'Sorry, I encountered an error processing your message. Please try again.',
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } else {
        console.error('Response not ok:', response.status, response.statusText);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Handle specific HTTP errors
        if (response.status === 500) {
          throw new Error(`Server Error (500): Your N8N workflow has an internal error. Check your N8N workflow logs.`);
        } else if (response.status === 404) {
          throw new Error(`Not Found (404): N8N webhook URL not found. Check your webhook configuration.`);
        } else if (response.status === 400) {
          throw new Error(`Bad Request (400): Invalid request format. Check your N8N workflow input handling.`);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      let errorText = 'Sorry, I encountered an error. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorText = 'Connection failed. Please check your internet connection and N8N webhook URL.';
        } else if (error.message.includes('Server Error (500)')) {
          errorText = 'Server Error: Your N8N workflow has an internal error. Please check your N8N workflow logs and try again.';
        } else if (error.message.includes('Not Found (404)')) {
          errorText = 'Webhook not found. Please check your N8N webhook configuration.';
        } else if (error.message.includes('Bad Request (400)')) {
          errorText = 'Invalid request format. Please check your N8N workflow input handling.';
        } else if (error.message.includes('HTTP')) {
          errorText = `Server error: ${error.message}`;
        } else {
          errorText = `Error: ${error.message}`;
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackClick = () => {
    navigate("/");
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-emerald relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
      
      {/* Modern Header */}
      <header className="relative z-10 glass border-b border-border/50 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-primary/10 transition-colors duration-200"
              onClick={handleBackClick}
              title="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src={sylphieLogo} 
                  alt="SYLPHIE" 
                  className="w-8 h-8 object-contain" 
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">SYLPHIE</h1>
                <p className="text-xs text-muted-foreground">AI Assistant</p>
                {sessionId && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Session: {sessionId.substring(0, 20)}...
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-primary/10"
              onClick={clearMessages}
              title="Clear conversation"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="h-full flex flex-col">
        {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-black rounded-full blur-lg opacity-50 scale-110"></div>
                <img 
                  src={sylphieLogo} 
                  alt="SYLPHIE" 
                  className="relative w-16 h-16 object-contain z-10" 
                />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Welcome to SYLPHIE
              </h2>
              <p className="text-muted-foreground max-w-md">
                I'm your intelligent AI assistant. Ask me anything about work, life, or just have a conversation!
              </p>
              <div className="mt-4">
                <Button 
                  onClick={async () => {
                    try {
                      console.log('Testing N8N connection...');
                      const response = await fetch('https://shubh123456.app.n8n.cloud/webhook/62c21d28-be46-45f3-a0f3-9ee500889a92', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                          sessionId: sessionId,
                          message: 'Hello from test',
                          text: 'Hello from test',
                          input: 'Hello from test'
                        }),
                      });
                      
                      console.log('Test response status:', response.status);
                      console.log('Test response headers:', Object.fromEntries(response.headers.entries()));
                      
                      const text = await response.text();
                      console.log('Test response body:', text);
                      console.log('Test response length:', text.length);
                      
                      if (response.ok) {
                        if (text && text.trim()) {
                          alert(`✅ Connection successful!\nStatus: ${response.status}\nResponse: ${text.substring(0, 100)}...`);
                        } else {
                          alert(`⚠️ Connection successful but empty response!\nStatus: ${response.status}\nYour N8N workflow needs a "Respond to Webhook" node.`);
                        }
                      } else {
                        alert(`❌ Connection failed!\nStatus: ${response.status}\nResponse: ${text}`);
                      }
                    } catch (error) {
                      console.error('Test Error:', error);
                      alert(`❌ Test failed: ${error.message}`);
                    }
                  }}
                  variant="outline" 
                  size="sm"
                >
                  🔧 Test N8N Connection
                </Button>
              </div>
          </div>
        ) : (
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map((message, index) => (
              <div
                key={message.id}
                  className={`flex gap-3 ${message.isUser ? "justify-end" : "justify-start"} slide-up`}
                >
                  {!message.isUser && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-black overflow-hidden">
                        <img 
                          src={sylphieLogo} 
                          alt="SYLPHIE" 
                          className="w-6 h-6 object-contain" 
                        />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div 
                    className={`flex flex-col ${message.isUser ? "items-end" : "items-start"}`}
                    style={{
                      maxWidth: message.text.length > 100 ? '85%' : '75%',
                      minWidth: '200px'
                    }}
              >
                <div
                  className={
                    message.isUser 
                      ? "chat-bubble-user" 
                      : "chat-bubble-assistant"
                  }
                      style={{
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '100%'
                      }}
                    >
                      <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                  {message.isUser && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
              </div>
            ))}
              
            {isLoading && (
                <div className="flex gap-3 justify-start slide-up">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-black overflow-hidden">
                      <img 
                        src={sylphieLogo} 
                        alt="SYLPHIE" 
                        className="w-6 h-6 object-contain" 
                      />
                    </AvatarFallback>
                  </Avatar>
                <div className="chat-bubble-assistant">
                    <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
            </div>
        )}
        </div>
      </main>

      {/* Modern Input Area */}
      <footer className="relative z-10 glass border-t border-border/50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
                className="w-full rounded-2xl border-border/50 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary/50 bg-card/50 backdrop-blur-sm pr-12"
            disabled={isLoading}
          />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                Press Enter to send
              </div>
            </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="btn-send"
            size="icon"
          >
            <Send className="w-5 h-5" />
            <span className="sr-only">Send message</span>
          </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Chat;