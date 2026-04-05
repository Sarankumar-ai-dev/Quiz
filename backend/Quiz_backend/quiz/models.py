from django.db import models
from login.models import User

class Quiz(models.Model):
    title = models.CharField(max_length=200)
    key = models.CharField(max_length=10, unique=True)
    total_question = models.IntegerField(default=0)
    pass_mark = models.IntegerField(default=0)
    duration = models.IntegerField(null=True, blank=True) # minutes
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quizzes')

    def __str__(self):
        return self.title


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question = models.CharField(max_length=500)
    option1 = models.CharField(max_length=200)
    option2 = models.CharField(max_length=200)
    option3 = models.CharField(max_length=200)
    option4 = models.CharField(max_length=200)
    answer = models.IntegerField() # 1, 2, 3 or 4

    def __str__(self):
        return self.question


class Attempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    attempter_name = models.CharField(max_length=100)
    attempter_email = models.EmailField()
    total_questions = models.IntegerField()
    correct = models.IntegerField()
    wrong = models.IntegerField()
    skipped = models.IntegerField()
    percentage = models.FloatField()
    passed = models.BooleanField()
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.attempter_name} - {self.quiz.title}"
