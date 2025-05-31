# Architecture Overview

Comprehensive guide to PROCODE's system architecture, design decisions, and technical rationale.

## 🎯 Design Philosophy

PROCODE is built on four core principles:

### 1. **Microservices-First Architecture**
- **Separation of Concerns**: Each service has a single responsibility
- **Independent Scaling**: Services scale based on individual demand
- **Technology Flexibility**: Different services can use optimal tech stacks
- **Fault Isolation**: Service failures don't cascade to entire system

### 2. **AI-Native Design**
- **Multi-Model Support**: Architecture supports 100+ AI models seamlessly
- **Context Awareness**: User context flows through all AI interactions
- **Performance Optimization**: Caching and batching for AI API efficiency
- **Cost Management**: Token tracking and model selection optimization

### 3. **Multi-Channel Experience**
- **Platform Agnostic**: Web, Telegram, API - unified experience
- **Real-time Sync**: Conversations sync across all platforms
- **Progressive Enhancement**: Rich features in web, essential features everywhere
- **Offline Resilience**: Graceful degradation when services unavailable

### 4. **Enterprise-Ready Foundation**
- **Security by Design**: JWT, encryption, data isolation
- **Observability**: Comprehensive logging, metrics, tracing
- **Scalability**: Database partitioning, caching, load balancing
- **Maintainability**: Clean code, documentation, testing

## 🏗️ System Architecture

### High-Level Overview

```
                                    Internet
                                       │
                          ┌────────────┼────────────┐
                          │            │            │
                    ┌─────▼─────┐ ┌────▼────┐ ┌────▼────┐
                    │   Web     │ │Telegram │ │   API   │
                    │ Clients   │ │   Bot   │ │Clients  │
                    └─────┬─────┘ └────┬────┘ └────┬────┘
                          │            │           │
                          └────────────┼───────────┘
                                       │
                              ┌────────▼────────┐
                              │  Load Balancer  │
                              │   (Optional)    │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │             Docker Network          │
                    │                                     │
        ┌───────────▼────────────┐              ┌────────▼────────┐
        │     Nuxt.js App        │              │ Telegram Bot    │
        │   (Web + API Server)   │◄────────────►│  Microservice   │
        │                        │              │                 │
        │ • Server-side API      │              │ • Polling       │
        │ • Client-side SPA      │              │ • AI Chat       │
        │ • Authentication       │              │ • Proactive Msg │
        │ • Real-time Chat       │              │ • Queue Mgmt    │
        └───────────┬────────────┘              └────────┬────────┘
                    │                                    │
                    └──────────────┬─────────────────────┘
                                   │
                          ┌────────▼────────┐
                          │   PostgreSQL    │
                          │    Database     │
                          │                 │
                          │ • User Data     │
                          │ • Conversations │
                          │ • AI Responses  │
                          │ • Analytics     │
                          └─────────────────┘
```

### Service Breakdown

#### 1. **Nuxt.js Application Server** 
**Role**: Primary web application and API gateway
**Technology**: Nuxt.js 3 + TypeScript + Tailwind CSS

**Responsibilities:**
- **Frontend SPA**: Vue.js client with reactive UI
- **Server API**: RESTful endpoints for all operations
- **Authentication**: JWT token management and session handling
- **Real-time Features**: WebSocket support for live chat
- **Static Assets**: Optimized serving of CSS, JS, images

**Key Components:**
```
pages/
├── index.vue           # Landing page
├── login.vue          # Authentication
├── dashboard.vue      # Main app interface
├── context.vue        # User context management
└── conversations.vue  # Chat history

server/api/
├── auth/              # Authentication endpoints
├── chat.post.ts       # Main chat API
├── conversations/     # Conversation management
├── models.get.ts      # AI model catalog
├── user/              # User settings & context
└── telegram/          # Telegram integration
```

#### 2. **Telegram Bot Microservice**
**Role**: Telegram integration and proactive messaging
**Technology**: Node.js + Telegram Bot API

**Responsibilities:**
- **Message Handling**: Bi-directional chat with Telegram users
- **User Linking**: Secure token-based account connection
- **Proactive Messaging**: Context-aware notification delivery
- **Queue Management**: Async message processing and delivery

**Architecture Pattern:**
```javascript
// Polling-based architecture for reliability
Bot Polling → Message Processing → AI Integration → Response Delivery
     ↑                                                       ↓
Database ←─── Queue Management ←─── Context Analysis ←───────┘
```

#### 3. **PostgreSQL Database**
**Role**: Primary data store with ACID compliance
**Technology**: PostgreSQL 15 + Prisma ORM

**Data Organization:**
- **User Management**: Authentication, preferences, settings
- **Conversation System**: Messages, threads, context
- **AI Integration**: Model metadata, response analytics
- **Telegram Data**: Connections, proactive message queue

## 🔄 Data Flow Patterns

### 1. **Web Chat Flow**
```
User Input → Frontend Validation → API Request → AI Processing → Database Storage → Real-time Update
     │                                    │              │              │
     └─── Voice Recognition ──────────────┘              │              │
                                                         │              │
OpenRouter API ←─── Model Selection ←───────────────────┘              │
     │                                                                  │
     └─── AI Response ─── Response Processing ─── Analytics ───────────┘
```

**Detailed Steps:**
1. **Input Processing**: Text or voice input validation and sanitization
2. **Context Enrichment**: User context and conversation history loading
3. **Model Selection**: AI model chosen based on user preference and task
4. **AI Request**: Optimized request to OpenRouter with context
5. **Response Processing**: AI response parsing and metadata extraction
6. **Storage**: Message and analytics data persistence
7. **Real-time Update**: WebSocket push to all user sessions

### 2. **Telegram Integration Flow**
```
Telegram Message → Bot Polling → User Verification → AI Processing → Response Delivery
        │                            │                     │              │
        └─── User Registration ──────┘                     │              │
                                                          │              │
Database Updates ←─── Context Loading ←─────────────────┘              │
        │                                                               │
        └─── Analytics Tracking ←─────────────────────────────────────┘
```

### 3. **Proactive Messaging Flow**
```
Context Analysis → Message Generation → Queue Management → Delivery Scheduling → User Notification
       │                   │                  │                   │                    │
   Cron Job          AI Analysis      Database Queue       Time-based         Telegram API
       │                   │                  │           Scheduling               │
   Hourly Run        User Context        Status Tracking      Retry Logic      Success/Failure
```

## 🏛️ Architectural Patterns

### 1. **Domain-Driven Design (DDD)**

**User Domain:**
- User registration, authentication, preferences
- Context management and personalization

**Conversation Domain:**
- Message handling, thread management
- AI integration and response processing

**Integration Domain:**
- Telegram bot connection and messaging
- External API management (OpenRouter)

**Analytics Domain:**
- Usage tracking, performance metrics
- Cost analysis and optimization

### 2. **Event-Driven Architecture**

**Event Types:**
```typescript
// User Events
UserRegistered { userId, email, timestamp }
UserContextUpdated { userId, changes, timestamp }

// Conversation Events
MessageSent { conversationId, messageId, userId }
AIResponseGenerated { messageId, model, tokens, cost }

// Integration Events
TelegramConnected { userId, chatId, timestamp }
ProactiveMessageSent { userId, messageId, status }
```

**Event Handling:**
- **Immediate**: Real-time UI updates, message delivery
- **Async**: Analytics processing, context analysis
- **Scheduled**: Proactive message generation, cleanup tasks

### 3. **Repository Pattern**

**Data Access Layer:**
```typescript
interface UserRepository {
  findById(id: string): Promise<User>
  findByEmail(email: string): Promise<User>
  create(userData: CreateUserInput): Promise<User>
  updateContext(userId: string, context: UserContext): Promise<void>
}

interface ConversationRepository {
  findByUserId(userId: string): Promise<Conversation[]>
  createMessage(conversationId: string, message: MessageInput): Promise<Message>
  getMessagesWithPagination(conversationId: string, pagination: PaginationInput): Promise<MessagePage>
}
```

## 🔐 Security Architecture

### 1. **Authentication & Authorization**

**JWT Token Flow:**
```
Login → Server Validation → JWT Generation → Cookie Setting → Request Authorization
  │            │                  │               │                    │
Email/Pass   Database         Private Key     HttpOnly Cookie    Token Validation
  │            │                  │               │                    │
Frontend   Password Hash     Expiration     Secure Transport    Middleware Check
```

**Security Layers:**
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: SameSite cookies and token validation

### 2. **Data Protection**

**Encryption at Rest:**
- Database encryption for sensitive fields
- Environment variable protection
- Secret management for API keys

**Encryption in Transit:**
- HTTPS enforcement for all connections
- Secure WebSocket connections (WSS)
- API key transmission protection

### 3. **Access Control**

**User Isolation:**
- Row-level security for user data
- Conversation access validation
- Telegram connection verification

**Admin Functions:**
- Role-based access control
- Audit logging for sensitive operations
- Rate limiting for admin endpoints

## 📊 Performance Architecture

### 1. **Caching Strategy**

**Application Level:**
```typescript
// User context caching (Redis)
const userContext = await cache.get(`user:${userId}:context`)
if (!userContext) {
  userContext = await db.getUserContext(userId)
  await cache.set(`user:${userId}:context`, userContext, 3600) // 1 hour
}

// Model metadata caching
const models = await cache.get('openrouter:models')
if (!models) {
  models = await openrouter.getModels()
  await cache.set('openrouter:models', models, 86400) // 24 hours
}
```

**Database Level:**
- Query result caching for read-heavy operations
- Connection pooling for optimal resource usage
- Index optimization for frequent queries

### 2. **Scalability Patterns**

**Horizontal Scaling:**
```yaml
# Production deployment
services:
  app:
    image: procode/app:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
  
  telegram-bot:
    image: procode/telegram-bot:latest
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

**Database Scaling:**
- Read replicas for analytics queries
- Connection pooling with PgBouncer
- Query optimization and index tuning

### 3. **Monitoring & Observability**

**Metrics Collection:**
```typescript
// Performance metrics
const responseTime = performance.now() - startTime
metrics.histogram('api.response_time', responseTime, { endpoint: '/api/chat' })

// Business metrics
metrics.counter('ai.requests.total', 1, { model: modelId })
metrics.gauge('ai.cost.daily', dailyCost)

// Error tracking
if (error) {
  metrics.counter('api.errors.total', 1, { 
    endpoint: '/api/chat',
    error_type: error.constructor.name 
  })
}
```

## 🧪 Testing Architecture

### 1. **Testing Pyramid**

**Unit Tests (70%):**
- Pure functions and utilities
- API route handlers
- Database operations
- AI response processing

**Integration Tests (20%):**
- API endpoint testing
- Database integration
- External service mocking
- Authentication flows

**E2E Tests (10%):**
- User registration and login
- Complete chat flows
- Telegram bot integration
- Multi-device synchronization

### 2. **Test Environment Strategy**

**Local Development:**
```bash
# Isolated test database
DATABASE_URL="postgresql://test:test@localhost:5433/procode_test"

# Mocked external services
OPENROUTER_API_KEY="mock_key"
TELEGRAM_BOT_TOKEN="mock_token"
```

**CI/CD Pipeline:**
- Automated testing on every commit
- Parallel test execution
- Coverage reporting and thresholds
- Integration test environment provisioning

## 🚀 Deployment Architecture

### 1. **Container Strategy**

**Multi-stage Builds:**
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### 2. **Environment Management**

**Development:**
- Hot reload for rapid development
- Debug logging and detailed errors
- Mock external services

**Staging:**
- Production-like environment
- Real external service integration
- Performance testing and load testing

**Production:**
- Optimized builds and asset compression
- Health checks and monitoring
- Automatic scaling and failover

### 3. **CI/CD Pipeline**

```yaml
# GitHub Actions workflow
name: Deploy PROCODE
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
  
  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Build Docker images
        run: docker-compose build
      - name: Deploy to production
        run: ./deploy.sh production
```

## 🔮 Future Architecture Considerations

### 1. **Microservices Evolution**
- **API Gateway**: Kong or similar for request routing
- **Service Mesh**: Istio for service-to-service communication
- **Event Streaming**: Apache Kafka for real-time events

### 2. **AI Architecture Scaling**
- **Model Caching**: Local model caching for frequently used models
- **Batch Processing**: Bulk message processing for efficiency
- **Custom Models**: Fine-tuned models for specific use cases

### 3. **Global Distribution**
- **CDN Integration**: CloudFlare for global content delivery
- **Regional Deployments**: Multi-region deployment for low latency
- **Data Sovereignty**: Regional data storage compliance

---

This architecture overview provides the foundation for understanding PROCODE's technical decisions and scaling strategies. For implementation details, see the [Development Guide](development-guide.md) and [API Reference](api-reference.md).