# Database Schema & Architecture

This document describes the database structure, relationships, and data flow patterns in the PROCODE AI Platform.

## 🏗️ Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      Users      │──────►│  Conversations  │──────►│    Messages     │
│                 │ 1:N   │                 │ 1:N   │                 │
│ • id (PK)       │       │ • id (PK)       │       │ • id (PK)       │
│ • email         │       │ • userId (FK)   │       │ • conversationId│
│ • password      │       │ • title         │       │ • role          │
│ • currentModel  │       │ • isActive      │       │ • content       │
│ • preferences   │       │ • createdAt     │       │ • metadata      │
└─────────────────┘       └─────────────────┘       └─────────────────┘
         │                                                    │
         │ 1:1                                                │ 1:1
         ▼                                                    ▼
┌─────────────────┐                               ┌─────────────────┐
│  UserContexts   │                               │  AIResponses    │
│                 │                               │                 │
│ • id (PK)       │                               │ • id (PK)       │
│ • userId (FK)   │                               │ • messageId (FK)│
│ • personalBio   │                               │ • modelUsed     │
│ • longTermGoals │                               │ • tokenCount    │
│ • workContext   │                               │ • latency       │
└─────────────────┘                               └─────────────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐       ┌─────────────────┐
│TelegramConnections│      │ProactiveMessages│
│                 │       │                 │
│ • id (PK)       │       │ • id (PK)       │
│ • userId (FK)   │◄──────│ • userId (FK)   │
│ • telegramChatId│  1:N  │ • content       │
│ • isActive      │       │ • status        │
│ • connectionToken│       │ • scheduledFor  │
└─────────────────┘       └─────────────────┘
```

## 📊 Core Models

### User Management

#### Users
Central user entity managing authentication and preferences.

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  password          String?
  name              String?
  avatar            String?
  telegramChatId    String?  @unique
  telegramUsername  String?
  preferences       Json?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  preferredModels   String[] @default([])
  currentModel      String   @default("mistralai/devstral-small:free")

  // Relationships
  conversations      Conversation[]
  telegramConnection TelegramConnection?
  userContext        UserContext?
  proactiveMessages  ProactiveMessage[]
}
```

**Key Features:**
- **Authentication**: Email/password with JWT tokens
- **AI Preferences**: Current model + preferred models list
- **Telegram Integration**: Optional chat ID for bot connection
- **Profile Management**: Name, avatar, custom preferences

#### UserContext
Stores personal and professional context for AI personalization.

```prisma
model UserContext {
  id                    String   @id @default(cuid())
  userId                String   @unique
  personalBio           String?
  longTermGoals         String[]
  workContext           String?
  currentChallenges     String[]
  aiPreferences         String?
  communicationStyle    String?
  expertiseAreas        String[]
  learningObjectives    String[]
  decisionMakingStyle   String?
  timeManagementStyle   String?
  preferredMeetingTimes String[]
  workingHours          String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

**Context Categories:**
- **Personal**: Bio, goals, communication style
- **Professional**: Work context, expertise areas, challenges
- **Learning**: Objectives, preferred learning methods
- **Productivity**: Time management, working hours, meeting preferences

### Conversation System

#### Conversations
Groups related messages into contextual threads.

```prisma
model Conversation {
  id        String   @id @default(cuid())
  userId    String
  title     String?
  context   Json?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id])
  messages Message[]
}
```

**Conversation Types:**
- **Web Chat**: Browser-based conversations
- **Telegram Chat**: Messages from Telegram bot
- **Voice Sessions**: Speech-to-text conversations
- **Context-Driven**: Conversations initiated by user context

#### Messages
Individual messages within conversations with rich metadata.

```prisma
model Message {
  id                String   @id @default(cuid())
  conversationId    String
  role              String   // 'user' | 'assistant' | 'system'
  content           String
  metadata          Json?
  telegramMessageId String?
  source            String   @default("web")
  createdAt         DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id])
  aiResponse   AIResponse?
}
```

**Message Sources:**
- `web`: Browser chat interface
- `telegram`: Telegram bot messages
- `voice`: Speech-to-text input
- `api`: Direct API calls

#### AIResponse
Tracks AI model performance and metadata for analytics.

```prisma
model AIResponse {
  id           String   @id @default(cuid())
  messageId    String   @unique
  modelUsed    String
  tokenCount   Int?
  cost         Float?
  latency      Int?     // milliseconds
  temperature  Float?
  maxTokens    Int?
  requestData  Json?
  responseData Json?
  status       String   @default("success")
  createdAt    DateTime @default(now())

  message Message @relation(fields: [messageId], references: [id])
}
```

**Analytics Data:**
- **Performance**: Latency, token usage, cost tracking
- **Model Info**: Which AI model was used
- **Parameters**: Temperature, max tokens, etc.
- **Raw Data**: Full request/response for debugging

### Telegram Integration

#### TelegramConnection
Secure linking between users and Telegram accounts.

```prisma
model TelegramConnection {
  id                String    @id @default(cuid())
  userId            String    @unique
  telegramChatId    String
  telegramUsername  String?
  connectionToken   String    @unique
  isActive          Boolean   @default(false)
  connectedAt       DateTime?
  lastMessageAt     DateTime?
  createdAt         DateTime  @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

**Security Features:**
- **Token-based Connection**: Temporary tokens for secure linking
- **Activity Tracking**: Last message time for analytics
- **Status Management**: Enable/disable connections

#### ProactiveMessage
Queued messages for context-aware notifications.

```prisma
model ProactiveMessage {
  id           String    @id @default(cuid())
  userId       String
  content      String
  context      Json?
  status       String    @default("pending")
  scheduledFor DateTime?
  sentAt       DateTime?
  createdAt    DateTime  @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

**Message States:**
- `pending`: Queued for delivery
- `sent`: Successfully delivered
- `failed`: Delivery failed
- `cancelled`: Manually cancelled

## 🔄 Data Flow Patterns

### 1. User Registration & Setup
```
User Registration → User Context Setup → AI Model Selection → Ready for Chat
```

### 2. Web Chat Flow
```
User Message → Conversation Creation/Update → AI Processing → Response Storage → UI Update
```

### 3. Telegram Integration Flow
```
Token Generation → Bot Connection → Message Sync → Bi-directional Chat
```

### 4. Proactive Messaging Flow
```
Context Analysis → Message Generation → Queue Management → Telegram Delivery
```

## 🔍 Common Query Patterns

### Get User's Complete Profile
```sql
SELECT u.*, uc.*, tc.*
FROM users u
LEFT JOIN user_contexts uc ON u.id = uc."userId"
LEFT JOIN telegram_connections tc ON u.id = tc."userId"
WHERE u.id = $1;
```

### Get Conversation with Messages
```sql
SELECT c.*, m.*, ar.*
FROM conversations c
LEFT JOIN messages m ON c.id = m."conversationId"
LEFT JOIN ai_responses ar ON m.id = ar."messageId"
WHERE c.id = $1
ORDER BY m."createdAt" ASC;
```

### Get AI Usage Analytics
```sql
SELECT 
  ar."modelUsed",
  COUNT(*) as usage_count,
  AVG(ar.latency) as avg_latency,
  SUM(ar.cost) as total_cost,
  AVG(ar."tokenCount") as avg_tokens
FROM ai_responses ar
WHERE ar."createdAt" >= $1
GROUP BY ar."modelUsed"
ORDER BY usage_count DESC;
```

### Get Pending Proactive Messages
```sql
SELECT pm.*, u.email, tc."telegramChatId"
FROM proactive_messages pm
JOIN users u ON pm."userId" = u.id
JOIN telegram_connections tc ON u.id = tc."userId"
WHERE pm.status = 'pending'
  AND tc."isActive" = true
  AND (pm."scheduledFor" IS NULL OR pm."scheduledFor" <= NOW())
ORDER BY pm."createdAt" ASC;
```

## 🛡️ Data Integrity & Constraints

### Foreign Key Relationships
- **Cascade Deletes**: User deletion removes all related data
- **Referential Integrity**: All foreign keys properly constrained
- **Unique Constraints**: Email, Telegram connections are unique

### Data Validation
- **Email Format**: Validated at application level
- **JSON Schema**: Context and metadata follow defined schemas
- **Enum Values**: Message roles, statuses use predefined values

### Indexes for Performance
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_telegram_chat_id ON users("telegramChatId");

-- Conversation queries
CREATE INDEX idx_conversations_user_id ON conversations("userId");
CREATE INDEX idx_conversations_updated_at ON conversations("updatedAt");

-- Message queries
CREATE INDEX idx_messages_conversation_id ON messages("conversationId");
CREATE INDEX idx_messages_created_at ON messages("createdAt");

-- Analytics queries
CREATE INDEX idx_ai_responses_model_used ON ai_responses("modelUsed");
CREATE INDEX idx_ai_responses_created_at ON ai_responses("createdAt");
```

## 🔄 Migration Strategy

### Schema Evolution
- **Additive Changes**: New columns with defaults
- **Backward Compatibility**: Old API versions supported
- **Data Migrations**: Automated scripts for data transformation

### Backup & Recovery
- **Daily Backups**: Automated PostgreSQL dumps
- **Point-in-time Recovery**: Transaction log backup
- **Testing**: Regular restore testing in staging

## 📈 Scalability Considerations

### Read Replicas
- **Analytics Queries**: Route to read replicas
- **User Sessions**: Can use cached user data
- **Message History**: Paginated with efficient indexes

### Partitioning Strategy
- **Messages Table**: Partition by date for large datasets
- **AI Responses**: Separate hot/cold data by age
- **Archive Strategy**: Move old conversations to archive tables

### Caching Layers
- **User Context**: Redis cache for frequently accessed data
- **AI Models**: Cache model metadata and pricing
- **Session Data**: JWT tokens with refresh strategy

---

This schema supports the full PROCODE feature set while maintaining flexibility for future enhancements and enterprise scalability requirements.