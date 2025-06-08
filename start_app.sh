#!/bin/bash

# Start PROCODE Django Application
echo "🚀 Starting PROCODE Django Application..."

# Export environment variables from .env.django
if [ -f .env.django ]; then
    echo "📁 Loading environment variables from .env.django"
    export $(cat .env.django | grep -v '^#' | xargs)
else
    echo "⚠️  .env.django file not found! Using defaults."
fi

# Start application
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.django.yml up -d

echo ""
echo "✅ Application started!"
echo ""
echo "🌐 Frontend: http://localhost:443"
echo "🔧 Django Admin: http://localhost:8000/admin"
echo "📊 API: http://localhost:8000/api"
echo ""
echo "📊 Status:"
docker-compose -f docker-compose.django.yml ps
echo ""
echo "🔄 To stop: docker-compose -f docker-compose.django.yml down"
echo "📝 To check logs: docker-compose -f docker-compose.django.yml logs -f [service]"