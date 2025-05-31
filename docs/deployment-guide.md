# Deployment Guide

Complete guide for deploying PROCODE to production environments, from local development to enterprise-scale deployments.

## 🎯 Deployment Options

### Quick Reference
| Environment | Use Case | Complexity | Cost | Scalability |
|-------------|----------|------------|------|-------------|
| **Local** | Development, testing | Low | Free | Single machine |
| **VPS** | Small teams, demos | Medium | $20-100/month | Vertical |
| **Cloud** | Production, enterprise | High | $100-1000+/month | Horizontal |
| **Kubernetes** | Enterprise, high-scale | Very High | $500+/month | Auto-scaling |

## 🏠 Local Development Deployment

### Prerequisites
```bash
# Required software
node --version    # v18+
docker --version  # v20+
git --version     # v2.30+
```

### Quick Start
```bash
# Clone and setup
git clone https://github.com/your-org/procode.git
cd procode

# Environment setup
cp .env.example .env
# Edit .env with your API keys

# Start all services
npm run dev:docker:full

# Or start individually
docker-compose up postgres        # Database first
npm run dev                       # Web app (development mode)
node telegram-bot-local.js        # Telegram bot
```

### Development URLs
- **Web App**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Database**: localhost:5432

## 🖥️ VPS Deployment (Single Server)

Perfect for small teams, demos, or cost-effective production deployments.

### Server Requirements
```bash
# Minimum specs
CPU: 2 cores
RAM: 4GB
Storage: 50GB SSD
OS: Ubuntu 22.04 LTS
```

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (for build tools)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-org/procode.git
cd procode

# Create production environment
cat > .env.production << EOF
# Database
DATABASE_URL="postgresql://procode:$(openssl rand -base64 32)@localhost:5432/procode_prod"

# AI Integration
OPENROUTER_API_KEY="your_production_openrouter_key"

# Telegram
TELEGRAM_BOT_TOKEN="your_production_bot_token"

# Security
JWT_SECRET="$(openssl rand -base64 64)"
NODE_ENV="production"

# Optional: Domain configuration
NUXT_PUBLIC_API_BASE="https://your-domain.com"
EOF

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build
```

### 3. Reverse Proxy (Nginx)
```bash
# Install Nginx
sudo apt install nginx -y

# Create site configuration
sudo tee /etc/nginx/sites-available/procode << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/procode /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 4. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### 5. Process Management
```bash
# Create systemd service
sudo tee /etc/systemd/system/procode.service << EOF
[Unit]
Description=PROCODE AI Platform
After=network.target docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ubuntu/procode
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=ubuntu

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl enable procode
sudo systemctl start procode
```

## ☁️ Cloud Deployment (AWS/GCP/Azure)

### Architecture Overview
```
Internet → CloudFlare CDN → Load Balancer → Container Service → Database
                                    ↓
                             Auto Scaling Group
                             ├── App Instance 1
                             ├── App Instance 2
                             └── Bot Instance 1
```

### AWS Deployment with ECS

#### 1. Infrastructure Setup
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Configure AWS
aws configure

# Create VPC and subnets (use CloudFormation)
aws cloudformation create-stack \
  --stack-name procode-infrastructure \
  --template-body file://infrastructure/aws-infrastructure.yaml
```

#### 2. Database Setup (RDS)
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier procode-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 15.4 \
  --master-username procode \
  --master-user-password "$(openssl rand -base64 32)" \
  --allocated-storage 100 \
  --storage-type gp2 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --db-subnet-group-name procode-db-subnet-group \
  --backup-retention-period 7 \
  --multi-az
```

#### 3. Container Registry (ECR)
```bash
# Create repositories
aws ecr create-repository --repository-name procode/app
aws ecr create-repository --repository-name procode/telegram-bot

# Build and push images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t procode/app .
docker tag procode/app:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/procode/app:latest

# Push images
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/procode/app:latest
```

#### 4. ECS Service Definition
```json
{
  "family": "procode-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "procode-app",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/procode/app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:us-east-1:123456789012:parameter/procode/database-url"
        },
        {
          "name": "OPENROUTER_API_KEY",
          "valueFrom": "arn:aws:ssm:us-east-1:123456789012:parameter/procode/openrouter-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/procode-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 🏗️ Production Docker Configuration

### docker-compose.prod.yml
```yaml
version: '3.8'

services:
  app:
    build: 
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  telegram-bot:
    build: 
      context: .
      dockerfile: Dockerfile.prod
    command: node telegram-bot-local.js
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "process.exit(0)"]
      interval: 60s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=procode_prod
      - POSTGRES_USER=procode
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password
    secrets:
      - postgres_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U procode"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  postgres_data:
  redis_data:

secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
```

### Production Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# Copy necessary files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

# Set permissions
USER nuxtjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

EXPOSE 3000

ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

### 1. Application Monitoring
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.ignored-mount-points'
      - '^/(sys|proc|dev|host|etc|rootfs/var/lib/docker/containers|rootfs/var/lib/docker/overlay2|rootfs/run/docker/netns|rootfs/var/lib/docker/aufs)($$|/)'

volumes:
  grafana_data:
```

### 2. Log Management
```bash
# Centralized logging with ELK stack
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -e "discovery.type=single-node" \
  elasticsearch:7.17.0

docker run -d \
  --name kibana \
  --link elasticsearch:elasticsearch \
  -p 5601:5601 \
  kibana:7.17.0

# Configure Logstash for log aggregation
# Send application logs to Elasticsearch
```

## 🔐 Security Hardening

### 1. Environment Security
```bash
# Secure environment variables
# Never commit .env files to git
echo ".env*" >> .gitignore

# Use secrets management
# AWS: Parameter Store / Secrets Manager
# Azure: Key Vault
# GCP: Secret Manager

# Example: AWS Secrets Manager
aws secretsmanager create-secret \
  --name procode/production/database-url \
  --description "Production database connection string" \
  --secret-string "postgresql://user:pass@host:5432/db"
```

### 2. Network Security
```bash
# Configure firewall (UFW on Ubuntu)
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3000/tcp   # Block direct app access
sudo ufw deny 5432/tcp   # Block direct DB access

# Use VPC/Security Groups in cloud deployments
# Restrict database access to app servers only
# Use bastion hosts for administrative access
```

### 3. SSL/TLS Configuration
```nginx
# Nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run E2E tests
        run: npm run test:e2e

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.prod
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.PRODUCTION_SSH_KEY }}
          script: |
            cd /opt/procode
            docker-compose pull
            docker-compose up -d --no-deps app telegram-bot
            docker system prune -f
```

## 📈 Performance Optimization

### 1. Database Optimization
```sql
-- Essential indexes for production
CREATE INDEX CONCURRENTLY idx_conversations_user_id_updated 
ON conversations("userId", "updatedAt" DESC);

CREATE INDEX CONCURRENTLY idx_messages_conversation_created 
ON messages("conversationId", "createdAt" DESC);

CREATE INDEX CONCURRENTLY idx_ai_responses_created_model 
ON ai_responses("createdAt" DESC, "modelUsed");

-- Database maintenance
VACUUM ANALYZE;
REINDEX DATABASE procode_prod;
```

### 2. Application Optimization
```bash
# Production build optimizations
npm run build

# Enable gzip compression in Nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Enable caching for static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🆘 Troubleshooting

### Common Deployment Issues

**1. Database Connection Errors**
```bash
# Check database status
docker-compose logs postgres

# Test connection
psql postgresql://user:pass@host:5432/dbname

# Common fixes
- Verify DATABASE_URL format
- Check firewall rules
- Ensure database is running
```

**2. Memory Issues**
```bash
# Monitor resource usage
docker stats

# Increase memory limits
docker-compose up --scale app=2

# Optimize Node.js memory
NODE_OPTIONS="--max-old-space-size=2048"
```

**3. SSL Certificate Problems**
```bash
# Renew Let's Encrypt certificates
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Manual renewal
sudo certbot certonly --nginx -d your-domain.com
```

### Emergency Procedures

**1. Rollback Deployment**
```bash
# Quick rollback to previous version
docker-compose down
git checkout previous-stable-tag
docker-compose up -d --build

# Or use tagged image
docker-compose pull app:previous-tag
docker-compose up -d --no-deps app
```

**2. Database Backup/Restore**
```bash
# Create backup
docker exec postgres pg_dump -U procode procode_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker exec -i postgres psql -U procode procode_prod < backup_file.sql
```

---

This deployment guide covers everything from local development to enterprise-scale cloud deployments. Choose the deployment strategy that best fits your needs and scale requirements.