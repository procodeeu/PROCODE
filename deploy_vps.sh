#!/bin/bash

# Deployment script for VPS
# Run this script on your VPS to deploy PROCODE Django application

echo "🚀 Deploying PROCODE Django to VPS..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.django.yml down

# Pull latest changes (if using git)
echo "📥 Pulling latest changes..."
git pull origin main || echo "No git repository found, skipping pull"

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose -f docker-compose.django.yml --env-file .env.django up -d --build

# Show status
echo "📊 Service status:"
docker-compose -f docker-compose.django.yml ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Frontend: https://your-vps-ip:443"
echo "🔧 Django Admin: http://your-vps-ip:8000/admin"
echo "📊 API: http://your-vps-ip:8000/api"
echo ""
echo "👤 Default admin: admin@procode.com / admin123"
echo "🤖 Telegram Bot: @procodeeu_bot"
echo ""
echo "📝 To check logs:"
echo "   docker-compose -f docker-compose.django.yml logs -f [service_name]"
echo ""
echo "🔄 To restart services:"
echo "   docker-compose -f docker-compose.django.yml restart"