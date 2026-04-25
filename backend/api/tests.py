from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Contact

class ContactAPITestCase(APITestCase):
    def setUp(self):
        # Эта функция запускается ПЕРЕД каждым тестом.
        # Создаем тестового пользователя
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        # Искусственно авторизуем его (выдаем "токен" для тестов)
        self.client.force_authenticate(user=self.user)

    def test_create_contact(self):
        # 1. Подготавливаем данные
        payload = {
            'first_name': 'Иван',
            'last_name': 'Тестовый',
            'email': 'ivan@test.com',
            'phone': '12345'
        }
        
        # 2. Делаем POST-запрос к нашему API
        response = self.client.post('/api/contacts/', payload)
        
        # 3. Проверяем результаты (Asserts)
        # Проверяем, что сервер ответил статусом 201 (Создано)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Проверяем, что контакт реально появился в базе данных
        self.assertEqual(Contact.objects.count(), 1)
        
        # Проверяем, что имя сохранилось правильно
        contact = Contact.objects.first()
        self.assertEqual(contact.first_name, 'Иван')
        
        # Проверяем, что контакт привязался к нашему тестовому пользователю
        self.assertEqual(contact.user, self.user)