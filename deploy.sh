#!/bin/bash

# Deployment script for VPS
echo "🚀 Starting deployment to VPS..."

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Clone or update repository
if [ ! -d "/root/procode" ]; then
    echo "Cloning repository..."
    git clone https://github.com/YOUR_USERNAME/PROCODE.git /root/procode
else
    echo "Updating repository..."
    cd /root/procode
    git pull origin main
fi

cd /root/procode

# Copy environment file
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
fi

# Build and start containers
echo "Building and starting containers..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run database migrations
echo "Running database migrations..."
sleep 10
docker-compose exec -T app npx prisma migrate deploy

echo "✅ Deployment completed!"
echo "🌐 Application should be available at: http://185.25.151.143:3000"