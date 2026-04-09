// User & Auth
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

// Agent Results
export interface AgentResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// Tool Definition for Claude function calling
export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, any>;
    required: string[];
  };
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
