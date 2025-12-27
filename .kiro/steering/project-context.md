# Nimma Yatri Project Context

## Overview

Nimma Yatri is a hyper-local "Survival Tool" for Bengaluru, designed to help users navigate auto-rickshaw negotiations with confidence.

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **Maps:** @react-google-maps/api
- **AI Core:** Gemini Multimodal Live API (WebSockets)
- **State:** React Context for language management

## Design Philosophy

- **Vibe:** "Cyberpunk Bengaluru" meets "Gen-Z Utility"
- **Colors:** Auto-Rickshaw Yellow (#FFD700), Asphalt Grey, Signal Green
- **Effects:** Glassmorphism, tilt effects, smooth animations
- **Goal:** High-end consumer app feel, NOT a hackathon project

## Key Features

1. **The Auto-Whisperer:** Real-time AI negotiation assistant using Gemini Live
2. **The Reality Check:** Advanced fare calculator with Google Maps integration
3. **Kannada Confidence:** Audio deck of essential phrases
4. **The Fake Call:** Panic button with realistic police call simulation

## Local Context

All fare rules, slang, and AI persona are defined in `product.md` at the root.
This file serves as the "brain" of the application and should be referenced for:

- Fare calculation logic
- Kannada phrases and meanings
- AI persona instructions
- Area-specific tips

## File Structure

```
/app          - Next.js app router pages
/components   - React components
/hooks        - Custom hooks (useGeminiLive)
/lib          - Utilities and product data
/context      - React contexts (Language)
/assets       - Images and media
/public       - Static assets
```
