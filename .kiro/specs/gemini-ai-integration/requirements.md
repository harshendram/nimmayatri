# Requirements Document: Gemini AI Integration

## Introduction

This specification defines the integration of two distinct AI-powered features for the Nimma Yatri application: a standard text-based chatbot using Gemini's REST API and a real-time voice assistant using Gemini's Multimodal Live API over WebSockets. Both features will provide auto-rickshaw negotiation assistance with a modern, professional UI that matches the application's "Cyberpunk Bengaluru" aesthetic.

## Glossary

- **Chatbot**: A text-based conversational AI interface using Gemini's REST API (generateContent method)
- **Live_Assistant**: A real-time voice and text assistant using Gemini's WebSocket-based Live API (BidiGenerateContent)
- **REST_API**: Standard HTTP request-response API for text generation
- **WebSocket_API**: Bidirectional streaming connection for real-time audio/text communication
- **Gemini_2.5_Flash**: Primary model for standard text generation
- **Gemini_2.0_Flash**: Fallback model when 2.5 is unavailable
- **Native_Audio_Model**: gemini-2.5-flash-native-audio-preview-12-2025 for Live API
- **Auto_Bhaiya_Whisperer**: The AI persona defined in product.md
- **System**: The Nimma Yatri application

## Requirements

### Requirement 1: Standard Chatbot with Model Fallback

**User Story:** As a user, I want to chat with an AI assistant about auto-rickshaw negotiations using text, so that I can get advice without using voice input.

#### Acceptance Criteria

1. WHEN a user sends a text message to the chatbot, THE System SHALL attempt to use the gemini-2.5-flash model via REST API
2. IF the gemini-2.5-flash model is unavailable or returns an error, THEN THE System SHALL automatically retry with the gemini-2.0-flash model
3. WHEN the chatbot receives a response from either model, THE System SHALL display the response in the UI within 3 seconds
4. WHEN the API call fails after trying both models, THEN THE System SHALL display a user-friendly error message with retry option
5. THE Chatbot SHALL use the Auto_Bhaiya_Whisperer persona defined in product.md
6. WHEN a user types a message, THE System SHALL provide visual feedback indicating the message is being processed
7. THE Chatbot SHALL maintain conversation context for the current session

### Requirement 2: Real-Time Live Assistant with WebSocket

**User Story:** As a user, I want to interact with an AI assistant using voice in real-time, so that I can get immediate negotiation advice during live auto-rickshaw interactions.

#### Acceptance Criteria

1. WHEN a user activates the Live Assistant, THE System SHALL establish a WebSocket connection to the Gemini Live API using the gemini-2.5-flash-native-audio-preview-12-2025 model
2. WHEN the WebSocket connection is established, THE System SHALL send the setup message with the Auto_Bhaiya_Whisperer system instruction
3. WHEN a user speaks into their microphone, THE System SHALL capture audio and stream it to the Live API via WebSocket
4. WHEN the Live API responds, THE System SHALL display the text response in real-time as it streams
5. IF the WebSocket connection fails to establish, THEN THE System SHALL fall back to the standard chatbot with text-to-speech
6. WHEN the user stops speaking, THE System SHALL indicate that processing is complete
7. THE Live_Assistant SHALL support both voice input and text input simultaneously
8. WHEN the WebSocket connection is closed, THE System SHALL allow the user to reconnect with a single action

### Requirement 3: Modern Professional UI Components

**User Story:** As a user, I want a sleek, modern interface for both AI features, so that the app feels professional and easy to use.

#### Acceptance Criteria

1. THE System SHALL render the Chatbot and Live_Assistant as separate, visually distinct components
2. WHEN displaying the Chatbot, THE System SHALL use a card-based layout with glassmorphism effects matching the app's design system
3. WHEN displaying the Live_Assistant, THE System SHALL show a real-time connection status indicator (connected/disconnected)
4. WHEN a user is typing or speaking, THE System SHALL display animated visual feedback (typing indicators, voice waveforms)
5. WHEN AI responses are received, THE System SHALL animate the response appearance with smooth transitions
6. THE System SHALL use the application's color palette: Auto-Rickshaw Yellow (#FFD700), Asphalt Grey, Signal Green
7. WHEN displaying messages, THE System SHALL clearly distinguish between user messages and AI responses
8. THE System SHALL be fully responsive and work seamlessly on mobile devices (320px+) and desktop

### Requirement 4: Error Handling and Robustness

**User Story:** As a user, I want the AI features to handle errors gracefully, so that I always know what's happening and can recover from issues.

#### Acceptance Criteria

1. WHEN any API call fails, THE System SHALL log the error details to the console for debugging
2. WHEN a network error occurs, THE System SHALL display a specific error message indicating connectivity issues
3. WHEN an API returns a 404 error, THE System SHALL attempt the fallback model before showing an error
4. WHEN the WebSocket connection drops unexpectedly, THE System SHALL notify the user and provide a reconnect button
5. WHEN the user's microphone is unavailable, THE System SHALL display a message and disable voice input
6. WHEN API rate limits are exceeded, THE System SHALL display a message asking the user to wait and retry
7. THE System SHALL never crash or become unresponsive due to API errors
8. WHEN an error is resolved, THE System SHALL automatically clear error messages

### Requirement 5: API Configuration and Security

**User Story:** As a developer, I want secure API key management and proper configuration, so that the application is production-ready and secure.

#### Acceptance Criteria

1. THE System SHALL store the Gemini API key in environment variables (GEMINI_API_KEY)
2. WHEN making REST API calls, THE System SHALL use server-side API routes to protect the API key
3. WHEN establishing WebSocket connections, THE System SHALL use the client-side API key (NEXT_PUBLIC_GEMINI_API_KEY) only when necessary
4. THE System SHALL validate that API keys are present before attempting connections
5. WHEN API keys are missing, THE System SHALL display a configuration error message
6. THE System SHALL use HTTPS for all REST API calls
7. THE System SHALL use WSS (secure WebSocket) for all WebSocket connections

### Requirement 6: Integration with Existing Features

**User Story:** As a user, I want the new AI features to work seamlessly with existing app features, so that I have a cohesive experience.

#### Acceptance Criteria

1. THE Chatbot SHALL be accessible from the main application page alongside other features
2. THE Live_Assistant SHALL be accessible from the main application page alongside other features
3. WHEN a user switches between Chatbot and Live_Assistant, THE System SHALL preserve the state of each component
4. THE System SHALL use the existing LanguageContext for multi-language support
5. THE System SHALL follow the existing design patterns (Framer Motion animations, Tailwind CSS classes)
6. THE Chatbot and Live_Assistant SHALL reference fare calculation data from lib/productData.ts
7. THE System SHALL maintain the Auto_Bhaiya_Whisperer persona consistently across both features

### Requirement 7: Performance and Optimization

**User Story:** As a user, I want fast, responsive AI interactions, so that I can get advice quickly during time-sensitive negotiations.

#### Acceptance Criteria

1. WHEN a user sends a message, THE System SHALL display a loading indicator within 100ms
2. THE Chatbot SHALL receive and display responses within 3 seconds under normal network conditions
3. THE Live_Assistant SHALL stream responses with less than 500ms latency
4. THE System SHALL debounce rapid user inputs to prevent excessive API calls
5. WHEN the user navigates away from the AI components, THE System SHALL clean up WebSocket connections and cancel pending requests
6. THE System SHALL limit conversation history to the last 10 messages to optimize memory usage
7. THE System SHALL use React hooks efficiently to prevent unnecessary re-renders

### Requirement 8: Accessibility and User Experience

**User Story:** As a user with accessibility needs, I want the AI features to be usable with assistive technologies, so that everyone can benefit from the app.

#### Acceptance Criteria

1. THE System SHALL provide keyboard navigation for all interactive elements
2. WHEN using screen readers, THE System SHALL announce AI responses as they arrive
3. THE System SHALL use sufficient color contrast (WCAG AA standard) for all text
4. WHEN voice input is active, THE System SHALL provide clear visual indicators for users who cannot hear audio feedback
5. THE System SHALL support text input as an alternative to voice input for all features
6. THE System SHALL use semantic HTML elements for proper structure
7. WHEN errors occur, THE System SHALL announce them to screen readers
