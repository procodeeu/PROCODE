# PROCODE AI - Django + Vue.js + Telegram Bot

Inteligentny asystent AI z integracją Telegram, przepisany na Django backend z Vue.js frontend.

## 🚀 Funkcjonalności

- **Django REST API** - Nowoczesny backend z Django 4.2
- **Vue.js 3 Frontend** - Identyczny design jak poprzednio
- **PostgreSQL** - Nowa czysta baza danych
- **Telegram Bot** - Wykorzystuje istniejący bot (32-znakowe tokeny)
- **JWT Authentication** - Bezpieczne uwierzytelnianie
- **Docker** - Gotowe do wdrożenia na VPS
- **Real-time Chat** - WebSocket chat z AI
- **Kontekst użytkownika** - Personalizacja AI

## 📦 Architektura

```
├── procode/                    # Django project settings
├── core/                       # User management & authentication
├── chat/                       # Chat conversations & AI integration
├── telegram_integration/       # Telegram bot integration
├── frontend/                   # Vue.js 3 frontend
├── scripts/                    # Deployment scripts
└── docker-compose.django.yml   # Docker configuration
```

## 🛠️ Lokalne uruchomienie

1. **Sklonuj repozytorium**
```bash
git clone <repo-url>
cd PROCODE
```

2. **Skonfiguruj environment**
```bash
cp .env.django .env
# Edytuj .env z własnymi wartościami
```

3. **Uruchom aplikację**
```bash
# Opcja 1: Używając skryptu (zalecane)
./start_app.sh

# Opcja 2: Ręcznie
export $(cat .env.django | xargs)
docker-compose -f docker-compose.django.yml up -d --build
```

4. **Otwórz aplikację**
- Frontend: http://localhost:443 (HTTP na porcie 443)
- Django Admin: http://localhost:8000/admin
- API: http://localhost:8000/api

## 🌐 Wdrożenie na VPS

1. **Przygotuj VPS**
```bash
# Zainstaluj Docker i Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

2. **Skopiuj projekt na VPS**
```bash
# Za pomocą git
git clone <repo-url> procode
cd procode

# Lub scp
scp -r ./PROCODE user@vps-ip:/home/user/procode
```

3. **Skonfiguruj środowisko**
```bash
cp .env.django .env
nano .env
# Ustaw właściwe wartości dla produkcji:
# - DEBUG=False
# - DJANGO_SECRET_KEY=<strong-secret>
# - JWT_SECRET=<strong-secret>
# - Własne hasła do bazy danych
```

4. **Uruchom deployment**
```bash
./deploy_vps.sh
```

## 🔧 Konfiguracja

### Environment Variables (.env)

```bash
# Django Configuration
DEBUG=False
DJANGO_SECRET_KEY=your-super-secret-django-key

# Database Configuration  
POSTGRES_DB=procode_django
POSTGRES_USER=postgres
POSTGRES_PASSWORD=strong-password

# OpenRouter AI API
OPENROUTER_API_KEY=sk-or-v1-...

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567:ABCDEF...

# JWT Security
JWT_SECRET=your-jwt-secret-key
```

### Dostępne API Endpoints

```
# Authentication
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/logout/

# User Context
GET /api/auth/context/
POST /api/auth/context/update/

# Models
GET /api/auth/current-model/
POST /api/auth/current-model/update/

# Chat
GET /api/chat/conversations/
POST /api/chat/conversations/create/
GET /api/chat/conversations/{id}/
POST /api/chat/conversations/{id}/messages/

# Telegram
POST /api/telegram/generate-token/
GET /api/telegram/status/
```

## 🤖 Telegram Bot

Bot automatycznie łączy się z Django backend. Funkcjonalności:

- `/start` - Instrukcje połączenia
- `/connect <token>` - Połączenie konta (32-znakowe tokeny)
- Rozmowy z AI z kontekstem użytkownika
- Proaktywne powiadomienia

## 📊 Administracja

Django Admin jest dostępny pod `/admin/`:

**Domyślne konto admin:**
- Email: `admin@procode.com`
- Hasło: `admin123`

**Zarządzaj:**
- Użytkownikami
- Konwersacjami  
- Wiadomościami
- Połączeniami Telegram

## 🔒 Bezpieczeństwo

- JWT tokeny w httpOnly cookies
- CORS skonfigurowany
- PostgreSQL z własnymi hasłami
- Secrets w environment variables
- Rate limiting (wbudowany w Django)

## 📱 Frontend (Vue.js 3)

Identyczny design jak wcześniej:
- Responsywny dark theme
- Tailwind CSS  
- Vue Router
- Pinia state management
- Axios HTTP client

## 🚨 Troubleshooting

### Sprawdź logi
```bash
# Wszystkie serwisy
docker-compose -f docker-compose.django.yml logs -f

# Konkretny serwis
docker-compose -f docker-compose.django.yml logs -f django
docker-compose -f docker-compose.django.yml logs -f telegram-bot
```

### Restart serwisów
```bash
docker-compose -f docker-compose.django.yml restart
```

### Reset bazy danych
```bash
docker-compose -f docker-compose.django.yml down -v
docker-compose -f docker-compose.django.yml up -d --build
```

## 📈 Skalowanie na VPS

Dla większej wydajności:

1. **Dodaj nginx reverse proxy**
2. **Skonfiguruj SSL (certbot)**
3. **Zwiększ workers w gunicorn**
4. **Dodaj Redis cache**
5. **Oddziel bazę danych**

## 🆕 Migracja z Nuxt.js

Wszystkie dane z poprzedniej wersji można zmigrować:
1. Eksportuj dane z poprzedniej bazy
2. Stwórz skrypt migracji Django
3. Zaimportuj do nowych modeli

## 📞 Wsparcie

W przypadku problemów:
1. Sprawdź logi Docker
2. Zweryfikuj konfigurację .env
3. Upewnij się że porty są otwarte
4. Sprawdź dostęp do bazy danych

---

**Nowa aplikacja Django jest gotowa do wdrożenia na VPS!** 🎉