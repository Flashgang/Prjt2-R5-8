from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. Le modèle Role
class Role(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# 2. Le modèle User
class User(AbstractUser):
    # On ajoute le lien vers le Rôle ici
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)

# 3. Le modèle Category
class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

# 4. Le modèle Book
class Book(models.Model):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    category = models.ForeignKey(Category, related_name='books', on_delete=models.CASCADE)
    cover = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True)
    stock = models.IntegerField(default=1) 
    access_level = models.CharField(
        max_length=30, 
        choices=[('All', 'Tous'), ('Teacher', 'Enseignant uniquement')],
        default='All'
    )
    status = models.CharField(max_length=20, default='Disponible')
    isbn = models.CharField(max_length=20, blank=True, null=True)
    editor = models.CharField(max_length=100, blank=True, null=True)
    page_count = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.title

# 5. Le modèle Loan
class Loan(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    loan_date = models.DateTimeField()
    return_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, default='En cours')

    def __str__(self):
        return f"{self.user.username} - {self.book.title}"