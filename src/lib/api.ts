// API Configuration and Service for N8N Integration

// Default configuration - will be updated with actual N8N webhook URL
const API_CONFIG = {
  baseURL: import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://shubh123456.app.n8n.cloud/webhook-test/62c21d28-be46-45f3-a0f3-9ee500889a92',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    // Add any authentication headers here if needed
    // 'Authorization': 'Bearer your_token_here',
  },
};

// Types for API communication
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface APIRequest {
  message?: string;
  text?: string;
  input?: string;
  query?: string;
  conversationId?: string;
  userId?: string;
  sessionId?: string;
  // Flexible format for N8N webhooks
  [key: string]: any;
}

export interface APIResponse {
  response: string;
  conversationId?: string;
  status: 'success' | 'error';
  error?: string;
  // Add any other fields your N8N webhook returns
}

// API Service Class
class SylphieAPI {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
    this.headers = API_CONFIG.headers;
  }

  // Update configuration (useful for dynamic setup)
  updateConfig(config: Partial<typeof API_CONFIG>) {
    if (config.baseURL) this.baseURL = config.baseURL;
    if (config.timeout) this.timeout = config.timeout;
    if (config.headers) this.headers = { ...this.headers, ...config.headers };
  }

  // Send message to N8N webhook
  async sendMessage(request: APIRequest): Promise<APIResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response formats from N8N
      if (data.error) {
        return {
          response: data.error,
          status: 'error',
          error: data.error,
        };
      }

      // Handle various JSON response formats
      let responseText = '';
      
      if (typeof data === 'string') {
        // If response is a string
        responseText = data;
      } else if (data.response) {
        // Standard response field
        responseText = data.response;
      } else if (data.message) {
        // Message field
        responseText = data.message;
      } else if (data.text) {
        // Text field
        responseText = data.text;
      } else if (data.answer) {
        // Answer field (common in AI responses)
        responseText = data.answer;
      } else if (data.output) {
        // Output field
        responseText = data.output;
      } else if (data.result) {
        // Result field
        responseText = data.result;
      } else {
        // If it's a complex JSON object, stringify it nicely
        try {
          responseText = JSON.stringify(data, null, 2);
        } catch {
          responseText = 'Received response but could not parse it properly.';
        }
      }

      return {
        response: responseText || 'No response received',
        conversationId: data.conversationId || data.sessionId || data.id,
        status: 'success',
      };
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            response: 'Request timed out. Please try again.',
            status: 'error',
            error: 'Timeout',
          };
        }
        
        return {
          response: `Connection error: ${error.message}`,
          status: 'error',
          error: error.message,
        };
      }

      return {
        response: 'An unexpected error occurred. Please try again.',
        status: 'error',
        error: 'Unknown error',
      };
    }
  }

  // Test connection to N8N webhook
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.sendMessage({
        message: 'Hello, this is a connection test.',
      });
      return response.status === 'success';
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const sylphieAPI = new SylphieAPI();

// Export configuration for easy updates
export { API_CONFIG };
