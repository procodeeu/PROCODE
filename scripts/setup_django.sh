#!/bin/bash

# Setup script for Django PROCODE application

echo "🚀 Setting up PROCODE Django application..."

# Wait for database
echo "⏳ Waiting for database..."
python manage.py wait_for_db

# Run migrations
echo "📦 Running migrations..."
python manage.py makemigrations core
python manage.py makemigrations chat  
python manage.py makemigrations telegram_integration
python manage.py migrate

# Create superuser if it doesn't exist
echo "👤 Creating superuser..."
python manage.py shell << EOF
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@procode.com').exists():
    User.objects.create_superuser('admin', 'admin@procode.com', 'admin123')
    print('Superuser created: admin@procode.com / admin123')
else:
    print('Superuser already exists')
EOF

# Collect static files
echo "📂 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Django setup complete!"