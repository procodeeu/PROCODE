# API Reference

Complete reference for all PROCODE API endpoints with examples and response schemas.

## 🔐 Authentication

All protected endpoints require JWT token in cookie or Authorization header.

```bash
# Cookie-based (automatic from web app)
Cookie: auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Header-based (for API clients)
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 👤 Authentication Endpoints

### POST `/api/auth/register`
Create new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "cm123abc456def",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-06-07T14:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/auth/login`
Authenticate existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "cm123abc456def",
    "email": "user@example.com",
    "name": "John Doe",
    "currentModel": "anthropic/claude-3.5-sonnet"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/auth/logout`
Invalidate current session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 💬 Chat Endpoints

### POST `/api/chat`
Send message to AI and get response.

**Request:**
```json
{
  "message": "Hello, how can you help me today?",
  "conversationId": "cm789xyz123abc", // optional
  "model": "anthropic/claude-3.5-sonnet" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "cm456def789ghi",
    "role": "assistant",
    "content": "Hello! I'm here to help you with...",
    "createdAt": "2025-06-07T14:35:00.000Z"
  },
  "conversationId": "cm789xyz123abc",
  "model": "anthropic/claude-3.5-sonnet",
  "responseMetadata": {
    "tokenCount": 150,
    "cost": 0.002,
    "latency": 1200,
    "modelData": {
      "id": "anthropic/claude-3.5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "pricing": {
        "prompt": "0.000003",
        "completion": "0.000015"
      }
    }
  }
}
```

## 🗨️ Conversation Management

### GET `/api/conversations`
Get user's conversation list.

**Query Parameters:**
- `limit` (optional): Number of conversations (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "conversations": [
    {
      "id": "cm789xyz123abc",
      "title": "AI Assistant Chat",
      "isActive": true,
      "createdAt": "2025-06-07T14:00:00.000Z",
      "updatedAt": "2025-06-07T14:35:00.000Z",
      "messageCount": 8
    }
  ],
  "total": 25,
  "hasMore": true
}
```

### POST `/api/conversations`
Create new conversation.

**Request:**
```json
{
  "title": "Project Planning Session"
}
```

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": "cm789xyz123abc",
    "title": "Project Planning Session",
    "isActive": true,
    "createdAt": "2025-06-07T14:40:00.000Z"
  }
}
```

### GET `/api/conversations/{id}`
Get conversation with messages.

**Response:**
```json
{
  "success": true,
  "conversation": {
    "id": "cm789xyz123abc",
    "title": "AI Assistant Chat",
    "isActive": true,
    "createdAt": "2025-06-07T14:00:00.000Z"
  },
  "messages": [
    {
      "id": "cm456def789ghi",
      "role": "user",
      "content": "Hello!",
      "createdAt": "2025-06-07T14:00:00.000Z"
    },
    {
      "id": "cm789abc456def",
      "role": "assistant",
      "content": "Hello! How can I help you?",
      "createdAt": "2025-06-07T14:00:05.000Z"
    }
  ]
}
```

### POST `/api/conversations/{id}/messages`
Add message to existing conversation.

**Request:**
```json
{
  "content": "Can you help me with coding?",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "cm123new456msg",
    "conversationId": "cm789xyz123abc",
    "role": "user",
    "content": "Can you help me with coding?",
    "createdAt": "2025-06-07T14:45:00.000Z"
  }
}
```

## 🤖 AI Models

### GET `/api/models`
Get available AI models with metadata.

**Query Parameters:**
- `provider` (optional): Filter by provider (e.g., "anthropic", "openai")
- `tags` (optional): Filter by tags (comma-separated)

**Response:**
```json
{
  "success": true,
  "models": [
    {
      "id": "anthropic/claude-3.5-sonnet",
      "name": "Claude 3.5 Sonnet",
      "description": "Most intelligent model for complex tasks",
      "provider": "Anthropic",
      "pricing": {
        "prompt": "0.000003",
        "completion": "0.000015"
      },
      "context_length": 200000,
      "tags": ["general", "coding", "analysis"],
      "top_provider": {
        "max_completion_tokens": 8192
      }
    }
  ],
  "total": 150
}
```

## ⚙️ User Settings

### GET `/api/user/current-model`
Get user's current AI model preference.

**Response:**
```json
{
  "success": true,
  "currentModel": "anthropic/claude-3.5-sonnet"
}
```

### POST `/api/user/current-model`
Set user's current AI model preference.

**Request:**
```json
{
  "modelId": "openai/gpt-4"
}
```

**Response:**
```json
{
  "success": true,
  "currentModel": "openai/gpt-4"
}
```

### GET `/api/user/preferred-models`
Get user's preferred models list.

**Response:**
```json
{
  "success": true,
  "preferredModels": [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4",
    "meta-llama/llama-3.1-405b"
  ]
}
```

### POST `/api/user/preferred-models`
Update user's preferred models list.

**Request:**
```json
{
  "models": [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4-turbo",
    "google/gemini-pro"
  ]
}
```

## 👤 User Context

### GET `/api/user/context`
Get user's personal context data.

**Response:**
```json
{
  "success": true,
  "context": {
    "personalBio": "Software engineer passionate about AI",
    "longTermGoals": ["Learn machine learning", "Build AI applications"],
    "workContext": "Full-stack developer at tech startup",
    "currentChallenges": ["Time management", "Learning new technologies"],
    "aiPreferences": "Detailed explanations with code examples",
    "communicationStyle": "Direct and technical",
    "expertiseAreas": ["JavaScript", "React", "Node.js"],
    "learningObjectives": ["AI/ML fundamentals", "System design"]
  }
}
```

### POST `/api/user/context`
Update user's personal context data.

**Request:**
```json
{
  "personalBio": "Senior software engineer...",
  "longTermGoals": ["Become AI specialist", "Start tech company"],
  "workContext": "Lead developer at fintech company",
  "currentChallenges": ["Scaling systems", "Team leadership"],
  "aiPreferences": "Concise answers with practical examples"
}
```

## 📱 Telegram Integration

### POST `/api/user/telegram-token`
Generate token for Telegram bot connection.

**Response:**
```json
{
  "success": true,
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "expiresIn": "1 hour",
  "instructions": "Send '/connect a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6' to @procodeeu_bot"
}
```

### POST `/api/telegram/webhook`
Webhook endpoint for Telegram bot (internal use).

**Request:**
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 987654321,
      "first_name": "John",
      "username": "johndoe"
    },
    "chat": {
      "id": 987654321,
      "type": "private"
    },
    "date": 1701234567,
    "text": "Hello bot!"
  }
}
```

## 🔧 System Endpoints

### POST `/api/system/analyze-contexts`
Analyze user contexts for proactive messaging (admin only).

**Request:**
```json
{
  "timeRange": "1h",
  "maxMessages": 10
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "usersAnalyzed": 25,
    "messagesGenerated": 3,
    "averageScore": 0.75
  },
  "messages": [
    {
      "userId": "cm123abc456def",
      "content": "Based on your learning goals...",
      "score": 0.85,
      "scheduledFor": "2025-06-07T15:00:00.000Z"
    }
  ]
}
```

## 🧪 Test Endpoints

### POST `/api/test/telegram-connect`
Test endpoint for Telegram connection (development only).

**Request:**
```json
{
  "chatId": "987654321",
  "token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

## 📊 Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "received": "invalid-email"
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Invalid request data
- `AUTHENTICATION_REQUIRED` - Missing or invalid auth token
- `AUTHORIZATION_FAILED` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error
- `EXTERNAL_API_ERROR` - Third-party service error

## 🔄 Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication**: 5 requests per minute per IP
- **Chat**: 60 requests per hour per user
- **General**: 1000 requests per hour per user

Rate limit headers included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1701234567
```

## 📝 Request/Response Examples

### Complete Chat Flow Example

```bash
# 1. Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# 2. Login (gets token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 3. Send chat message
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"Hello, explain quantum computing"}'

# 4. Get conversations
curl -X GET http://localhost:3000/api/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

This API reference covers all current endpoints. For webhook integrations and advanced usage, see the [Integration Guides](integrations/).