# QBeatAI Phase 2 - Voice Ordering Setup Guide

## Overview

Phase 2 adds real-time voice ordering capabilities to your existing QBeatAI app using:
- **LiveKit**: Real-time audio infrastructure (WebRTC)
- **Groq**: Ultra-fast Whisper STT (~100ms response time)
- **OpenAI**: GPT-4 for conversation logic + TTS for responses

## 🚀 Quick Start

### 1. Install New Dependencies

```bash
# In your main project directory
npm install @livekit/components-react livekit-client livekit-server-sdk

# In the voice-agent directory
cd voice-agent
pip install -r requirements.txt
```

### 2. Get Required API Keys

#### LiveKit (Free Tier: 10,000 minutes/month)
1. Sign up at https://cloud.livekit.io
2. Create a new project
3. Copy your API Key, Secret Key, and WebSocket URL
4. Add to your `.env.local`

#### Groq (Free API for fast Whisper STT)
1. Sign up at https://console.groq.com
2. Generate an API key at https://console.groq.com/keys
3. Add to your `.env.local`

#### OpenAI (Use existing key from Phase 1)
1. Use your existing OpenAI API key
2. Add to your `.env.local`

### 3. Configure Environment Variables

Update your `.env.local` file:
```bash
# Existing Phase 1 variables
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=orders@chaupain.com

# New Phase 2 variables
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-secret-key
LIVEKIT_URL=wss://your-livekit-cloud-url.com
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-cloud-url.com

GROQ_API_KEY=gsk_your-groq-api-key
OPENAI_API_KEY=sk-your-openai-key
```

Create `voice-agent/.env`:
```bash
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-secret-key
LIVEKIT_URL=ws://localhost:7880
GROQ_API_KEY=gsk_your-groq-api-key
OPENAI_API_KEY=sk-your-openai-key
WEBAPP_URL=http://localhost:3000
```

### 4. Run Both Services

```bash
# Terminal 1: Next.js app (existing Phase 1)
npm run dev

# Terminal 2: Voice Agent (new Phase 2)
cd voice-agent
python main.py
```

## 🎤 How to Use Voice Ordering

1. **Start Voice Session**: Click the 🎤 button (bottom-left of screen)
2. **Grant Permissions**: Allow microphone access when prompted
3. **Natural Conversation**: 
   - "I'd like breakfast"
   - "What's in the Sunrise Croissant?"
   - "One Croissant with bacon, please"
4. **Complete Order**: "That's it" → "Yes, place the order"

## 📁 New Files Added

```
qbeatai/
├── pages/api/
│   ├── voice-session.js          # Creates LiveKit sessions
│   ├── sync-voice-cart.js        # Syncs voice cart with UI
│   └── submit-voice-order.js     # Submits voice orders
├── components/
│   ├── VoiceOrderButton.js       # Floating voice button
│   └── VoiceOrderInterface.js    # Voice ordering modal
└── voice-agent/                  # Python voice service
    ├── requirements.txt          # Python dependencies
    ├── env-example.txt          # Environment variables
    ├── agent.py                 # Voice agent logic
    └── main.py                  # LiveKit agent entry point
```

## ✨ New Features Added

### Frontend Features
- **🎤 Voice Button**: Floating microphone icon (bottom-left)
- **🎙️ Voice Interface**: Modal with real-time status and transcript
- **🔊 Audio Visualizer**: Visual feedback during conversation
- **🔄 Cart Sync**: Voice orders automatically sync with visual cart
- **📱 Mobile Support**: Works on all devices via WebRTC

### Backend Features
- **🚀 Real-time Audio**: LiveKit WebRTC infrastructure
- **⚡ Fast STT**: Groq Whisper (~100ms response time)
- **🧠 Smart Conversation**: GPT-4 powered natural language processing
- **📧 Email Integration**: Voice orders email just like text orders
- **🛡️ Error Handling**: Graceful fallbacks to text mode

## 🎯 Voice Ordering Flow

1. **Customer**: "I'd like breakfast"
2. **Assistant**: "Great! Popular breakfast items: La Tartine for $8, Sunrise Croissant for $12, Granola Parfait for $9. Which interests you?"
3. **Customer**: "Tell me about the croissant"
4. **Assistant**: "Sunrise Croissant - Three fresh-cracked scrambled eggs, cheddar cheese and pistachio pesto aioli. $12. Add-ons available: Avocado, Bacon or ham"
5. **Customer**: "One croissant with bacon please"
6. **Assistant**: "Added 1 Sunrise Croissant with Bacon or ham for $14.00. What else?"
7. **Customer**: "That's it"
8. **Assistant**: "Perfect! Your order total is $15.37. We'll have it ready in 10-15 minutes. Thank you!"

## 💰 Cost Breakdown

- **LiveKit**: FREE for first 10,000 minutes/month
- **Groq**: ~$0.50 per 1M tokens (very cheap for STT)
- **OpenAI**: ~$0.15-0.25 per voice order (GPT-4 + TTS)
- **Total**: **<$0.30 per voice order**

## 🔧 Troubleshooting

### Voice Button Not Working
- Check browser console for errors
- Ensure microphone permissions are granted
- Verify LiveKit environment variables are set

### Connection Issues
- Check LiveKit URL format (should start with `wss://`)
- Verify API keys are correct
- Check Python voice agent is running

### Audio Not Working
- Test microphone in browser settings
- Check if other apps are using microphone
- Try refreshing the page

### Orders Not Submitting
- Check voice agent console logs
- Verify webhook URL is accessible
- Test regular text ordering still works

## 🔄 Development vs Production

### Development Setup
- Voice agent runs on `localhost:7880`
- Web app on `localhost:3000`
- Use LiveKit cloud for audio infrastructure

### Production Setup
- Deploy voice agent to cloud service (Railway, Heroku, etc.)
- Update `WEBAPP_URL` to production domain
- Use production LiveKit project settings

## 📞 Support

If you encounter issues:
1. Check the console logs in both terminals
2. Verify all environment variables are set correctly
3. Test with simple phrases first: "I want breakfast"
4. Ensure stable internet connection for real-time audio

## 🎉 Success Criteria

✅ **Voice button appears** - Floating microphone icon  
✅ **Microphone permission** - Browser requests access  
✅ **Real-time conversation** - Natural voice ordering works  
✅ **Cart synchronization** - Voice orders appear in visual cart  
✅ **Order completion** - Voice orders email successfully  
✅ **Error handling** - Graceful fallbacks to text mode  
✅ **Mobile compatibility** - Works on phones and tablets  

Your QBeatAI app now supports both text and voice ordering! 🎤🥖
