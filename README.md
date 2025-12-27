# 🛺 Nimma Yatri

> Your AI-powered Bengaluru Auto Survival Tool

A hyper-local web application that helps Bengaluru commuters navigate auto-rickshaw negotiations with confidence. Built with Next.js 14, Gemini AI, and a whole lot of local knowledge.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nimma-yatri)

## ✨ Features

### 🎯 The Reality Check (Fare Calculator)

- Google Maps integration for accurate distance calculation
- Government meter rate calculations
- "Won-and-Half" toggle for common driver pricing
- Rain/Surge and Night rate modifiers
- **Scam-O-Meter™** - Visual gauge showing Fair → Scam range with price per km indicators

### 🎙️ The Auto-Whisperer (Live AI Assistant)

- Real-time negotiation assistance powered by Gemini Live API
- Voice input with WebSocket streaming
- AI persona trained on Bengaluru auto culture
- Quick scenario prompts for common situations
- Video input support (webcam + screen share)

### 🗣️ Kannada Confidence (Phrase Deck)

- Essential Kannada phrases with audio playback
- Tilt-effect cards with smooth animations
- Text-to-Speech pronunciation guide
- Usage context for each phrase

### 🚨 The Fake Call (Panic Button)

- Realistic incoming police call simulation
- Audio playback with stern police voice
- Emergency contact quick-dial
- Designed to deter scammy drivers

### 💬 AI Chatbot

- Text-based negotiation assistant
- Automatic model fallback (Gemini 2.5 → 2.0)
- Quick prompts for common scenarios
- Markdown-formatted responses

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Google Maps API Key ([Get one here](https://console.cloud.google.com/))
- Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/nimma-yatri.git
cd nimma-yatri

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Create a `.env.local` file with:

```env
# Google Maps API Key (for fare calculator)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Gemini API Key (for AI features)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. **One-Click Deploy**

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nimma-yatri)

2. **Manual Deploy**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

3. **Add Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY`
   - `GEMINI_API_KEY`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **Maps:** @react-google-maps/api
- **AI:** Gemini Multimodal Live API (WebSockets)
- **Audio:** Web Audio API with AudioWorklet
- **Icons:** Lucide React

## 📁 Project Structure

```
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   │   ├── chatbot/    # REST chatbot endpoint
│   │   ├── fare/       # Fare calculation
│   │   └── gemini-live/# WebSocket config
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main page
├── components/          # React components
│   ├── Chatbot.tsx
│   ├── FareCalculator.tsx
│   ├── FloatingLiveAssistant.tsx
│   ├── KannadaPhrases.tsx
│   ├── PanicButton.tsx
│   └── ...
├── context/            # React contexts
│   ├── LanguageContext.tsx
│   └── LiveAssistantContext.tsx
├── hooks/              # Custom hooks
│   ├── useChatbot.ts
│   ├── useGeminiLive.ts
│   ├── useScreenCapture.ts
│   └── useWebcam.ts
├── lib/                # Utilities
│   ├── audio-recorder.ts
│   ├── audio-streamer.ts
│   ├── multimodal-live-client.ts
│   ├── productData.ts
│   └── worklets/       # AudioWorklet processors
├── public/assets/      # Static assets
└── product.md          # AI brain & local knowledge
```

## 🎨 Design System

- **Primary:** Auto-Rickshaw Yellow (#FFD700)
- **Background:** Asphalt Grey (#2D2D2D)
- **Success:** Signal Green (#00FF88)
- **Danger:** Signal Red (#FF4444)
- **Accent:** Bengaluru Purple (#8B5CF6)

**Design Philosophy:** "Cyberpunk Bengaluru" meets "Gen-Z Utility"

## 🧠 The product.md Constraint

All local knowledge, fare rules, and AI persona instructions are stored in `product.md`. This allows easy editing of the application's "brain" without touching code.

## 📱 Features in Detail

### Scam-O-Meter™

Professional speedometer-style gauge showing:

- Price per km thresholds (₹20/km, ₹30/km, ₹40+/km)
- Color-coded zones (Green = Fair, Yellow = Negotiate, Red = Scam)
- Animated needle with spring physics
- Real-time fare status

### Live Voice Assistant

- WebSocket connection to Gemini Live API
- Real-time audio streaming (16kHz input, 24kHz output)
- Voice activity detection
- Screen sharing and webcam support
- Draggable on mobile, expandable/minimizable
- Desktop enlarge mode (600px × 80vh)

### AI Chatbot

- REST API with automatic fallback
- Model: gemini-2.5-flash → gemini-2.0-flash
- Debounced requests (500ms)
- Message history limit (10 messages)
- Error handling with retry

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Key Files

- `product.md` - AI persona and local knowledge
- `lib/productData.ts` - Static data (areas, phrases)
- `context/LiveAssistantContext.tsx` - Live assistant state
- `lib/multimodal-live-client.ts` - WebSocket client

## 🐛 Troubleshooting

### ChunkLoadError

Already fixed with optimized webpack config. If you still see it:

```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Google Maps Not Loading

- Verify API key in `.env.local`
- Enable required APIs in Google Cloud Console
- Check browser console for errors

### Gemini API Issues

- Verify API key is valid
- Check API quota in Google AI Studio
- Ensure WebSocket connection is allowed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this for your own city!

## 🙏 Acknowledgments

- Built for Kiro Week 5 Challenge: "The Local Guide"
- Inspired by every Bengaluru commuter who's been overcharged
- Powered by Gemini AI and Google Maps

## 📞 Support

- **Documentation:** [DEPLOYMENT.md](./DEPLOYMENT.md), [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Issues:** [GitHub Issues](https://github.com/yourusername/nimma-yatri/issues)

---

Made with ❤️ for Bengaluru commuters

**Status:** 🟢 Production Ready | **Version:** 1.0.0 | **Last Updated:** December 27, 2025
