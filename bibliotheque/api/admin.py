from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Book, Category, Loan, Role, User

# On enregistre les modèles pour qu'ils apparaissent dans l'admin
admin.site.register(Book)
admin.site.register(Category)
admin.site.register(Loan)
admin.site.register(Role)

# Pour l'utilisateur personnalisé, on utilise l'interface spéciale de Django
admin.site.register(User, UserAdmin)