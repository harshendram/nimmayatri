# Design Document: Gemini AI Integration

## Overview

This design implements two distinct AI-powered features for the Nimma Yatri application:

1. **Standard Chatbot Component** - A text-based conversational interface using Gemini's REST API with automatic fallback from gemini-2.5-flash to gemini-2.0-flash
2. **Live Voice Assistant Component** - A real-time voice and text assistant using Gemini's Multimodal Live API over WebSockets with the gemini-2.5-flash-native-audio-preview-12-2025 model

Both components will feature a modern, professional UI matching the application's "Cyberpunk Bengaluru" aesthetic with glassmorphism effects, smooth animations, and responsive design.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │  ChatbotComponent    │      │ LiveAssistantComponent│        │
│  │  (Text-based)        │      │ (Voice + Text)        │        │
│  │                      │      │                       │        │
│  │  - Message Input     │      │  - Voice Input        │        │
│  │  - Chat History      │      │  - Text Input         │        │
│  │  - Quick Prompts     │      │  - Real-time Stream   │        │
│  │  - Loading States    │      │  - Connection Status  │        │
│  └──────────┬───────────┘      └──────────┬────────────┘        │
│             │                             │                     │
│             │                             │                     │
│  ┌──────────▼───────────┐      ┌─────────▼─────────────┐       │
│  │  useChatbot Hook     │      │  useGeminiLive Hook   │       │
│  │  (State Management)  │      │  (WebSocket + State)  │       │
│  └──────────┬───────────┘      └──────────┬────────────┘       │
│             │                             │                     │
└─────────────┼─────────────────────────────┼─────────────────────┘
              │                             │
              │ HTTP POST                   │ WebSocket (wss://)
              │                             │
┌─────────────▼─────────────────────────────▼─────────────────────┐
│                         BACKEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │ /api/chatbot         │      │ /api/gemini-live     │        │
│  │ (REST Endpoint)      │      │ (WebSocket Config)   │        │
│  │                      │      │                       │        │
│  │  - Model Fallback    │      │  - WS URL Provider   │        │
│  │  - Error Handling    │      │  - Config Provider   │        │
│  │  - Response Format   │      │  - Fallback Handler  │        │
│  └──────────┬───────────┘      └──────────────────────┘        │
│             │                                                    │
└─────────────┼────────────────────────────────────────────────────┘
              │
              │ HTTPS
              │
┌─────────────▼────────────────────────────────────────────────────┐
│                    GOOGLE GEMINI API                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐      ┌──────────────────────┐         │
│  │ REST API             │      │ Live API (WebSocket) │         │
│  │                      │      │                       │         │
│  │ - gemini-2.5-flash   │      │ - gemini-2.5-flash-  │         │
│  │ - gemini-2.0-flash   │      │   native-audio-      │         │
│  │   (fallback)         │      │   preview-12-2025    │         │
│  └──────────────────────┘      └──────────────────────┘         │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
app/page.tsx
├── ChatbotComponent
│   ├── MessageList
│   │   ├── UserMessage
│   │   └── AIMessage
│   ├── MessageInput
│   ├── QuickPrompts
│   └── LoadingIndicator
│
└── LiveAssistantComponent
    ├── ConnectionStatus
    ├── VoiceInput
    │   ├── MicrophoneButton
    │   └── WaveformVisualizer
    ├── TextInput
    ├── StreamingResponse
    └── ErrorDisplay
```

## Components and Interfaces

### 1. ChatbotComponent

**Purpose:** Provides a text-based chat interface with AI negotiation assistant

**Props:**

```typescript
interface ChatbotComponentProps {
  className?: string;
  maxMessages?: number; // Default: 50
  autoFocus?: boolean; // Default: true
}
```

**State:**

```typescript
interface ChatbotState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentModel: "gemini-2.5-flash" | "gemini-2.0-flash" | null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  model?: string;
}
```

**Key Features:**

- Message history with scroll-to-bottom
- Quick prompt buttons for common scenarios
- Typing indicator with animated dots
- Error display with retry button
- Model indicator showing which Gemini version responded
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)

### 2. LiveAssistantComponent

**Purpose:** Provides real-time voice and text interaction with AI assistant

**Props:**

```typescript
interface LiveAssistantComponentProps {
  className?: string;
  autoConnect?: boolean; // Default: false
  enableVoice?: boolean; // Default: true
}
```

**State:**

```typescript
interface LiveAssistantState {
  isConnected: boolean;
  isLiveMode: boolean; // true if WebSocket, false if REST fallback
  isListening: boolean;
  transcript: string;
  aiResponse: string;
  error: string | null;
  isLoading: boolean;
  connectionQuality: "excellent" | "good" | "poor" | "disconnected";
}
```

**Key Features:**

- WebSocket connection with automatic reconnection
- Voice input with waveform visualization
- Real-time streaming text responses
- Connection status indicator with quality metrics
- Fallback to REST API when WebSocket unavailable
- Microphone permission handling
- Voice activity detection

### 3. useChatbot Hook

**Purpose:** Manages chatbot state and API communication with model fallback

**Interface:**

```typescript
interface UseChatbotReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentModel: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
}

function useChatbot(): UseChatbotReturn;
```

**Implementation Details:**

- Maintains message history in state
- Implements automatic retry with model fallback
- Handles API errors gracefully
- Debounces rapid message sends
- Cleans up pending requests on unmount

### 4. useGeminiLive Hook (Enhanced)

**Purpose:** Manages WebSocket connection and real-time communication

**Interface:**

```typescript
interface UseGeminiLiveReturn {
  isConnected: boolean;
  isLiveMode: boolean;
  isListening: boolean;
  transcript: string;
  aiResponse: string;
  error: string | null;
  isLoading: boolean;
  connectionQuality: "excellent" | "good" | "poor" | "disconnected";
  startSession: () => Promise<void>;
  stopSession: () => void;
  sendText: (text: string) => Promise<void>;
  startVoice: () => void;
  stopVoice: () => void;
  reconnect: () => Promise<void>;
}

function useGeminiLive(): UseGeminiLiveReturn;
```

**Implementation Details:**

- Establishes WebSocket connection with setup message
- Handles binary audio streaming
- Implements automatic reconnection with exponential backoff
- Falls back to REST API when WebSocket fails
- Monitors connection quality based on latency
- Cleans up resources on unmount

### 5. API Routes

#### /api/chatbot (NEW)

**Purpose:** Server-side endpoint for text-based chat with model fallback

**Request:**

```typescript
interface ChatbotRequest {
  message: string;
  conversationHistory?: Message[]; // Optional context
}
```

**Response:**

```typescript
interface ChatbotResponse {
  response: string;
  model: "gemini-2.5-flash" | "gemini-2.0-flash";
  timestamp: number;
}

interface ChatbotErrorResponse {
  error: string;
  code: string;
  retryable: boolean;
}
```

**Logic Flow:**

1. Validate request body
2. Attempt API call with gemini-2.5-flash
3. If 404 or model error, retry with gemini-2.0-flash
4. If both fail, return error with retryable flag
5. Format and return response

#### /api/gemini-live (ENHANCED)

**Purpose:** Provides WebSocket configuration and fallback endpoint

**GET Response:**

```typescript
interface GeminiLiveConfig {
  wsUrl: string;
  model: string;
  config: {
    response_modalities: string[];
    system_instruction: {
      parts: Array<{ text: string }>;
    };
  };
}
```

**POST Request/Response:** (Fallback when WebSocket unavailable)

```typescript
interface LiveFallbackRequest {
  message: string;
}

interface LiveFallbackResponse {
  response: string;
  mode: "fallback";
}
```

## Data Models

### Message Model

```typescript
interface Message {
  id: string; // UUID v4
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number; // Unix timestamp in milliseconds
  model?: "gemini-2.5-flash" | "gemini-2.0-flash" | "native-audio";
  metadata?: {
    latency?: number; // Response time in ms
    tokens?: number; // Token count if available
    error?: boolean; // True if this was an error message
  };
}
```

### WebSocket Message Formats

**Setup Message (Client → Server):**

```typescript
interface SetupMessage {
  setup: {
    model: string;
    generation_config: {
      response_modalities: string[];
      temperature?: number;
      max_output_tokens?: number;
    };
    system_instruction: {
      parts: Array<{ text: string }>;
    };
  };
}
```

**Client Content Message (Client → Server):**

```typescript
interface ClientContentMessage {
  clientContent: {
    turns: Array<{
      role: "user";
      parts: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }>;
    }>;
    turnComplete: boolean;
  };
}
```

**Server Content Message (Server → Client):**

```typescript
interface ServerContentMessage {
  serverContent?: {
    modelTurn?: {
      parts: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }>;
    };
    turnComplete?: boolean;
  };
  setupComplete?: boolean;
}
```

### Error Model

```typescript
interface APIError {
  code: string; // 'NETWORK_ERROR', 'MODEL_ERROR', 'RATE_LIMIT', etc.
  message: string; // User-friendly error message
  details?: string; // Technical details for debugging
  retryable: boolean; // Whether the operation can be retried
  retryAfter?: number; // Seconds to wait before retry (for rate limits)
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection Analysis

After analyzing all acceptance criteria, I identified several redundancies:

- Requirements 1.3 and 7.2 both test response time (consolidated into Property 3)
- Requirements 1.2 and 4.3 both test 404 fallback (consolidated into Property 1)
- Requirements 1.5 and 6.7 both test persona consistency (consolidated into Property 16)
- Requirements 1.6 and 7.1 both test loading indicator timing (consolidated into Property 12)
- Several UI-specific requirements (3.2, 3.5, 3.6, 3.7) are better tested as examples rather than properties

The following properties represent the unique, testable behaviors that provide comprehensive coverage:

### Property 1: Model Fallback Consistency

_For any_ valid user message sent to the chatbot, if the gemini-2.5-flash model fails with a 404 or model-not-found error, then the system should automatically retry with gemini-2.0-flash and return a response without user intervention.

**Validates: Requirements 1.2, 4.3**

### Property 2: Primary Model Attempt

_For any_ user message sent to the chatbot, the system should first attempt to use the gemini-2.5-flash model before any fallback occurs.

**Validates: Requirements 1.1**

### Property 3: Response Time Performance

_For any_ user message sent to the chatbot, the system should receive and display a response within 3 seconds under normal network conditions (non-timeout scenarios).

**Validates: Requirements 1.3, 7.2**

### Property 4: Complete Error Handling

_For any_ API error (network, rate limit, model error, WebSocket failure), the system should log error details to console, display a user-friendly error message, and provide a retry mechanism when the error is retryable.

**Validates: Requirements 4.1, 4.2, 4.4, 4.6, 4.7**

### Property 5: Error State Cleanup

_For any_ error state displayed to the user, when a subsequent successful request completes, the error message should be automatically cleared from the UI.

**Validates: Requirements 4.8**

### Property 6: WebSocket Fallback Reliability

_For any_ attempt to establish a WebSocket connection, if the connection fails to establish or returns an error, then the system should automatically fall back to REST API mode and notify the user of the fallback.

**Validates: Requirements 2.5**

### Property 7: WebSocket Setup Message

_For any_ successful WebSocket connection establishment, the system should send a setup message containing the gemini-2.5-flash-native-audio-preview-12-2025 model identifier and the Auto_Bhaiya_Whisperer system instruction.

**Validates: Requirements 2.1, 2.2**

### Property 8: Message Ordering Preservation

_For any_ sequence of messages sent by the user, the displayed conversation history should maintain the exact chronological order of user messages and AI responses, with no messages lost or duplicated.

**Validates: Requirements 1.7**

### Property 9: Response Streaming Integrity

_For any_ streaming response from the Live API, each text chunk received should be appended to the display in the order received, with no chunks lost or displayed out of order.

**Validates: Requirements 2.4**

### Property 10: Resource Cleanup on Unmount

_For any_ active session (chatbot or live assistant), when the component unmounts or the user navigates away, all WebSocket connections should be closed, pending API requests should be cancelled, and microphone streams should be stopped.

**Validates: Requirements 7.5**

### Property 11: Debounce Effectiveness

_For any_ rapid sequence of user inputs (typing or clicking send multiple times within 500ms), the system should debounce requests to ensure at most one API call is made per 500ms interval.

**Validates: Requirements 7.4**

### Property 12: Loading Indicator Responsiveness

_For any_ user message send action, the system should display a loading indicator within 100ms of the action being triggered.

**Validates: Requirements 1.6, 7.1**

### Property 13: Connection State UI Consistency

_For any_ WebSocket connection state change (connecting, connected, disconnected, error), the UI should accurately reflect the current state and provide appropriate visual feedback.

**Validates: Requirements 3.3, 3.4**

### Property 14: API Key Validation

_For any_ API request (REST or WebSocket), if the API key is missing or invalid, the system should fail gracefully with a configuration error message before attempting the request.

**Validates: Requirements 5.4, 5.5**

### Property 15: Microphone Permission Handling

_For any_ attempt to use voice input, if the user's microphone is unavailable or permission is denied, the system should display an error message and disable voice input while keeping text input available.

**Validates: Requirements 4.5**

### Property 16: Persona Consistency

_For any_ API request (chatbot or live assistant), the system should include the Auto_Bhaiya_Whisperer persona from product.md in the system instruction, ensuring consistent AI behavior across both features.

**Validates: Requirements 1.5, 6.7**

### Property 17: State Preservation on Component Switch

_For any_ user interaction that switches between Chatbot and Live_Assistant components, the state of each component (messages, connection status, input text) should be preserved and restored when switching back.

**Validates: Requirements 6.3**

### Property 18: Conversation History Limit

_For any_ chatbot session, the system should limit the conversation history to the last 10 messages to optimize memory usage, removing older messages when the limit is exceeded.

**Validates: Requirements 7.6**

### Property 19: Streaming Latency Performance

_For any_ streaming response from the Live API, the latency between receiving a chunk and displaying it should be less than 500ms.

**Validates: Requirements 7.3**

### Property 20: Keyboard Navigation Completeness

_For any_ interactive element in both components (buttons, inputs, message list), users should be able to navigate using only keyboard (Tab, Enter, Escape) and trigger all actions without requiring a mouse.

**Validates: Requirements 8.1**

### Property 21: Visual Feedback for Voice Input

_For any_ active voice input session, the system should display clear visual indicators (waveform animation, recording badge) that are visible to users who cannot hear audio feedback.

**Validates: Requirements 8.4**

### Property 22: Mobile Responsiveness

_For any_ screen width from 320px to 2560px, both components should render without horizontal scrolling, maintain readability, and keep all interactive elements accessible and properly sized.

**Validates: Requirements 3.8**

## Error Handling

### Error Categories

1. **Network Errors**

   - Connection timeout
   - DNS resolution failure
   - Network unreachable
   - **Handling:** Display "Connection issue. Check your internet." with retry button

2. **API Errors**

   - 404 Model Not Found → Trigger fallback
   - 429 Rate Limit → Display wait time and auto-retry
   - 401 Unauthorized → Display configuration error
   - 500 Server Error → Display "Service temporarily unavailable" with retry
   - **Handling:** Log to console, show user-friendly message, provide retry when applicable

3. **WebSocket Errors**

   - Connection refused
   - Connection dropped
   - Invalid message format
   - **Handling:** Attempt reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s), fall back to REST after 3 failed attempts

4. **Client Errors**
   - Microphone permission denied → Display message and disable voice input
   - Browser not supported → Display compatibility message
   - Invalid user input → Validate and show inline error
   - **Handling:** Graceful degradation, clear user guidance

### Error Recovery Strategies

```typescript
interface ErrorRecoveryStrategy {
  maxRetries: number;
  retryDelay: number; // milliseconds
  backoffMultiplier: number;
  fallbackAction?: () => void;
}

const strategies: Record<string, ErrorRecoveryStrategy> = {
  MODEL_NOT_FOUND: {
    maxRetries: 1,
    retryDelay: 0,
    backoffMultiplier: 1,
    fallbackAction: () => retryWithFallbackModel(),
  },
  RATE_LIMIT: {
    maxRetries: 3,
    retryDelay: 5000,
    backoffMultiplier: 2,
  },
  NETWORK_ERROR: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
  },
  WEBSOCKET_ERROR: {
    maxRetries: 3,
    retryDelay: 1000,
    backoffMultiplier: 2,
    fallbackAction: () => switchToRESTMode(),
  },
};
```

## Testing Strategy

### Dual Testing Approach

This feature will use both **unit tests** and **property-based tests** to ensure comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and error conditions
- **Property tests** verify universal properties across all inputs
- Both are complementary and necessary for comprehensive coverage

### Unit Testing

**Focus Areas:**

- Specific API response formats
- Error handling for known error codes (404, 429, 500)
- UI component rendering with different props
- WebSocket message parsing
- Model fallback logic with specific scenarios

**Example Unit Tests:**

```typescript
describe("ChatbotComponent", () => {
  it("should display user message immediately after send", () => {});
  it("should show loading indicator while waiting for response", () => {});
  it("should handle empty message input gracefully", () => {});
  it("should retry with gemini-2.0-flash when 2.5 returns 404", () => {});
});

describe("useGeminiLive", () => {
  it("should establish WebSocket connection on startSession", () => {});
  it("should fall back to REST when WebSocket fails", () => {});
  it("should clean up resources on unmount", () => {});
});
```

### Property-Based Testing

**Testing Library:** fast-check (for TypeScript/JavaScript)

**Configuration:**

- Minimum 100 iterations per property test
- Each test tagged with: `Feature: gemini-ai-integration, Property {number}: {property_text}`

**Property Test Examples:**

```typescript
import fc from "fast-check";

// Property 1: Model Fallback Consistency
describe("Property 1: Model Fallback Consistency", () => {
  it("should always retry with fallback model on 404", () => {
    fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }), // Random user messages
        async (message) => {
          // Mock 2.5 to return 404
          mockGemini25Flash.mockRejectedValue({ status: 404 });
          mockGemini20Flash.mockResolvedValue({
            response: "fallback response",
          });

          const result = await sendMessage(message);

          // Should have called fallback model
          expect(mockGemini20Flash).toHaveBeenCalled();
          expect(result.model).toBe("gemini-2.0-flash");
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Property 3: Message Ordering Preservation
describe("Property 3: Message Ordering Preservation", () => {
  it("should maintain chronological order for any message sequence", () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }), // Random message sequences
        async (messages) => {
          const timestamps: number[] = [];

          for (const msg of messages) {
            const result = await sendMessage(msg);
            timestamps.push(result.timestamp);
          }

          // Timestamps should be strictly increasing
          for (let i = 1; i < timestamps.length; i++) {
            expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Property 9: Debounce Effectiveness
describe("Property 9: Debounce Effectiveness", () => {
  it("should limit API calls to one per 500ms for any rapid input", () => {
    fc.assert(
      fc.asyncProperty(
        fc.array(fc.string(), { minLength: 5, maxLength: 20 }), // Rapid messages
        async (messages) => {
          const startTime = Date.now();
          const apiCallTimes: number[] = [];

          // Send all messages rapidly
          await Promise.all(messages.map((msg) => sendMessage(msg)));

          // Count API calls
          const callCount = mockAPI.mock.calls.length;
          const duration = Date.now() - startTime;

          // Should have at most duration/500 + 1 calls
          const maxExpectedCalls = Math.ceil(duration / 500) + 1;
          expect(callCount).toBeLessThanOrEqual(maxExpectedCalls);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**Focus Areas:**

- End-to-end message flow (user input → API → display)
- WebSocket connection lifecycle
- Model fallback in real scenarios
- Error recovery flows

### Manual Testing Checklist

- [ ] Voice input works on Chrome, Firefox, Safari
- [ ] WebSocket connection establishes successfully
- [ ] Fallback to REST works when WebSocket unavailable
- [ ] UI is responsive on mobile (320px, 375px, 414px)
- [ ] UI is responsive on tablet (768px, 1024px)
- [ ] UI is responsive on desktop (1280px, 1920px)
- [ ] Keyboard navigation works for all interactions
- [ ] Screen reader announces messages correctly
- [ ] Error messages are clear and actionable
- [ ] Loading states are visible and smooth

## UI/UX Design Specifications

### Color Palette

```typescript
const colors = {
  primary: "#FFD700", // Auto-Rickshaw Yellow
  primaryDark: "#E6C200",
  background: "#1a1a2e", // Asphalt
  backgroundLight: "#2a2a3e",
  success: "#00FF88", // Signal Green
  error: "#FF4444", // Signal Red
  accent: "#8B5CF6", // Bengaluru Purple
  text: "#FFFFFF",
  textMuted: "#9CA3AF",
  border: "rgba(255, 255, 255, 0.1)",
};
```

### Typography

```typescript
const typography = {
  fontFamily: {
    luxury: "Playfair Display, serif",
    modern: "Outfit, sans-serif",
    body: "Poppins, sans-serif",
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
  },
};
```

### Component Styling

**ChatbotComponent:**

- Glass-dark background with blur effect
- Rounded corners (16px on mobile, 24px on desktop)
- Message bubbles with distinct colors (user: yellow gradient, AI: white/10)
- Smooth scroll behavior with fade-in animations
- Input field with focus glow effect

**LiveAssistantComponent:**

- Similar glass-dark background
- Connection status badge with pulse animation
- Waveform visualizer with 5 bars (animated)
- Microphone button with recording pulse effect
- Streaming text with typewriter effect

### Animations

```typescript
const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  pulse: {
    animate: { scale: [1, 1.05, 1] },
    transition: { repeat: Infinity, duration: 2 },
  },
  waveform: {
    animate: { scaleY: [0.3, 1, 0.3] },
    transition: { repeat: Infinity, duration: 0.5 },
  },
};
```

### Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: "320px",
  mobileLarge: "414px",
  tablet: "768px",
  desktop: "1024px",
  desktopLarge: "1280px",
};
```

## Performance Considerations

1. **Lazy Loading:** Components loaded on-demand
2. **Memoization:** Use React.memo for message components
3. **Virtual Scrolling:** For message lists > 50 messages
4. **Debouncing:** 500ms for text input, 300ms for voice activity detection
5. **Connection Pooling:** Reuse WebSocket connections when possible
6. **Request Cancellation:** Cancel pending requests on unmount
7. **Image Optimization:** Use Next.js Image component for assets
8. **Code Splitting:** Separate bundles for chatbot and live assistant

## Security Considerations

1. **API Key Protection:** Server-side API routes for REST calls
2. **Input Sanitization:** Sanitize all user inputs before sending to API
3. **Rate Limiting:** Client-side rate limiting (max 10 requests/minute)
4. **CORS:** Proper CORS configuration for WebSocket connections
5. **Content Security Policy:** Restrict inline scripts and external resources
6. **Error Message Sanitization:** Never expose API keys or internal details in error messages
