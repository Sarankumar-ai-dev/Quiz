from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import User
import json

@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username", "").strip()
            email = data.get("email", "").strip().lower()
            password = data.get("password", "").strip()
            role = data.get("role", "").strip()

            if not username or not email or not password or not role:
                return JsonResponse({"error": "All fields are required"}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email already registered. Please sign in."}, status=400)

            User.objects.create(username=username, email=email, password=password, role=role)
            return JsonResponse({"message": "User created successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid method"}, status=405)


@csrf_exempt
def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email", "").strip().lower()
            password = data.get("password", "").strip()
            role = data.get("role", "").strip()

            if not email or not password:
                return JsonResponse({"error": "Email and password required"}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({"error": "No account found with this email"}, status=400)

            if user.password != password:
                return JsonResponse({"error": "Incorrect password"}, status=400)

            if role and user.role != role:
                return JsonResponse({"error": f"This account is registered as {user.role}, not {role}"}, status=400)

            return JsonResponse({"message": "Login successful", "username": user.username, "role": user.role})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid method"}, status=405)
