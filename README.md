# PROCODE AI Platform

---

### 🇬🇧 AI Collaboration Note  
This project was developed as part of an exploration into how modern AI tools (like GPT-4) can support software development.  
I used AI as an assistant for tasks such as code generation, architecture brainstorming, and naming conventions – but every piece of code was personally reviewed, adapted, and tested by me.  
The goal was not to replace development work with prompts, but to integrate AI responsibly and enhance productivity while maintaining full control and understanding of the codebase.  
This project is a reflection of my ability to lead complex systems from idea to execution, combining both human insight and modern tools.

---

### 🇵🇱 Notatka o współpracy z AI  
Ten projekt powstał jako forma eksploracji potencjału nowoczesnych narzędzi AI (takich jak GPT-4) w pracy programisty.  
Sztuczna inteligencja wspierała mnie m.in. przy generowaniu kodu, planowaniu architektury i tworzeniu nazewnictwa – ale **każdy fragment kodu był przeze mnie osobiście sprawdzony, przystosowany i przetestowany**.  
Nie chodziło o zastąpienie pracy developera promptami, lecz o **odpowiedzialne wykorzystanie AI** do zwiększenia produktywności przy zachowaniu pełnego zrozumienia i kontroli nad tworzonym systemem.  
Ten projekt jest świadectwem mojej umiejętności prowadzenia złożonych systemów od pomysłu do działania, z wykorzystaniem zarówno własnej wiedzy, jak i nowoczesnych narzędzi.

---

A comprehensive AI chat application with Telegram integration, built with modern microservices architecture. PROCODE combines powerful AI capabilities with intuitive user experience.

## Architecture Overview

### Microservices Architecture
PROCODE follows a microservices pattern with three main components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │  Telegram Bot   │    │   PostgreSQL    │
│   (Nuxt.js)     │    │  Microservice   │    │   Database      │
│                 │    │                 │    │                 │
│ • Dashboard     │◄──►│ • AI Chat       │◄──►│ • Users         │
│ • Chat Panel    │    │ • Notifications │    │ • Conversations │
│ • Models Table  │    │ • Proactive Msg │    │ • Messages      │
│ • User Context  │    │ • Polling       │    │ • Contexts      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                               Docker Compose Network
```

### Technology Stack
- **Frontend**: Nuxt.js 3 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express (via Nuxt server API)
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenRouter API (multi-model support)
- **Messaging**: Telegram Bot API
- **Authentication**: JWT with secure cookies
- **Containerization**: Docker + Docker Compose
- **Voice**: Web Speech API for voice-to-text

## Key Features

### AI Chat Experience
- **Multi-Model Support**: 100+ AI models via OpenRouter
- **Voice Recognition**: Polish language speech-to-text
- **Real-time Chat**: Claude-style bubble interface
- **Conversation History**: Complete chat persistence
- **Model Selection**: User preference management

### Telegram Integration
- **Bi-directional Chat**: Full AI conversations via Telegram
- **Proactive Messaging**: Context-aware notifications
- **Secure Connection**: Token-based user linking
- **Multi-platform**: Web + Telegram unified experience

### User Context System
- **Personal Profiles**: Bio, goals, preferences
- **Professional Context**: Work environment, role, challenges
- **AI Personalization**: Context-aware responses
- **Privacy-First**: User-controlled data sharing

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL (or use Docker version)
- OpenRouter API account
- Telegram Bot Token

### Environment Variables

Create `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/procode"

# OpenRouter AI API
OPENROUTER_API_KEY="your_openrouter_api_key_here"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"

# JWT Security
JWT_SECRET="your_super_secure_jwt_secret_here"

# Application
NODE_ENV="development"
NUXT_SECRET_KEY="your_nuxt_secret_key"
```

### Quick Start with Docker

```bash
# Clone repository
git clone https://github.com/your-username/procode.git
cd procode

# Start all services (app + telegram-bot + postgres)
npm run dev:docker:full

# OR start step by step
docker-compose up --build
```

### Manual Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev

# Start Telegram bot (separate terminal)
node telegram-bot-local.js
```

## Configuration Guide

### 1. OpenRouter API Setup
1. Visit [OpenRouter.ai](https://openrouter.ai)
2. Create account and generate API key
3. Add key to `.env` as `OPENROUTER_API_KEY`
4. Configure model preferences in app dashboard

### 2. Telegram Bot Setup
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create new bot with `/newbot` command
3. Copy token to `.env` as `TELEGRAM_BOT_TOKEN`
4. Start bot microservice: `docker-compose up telegram-bot`

### 3. Database Configuration
**Docker (Recommended):**
```bash
# Automatic setup with docker-compose
docker-compose up postgres
```

**Manual PostgreSQL:**
```bash
# Create database
createdb procode

# Run migrations
npx prisma db push
```

### 4. JWT Security
Generate secure JWT secret:
```bash
# Generate 64-character random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Usage Guide

### Web Application
1. **Register/Login**: Create account at `http://localhost:3000`
2. **Select AI Model**: Choose preferred model in Models table
3. **Set Context**: Fill user context form for personalized responses
4. **Start Chatting**: Use chat panel with voice or text input

### Telegram Integration
1. **Generate Token**: Click "Connect Telegram" in dashboard
2. **Link Account**: Send `/connect <token>` to your bot
3. **Chat with AI**: Send any message to bot for AI responses
4. **Proactive Messages**: Receive context-aware notifications

### Voice Features
- **Activation**: Click microphone icon in chat
- **Polish Support**: Optimized for Polish language recognition
- **Real-time**: Live transcription with instant AI responses

## Business Applications

### Individual Users
- **Personal AI Assistant**: Context-aware daily helper
- **Learning Companion**: Educational support with memory
- **Productivity Boost**: Task management and goal tracking

## Security Features

### Data Protection
- **JWT Authentication**: Secure token-based sessions
- **Database Encryption**: Sensitive data protection
- **Environment Secrets**: Secure configuration management
- **User Isolation**: Complete data separation

### Privacy Controls
- **Opt-in Context**: User-controlled information sharing
- **Data Retention**: Configurable message history
- **Secure Tokens**: Encrypted Telegram connections
- **GDPR Ready**: Data export and deletion capabilities

## Deployment

### Development
```bash
npm run dev:docker:full
```

### Production
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# With custom domain
docker-compose up -d --scale app=3
```

### Environment-Specific Configs
- **Development**: Hot reload, debug logging
- **Staging**: Production build, test data
- **Production**: Optimized build, monitoring

## Documentation

### Core Documentation
- **[Architecture Overview](https://github.com/procodeeu/procode/blob/main/docs/architecture-overview.md)** - System design and technical decisions
- **[API Reference](https://github.com/procodeeu/procode/blob/main/docs/api-reference.md)** - Complete API endpoints with examples
- **[Database Schema](https://github.com/procodeeu/procode/blob/main/docs/database-schema.md)** - Data model and relationships
- **[Deployment Guide](https://github.com/procodeeu/procode/blob/main/docs/deployment-guide.md)** - Production deployment strategies

## Contributing

### Development Setup
```bash
# Fork repository
git clone https://github.com/your-username/procode.git

# Create feature branch
git checkout -b feature/amazing-feature

# Install dependencies
npm install

# Start development environment
npm run dev:docker:full
```

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent formatting
- **Conventional Commits**: Standardized commit messages

### Testing
```bash
# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Check coverage
npm run test:coverage
```

---

*PROCODE - Empowering conversations with intelligent AI integration*
