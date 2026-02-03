from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Book, Category, Loan, Role

User = get_user_model()

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    # Lecture : On voit tout l'objet Rôle
    role = RoleSerializer(read_only=True)
    # Écriture : On envoie juste l'ID du rôle
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source='role', write_only=True
    )
    # Écriture : Mot de passe (masqué en lecture)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'role_id', 'password']

    def create(self, validated_data):
        # On extrait le mot de passe pour le hacher proprement
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password) # Cryptage
        user.save()
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model = Book
        fields = '__all__'

class LoanSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    book_cover = serializers.CharField(source='book.cover', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Loan
        fields = ['id', 'book', 'user', 'loan_date', 'return_date', 'status', 'book_title', 'book_cover', 'username']