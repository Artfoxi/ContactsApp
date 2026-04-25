from django.db import models
from django.contrib.auth.models import User

class Contact(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contacts')
    first_name = models.CharField(max_length=100, verbose_name="Имя")
    last_name = models.CharField(max_length=100, blank=True, verbose_name="Фамилия")
    email = models.EmailField(unique=True, verbose_name="Почта")
    phone = models.CharField(max_length=20, blank=True, verbose_name="Номер телефона")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Создан")

    def __str__(self):
        return f"Контакт {self.first_name} {self.last_name}"

    class Meta:
        verbose_name = "Контакт"
        verbose_name_plural = "Контакты"