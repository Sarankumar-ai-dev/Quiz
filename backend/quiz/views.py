from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Quiz, Question, Attempt
from login.models import User
from .utils import generate_key
import json


# ---------- CREATE QUIZ ----------
@csrf_exempt
def create_quiz(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email", "").strip().lower()
            title = data.get("title", "").strip()
            total_question = int(data.get("total_question", 0))
            pass_mark = int(data.get("pass_mark", 0))
            duration = data.get("duration")
            questions_data = data.get("questions", [])

            if not title or not email:
                return JsonResponse({"error": "Title and email required"}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({"error": "User not found"}, status=400)

            # Generate unique key
            key = generate_key()
            while Quiz.objects.filter(key=key).exists():
                key = generate_key()

            quiz = Quiz.objects.create(
                title=title,
                key=key,
                total_question=total_question,
                pass_mark=pass_mark,
                duration=int(duration) if duration else None,
                created_by=user
            )

            for q in questions_data:
                Question.objects.create(
                    quiz=quiz,
                    question=q.get("question", ""),
                    option1=q.get("option1", ""),
                    option2=q.get("option2", ""),
                    option3=q.get("option3", ""),
                    option4=q.get("option4", ""),
                    answer=int(q.get("answer", 1))
                )

            return JsonResponse({"message": "Quiz created", "key": key})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid method"}, status=405)


# ---------- LIST QUIZZES (by creator email) ----------
@csrf_exempt
def list_quizzes(request):
    if request.method == "GET":
        email = request.GET.get("email", "").strip().lower()
        try:
            user = User.objects.get(email=email)
            quizzes = Quiz.objects.filter(created_by=user)
            result = [{"id": q.id, "title": q.title, "key": q.key} for q in quizzes]
            return JsonResponse({"quizzes": result})
        except User.DoesNotExist:
            return JsonResponse({"quizzes": []})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid method"}, status=405)


# ---------- DELETE QUIZ ----------
@csrf_exempt
def delete_quiz(request, quiz_id):
    if request.method == "DELETE":
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            quiz.delete()
            return JsonResponse({"message": "Deleted"})
        except Quiz.DoesNotExist:
            return JsonResponse({"error": "Quiz not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid method"}, status=405)


# ---------- QUIZ STATS (for creator dashboard detail) ----------
@csrf_exempt
def quiz_stats(request, quiz_id):
    if request.method == "GET":
        try:
            quiz = Quiz.objects.get(id=quiz_id)
            attempts = Attempt.objects.filter(quiz=quiz)
            total = attempts.count()
            passed = attempts.filter(passed=True).count()
            failed = total - passed
            avg_pct = round(sum(a.percentage for a in attempts) / total, 2) if total > 0 else 0

            # Simple ML prediction using pass rate trend
            ml_prediction = None
            if total >= 3:
                pass_rate = round((passed / total) * 100, 1)
                if pass_rate >= 70:
                    difficulty = "easy"
                    insight = "Most participants pass easily. Consider increasing difficulty."
                elif pass_rate >= 40:
                    difficulty = "medium"
                    insight = "Quiz is well-balanced for most learners."
                else:
                    difficulty = "hard"
                    insight = "Many participants struggle. Consider reviewing content."

                ml_prediction = {
                    "predicted_pass_rate": pass_rate,
                    "difficulty": difficulty,
                    "insight": insight
                }

            return JsonResponse({
                "title": quiz.title,
                "participants": total,
                "passed": passed,
                "failed": failed,
                "percentage": avg_pct,
                "ml_prediction": ml_prediction
            })
        except Quiz.DoesNotExist:
            return JsonResponse({"error": "Quiz not found"}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid method"}, status=405)


# ---------- VALIDATE QUIZ KEY (attempter) ----------
@csrf_exempt
def validate_key(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            key = data.get("key", "").strip().upper()
            quiz = Quiz.objects.get(key=key)
            return JsonResponse({
                "message": "Valid",
                "title": quiz.title,
                "duration": quiz.duration
            })
        except Quiz.DoesNotExist:
            return JsonResponse({"error": "Invalid quiz key"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid method"}, status=405)


# ---------- GET QUESTIONS (attempter) ----------
@csrf_exempt
def get_questions(request):
    if request.method == "GET":
        key = request.GET.get("key", "").strip().upper()
        try:
            quiz = Quiz.objects.get(key=key)
            qs = Question.objects.filter(quiz=quiz)
            result = [{
                "id": q.id,
                "question": q.question,
                "option1": q.option1,
                "option2": q.option2,
                "option3": q.option3,
                "option4": q.option4,
            } for q in qs]
            return JsonResponse({"questions": result})
        except Quiz.DoesNotExist:
            return JsonResponse({"error": "Invalid key"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid method"}, status=405)


# ---------- SUBMIT QUIZ (attempter) ----------
@csrf_exempt
def submit_quiz(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            key = data.get("key", "").strip().upper()
            answers = data.get("answers", [])
            attempter_name = data.get("attempter_name", "Unknown")
            attempter_email = data.get("attempter_email", "")

            try:
                quiz = Quiz.objects.get(key=key)
            except Quiz.DoesNotExist:
                return JsonResponse({"error": "Invalid quiz key"}, status=400)

            all_questions = Question.objects.filter(quiz=quiz)
            total_questions = all_questions.count()

            score = 0
            result_details = []
            answered_ids = []

            for ans in answers:
                question_id = ans.get("question_id")
                selected = ans.get("selected")
                if not question_id:
                    continue
                try:
                    q = Question.objects.get(id=question_id, quiz=quiz)
                except Question.DoesNotExist:
                    continue

                answered_ids.append(q.id)
                options = {1: q.option1, 2: q.option2, 3: q.option3, 4: q.option4}
                correct_option = options.get(q.answer)
                selected_option = options.get(selected) if selected else None
                is_correct = (q.answer == selected) if selected else False

                if is_correct:
                    score += 1

                result_details.append({
                    "question": q.question,
                    "selected": selected_option or "Not answered",
                    "correct_answer": correct_option,
                    "is_correct": is_correct
                })

            attended = len(answered_ids)
            skipped = total_questions - attended
            wrong = attended - score
            percentage = round((score / total_questions) * 100, 2) if total_questions > 0 else 0
            passed = score >= quiz.pass_mark

            # Save attempt
            Attempt.objects.create(
                quiz=quiz,
                attempter_name=attempter_name,
                attempter_email=attempter_email,
                total_questions=total_questions,
                correct=score,
                wrong=wrong,
                skipped=skipped,
                percentage=percentage,
                passed=passed
            )

            return JsonResponse({
                "total_questions": total_questions,
                "attended": attended,
                "skipped": skipped,
                "correct": score,
                "wrong": wrong,
                "percentage": percentage,
                "pass_mark": quiz.pass_mark,
                "passed": passed,
                "details": result_details
            })

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid method"}, status=405)
