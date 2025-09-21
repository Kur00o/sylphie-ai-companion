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
        
        if (fetchError.name === 'AbortError') {
          console.log('Request timed out after 10 seconds');
        } else if (fetchError.message.includes('CORS')) {
          console.log('CORS error detected');
        } else if (fetchError.message.includes('Failed to fetch')) {
          console.log('Network error - N8N webhook might be down');
        } else {
          console.log('Unknown fetch error:', fetchError.message);
        }
        
        console.log('Using mock response as fallback');
        // Fallback to mock response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockResponse = {
          response: `Hello! I'm SYLPHIE, your AI assistant. You said: "${messageText}". 

⚠️ Note: I'm currently in demo mode because your N8N webhook has CORS restrictions. To enable real AI responses, please add CORS headers to your N8N workflow:

1. Add a "Set" node before your webhook response
2. Set these headers:
   - Access-Control-Allow-Origin: *
   - Access-Control-Allow-Methods: POST, GET, OPTIONS
   - Access-Control-Allow-Headers: Content-Type

Once CORS is configured, I'll connect directly to your AI agent!`,
          status: 'success'
        };
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: mockResponse.response,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
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
            responseText = 'I received your message but my response system seems to be empty. Please check your N8N workflow configuration.';
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      let errorText = 'Sorry, I encountered an error. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorText = 'Connection failed. Please check your internet connection and N8N webhook URL.';
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
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  ⚠️ CORS Issue: Your N8N webhook needs CORS headers to work from browsers.
                </p>
                <Button 
                  onClick={async () => {
                    try {
                      console.log('Testing N8N connection...');
                      const controller = new AbortController();
                      const timeoutId = setTimeout(() => controller.abort(), 5000);
                      
                      const response = await fetch('https://shubh123456.app.n8n.cloud/webhook/62c21d28-be46-45f3-a0f3-9ee500889a92', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                          sessionId: sessionId,
                          test: 'connection',
                          timestamp: new Date().toISOString(),
                        }),
                        signal: controller.signal,
                      });
                      
                      clearTimeout(timeoutId);
                      console.log('Test response status:', response.status);
                      console.log('Test response headers:', Object.fromEntries(response.headers.entries()));
                      
                      // Handle response parsing safely
                      const contentType = response.headers.get('content-type');
                      let responseData;
                      
                      if (contentType && contentType.includes('application/json')) {
                        try {
                          responseData = await response.json();
                        } catch {
                          responseData = await response.text();
                        }
                      } else {
                        responseData = await response.text();
                      }
                      
                      console.log('Test response data:', responseData);
                      alert(`✅ Connection successful!\nStatus: ${response.status}\nResponse: ${JSON.stringify(responseData).substring(0, 100)}...`);
                    } catch (error) {
                      console.error('Test Error:', error);
                      if (error.name === 'AbortError') {
                        alert('❌ Request timed out - N8N webhook is not responding');
                      } else if (error.message.includes('Failed to fetch')) {
                        alert('❌ Network error - N8N webhook is not reachable');
                      } else {
                        alert(`❌ Error: ${error.message}\n\nCheck your N8N webhook configuration.`);
                      }
                    }
                  }}
                  variant="outline" 
                  size="sm"
                >
                  Test N8N Connection
                </Button>
                
                <Button 
                  onClick={() => {
                    console.log('Current messages:', messages);
                    console.log('Current session ID:', sessionId);
                    console.log('Current loading state:', isLoading);
                    alert(`Debug Info:\nMessages: ${messages.length}\nSession: ${sessionId}\nLoading: ${isLoading}`);
                  }}
                  variant="outline" 
                  size="sm"
                >
                  Debug State
                </Button>
                
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('https://shubh123456.app.n8n.cloud/webhook/62c21d28-be46-45f3-a0f3-9ee500889a92', {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ 
                          sessionId: sessionId,
                          test: 'simple',
                          message: 'Hello from test'
                        }),
                      });
                      
                      const text = await response.text();
                      console.log('Simple test response:', text);
                      console.log('Response length:', text.length);
                      console.log('Response status:', response.status);
                      
                      if (text.length === 0) {
                        alert('❌ N8N is returning empty response!\n\nYou need to add a "Respond to Webhook" node in your N8N workflow.');
                      } else {
                        alert(`✅ N8N is working!\nResponse: ${text.substring(0, 100)}...`);
                      }
                    } catch (error) {
                      alert(`❌ Test failed: ${error.message}`);
                    }
                  }}
                  variant="outline" 
                  size="sm"
                >
                  Test Empty Response
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