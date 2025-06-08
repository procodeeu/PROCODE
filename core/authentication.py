import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

User = get_user_model()

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):           
        token = self.extract_token(request)
        if not token:
            return None

        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=['HS256'])
            user_id = payload.get('userId')
            if not user_id:
                return None  # Return None instead of raising exception for invalid payload
            
            user = User.objects.get(id=user_id)
            return (user, token)
        except jwt.ExpiredSignatureError:
            return None  # Return None instead of raising exception for expired tokens
        except jwt.InvalidTokenError:
            return None  # Return None instead of raising exception for invalid tokens
        except User.DoesNotExist:
            return None  # Return None instead of raising exception for missing users

    def extract_token(self, request):
        # Check Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if auth_header and auth_header.startswith('Bearer '):
            return auth_header.split(' ')[1]
        
        # Check cookies
        return request.COOKIES.get('auth-token')