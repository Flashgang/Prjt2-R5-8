from rest_framework import viewsets
from django.contrib.auth import get_user_model
from .models import Book, Category, Loan, Role
from .serializers import BookSerializer, CategorySerializer, UserSerializer, LoanSerializer, RoleSerializer
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Count, Q

User = get_user_model()

# 1. Vue pour les Utilisateurs
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

# 2. Vue pour les Livres
class BookViewSet(viewsets.ModelViewSet):
    serializer_class = BookSerializer

    def get_queryset(self):
        queryset = Book.objects.all()
        return queryset

# 3. Vue pour les Catégories
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
# 4. Vue pour les Rôles
class RoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Django vérifie si le mot de passe correspond
    user = authenticate(username=username, password=password)
    
    if user is not None:
        return Response({
            "id": user.id,
            "username": user.username,
            # On renvoie le rôle pour que React sache quoi afficher
            "role": user.role.name if user.role else "Aucun"
        })
    else:
        return Response({"error": "Nom d'utilisateur ou mot de passe incorrect"}, status=400)
    

@api_view(['POST'])
def borrow_book(request, pk):
    try:
        book = Book.objects.get(pk=pk)
        user_id = request.data.get('user_id')
        user = User.objects.get(pk=user_id)
        
        # Récupération des choix du prof
        quantity = int(request.data.get('quantity', 1))
        custom_date = request.data.get('return_date') # Format 'YYYY-MM-DD'

        # 1. Vérification du Stock
        if book.stock < quantity:
             return Response({"error": f"Pas assez de stock ! Il n'en reste que {book.stock}."}, status=400)

        # 2. Calcul de la date de retour
        if user.role.name == 'Enseignant' and custom_date:
            # Le prof a choisi sa date
            return_date = datetime.strptime(custom_date, '%Y-%m-%d')
        else:
            # Par défaut (Élève ou Prof sans choix) : 14 jours
            return_date = timezone.now() + timedelta(days=14)

        # 3. Création des emprunts (On crée une ligne par livre emprunté)
        for _ in range(quantity):
            Loan.objects.create(
                book=book,
                user=user,
                loan_date=timezone.now(),
                return_date=return_date,
                status='En cours'
            )

        # 4. Mise à jour du stock
        book.stock -= quantity
        if book.stock == 0:
            book.status = 'Indisponible'
        book.save()

        return Response({"message": f"{quantity} livre(s) emprunté(s) avec succès !"})

    except Book.DoesNotExist:
        return Response({"error": "Livre introuvable"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    

@api_view(['GET'])
def my_loans(request):
    user_id = request.query_params.get('user_id')

    if not user_id:
        return Response({"error": "ID utilisateur manquant"}, status=400)

    # On ne garde que les emprunts de cet utilisateur précis
    loans = Loan.objects.filter(user=user_id).order_by('-loan_date')

    serializer = LoanSerializer(loans, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def dashboard_stats(request):
    # 1. Compter le nombre total de livres
    total_books = Book.objects.count()
    
    # 2. Compter les emprunts en cours (ceux qui ne sont pas rendus)
    active_loans = Loan.objects.filter(status='En cours').count()
    
    # 3. Compter les utilisateurs (moins les superadmin pour être précis)
    total_users = User.objects.filter(is_superuser=False).count()
    
    return Response({
        "total_books": total_books,
        "active_loans": active_loans,
        "total_users": total_users
    })


@api_view(['POST'])
def return_book(request, loan_id):
    try:
        loan = Loan.objects.get(pk=loan_id)
        
        # Si c'est déjà rendu, on arrête
        if loan.status == 'Retourné':
            return Response({"error": "Cet emprunt est déjà clôturé"}, status=400)

        # 1. On met à jour l'emprunt
        loan.status = 'Retourné'
        loan.return_date = timezone.now()
        loan.save()

        # 2. On rend le livre disponible
        book = loan.book
        book.status = 'Disponible'
        book.save()

        return Response({"message": "Livre rendu avec succès !"})

    except Loan.DoesNotExist:
        return Response({"error": "Emprunt introuvable"}, status=404)
    

@api_view(['GET'])
def all_active_loans(request):
    # Récupère tous les emprunts "En cours"
    loans = Loan.objects.filter(status='En cours').order_by('loan_date')
    serializer = LoanSerializer(loans, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def dashboard_stats(request):
    today = timezone.now()

    # 1. Stats Générales
    total_books = Book.objects.count()
    total_users = User.objects.filter(is_superuser=False).count()
    active_loans = Loan.objects.filter(status='En cours').count()

    # 2. Les Retards
    late_loans = Loan.objects.filter(status='En cours', return_date__lt=today).count()

    # 3. Top 5 des livres populaires
    popular_books = Loan.objects.values('book__title') \
        .annotate(total_loans=Count('id')) \
        .order_by('-total_loans')[:5]

    # 4. Répartition par catégorie
    books_by_category = Book.objects.values('category__name') \
        .annotate(count=Count('id')) \
        .order_by('-count')
    
    # 5. Top 5 des Meilleurs Lecteurs (Ceux qui ont le plus d'emprunts au total)
    top_readers = Loan.objects.values('user__username') \
        .annotate(total_loans=Count('id')) \
        .order_by('-total_loans')[:5]

    # 6. Répartition des emprunts par Rôle (Élève vs Prof)
    loans_by_role = Loan.objects.values('user__role__name') \
        .annotate(count=Count('id'))

    return Response({
        "total_books": total_books,
        "total_users": total_users,
        "active_loans": active_loans,
        "late_loans": late_loans,
        "popular_books": popular_books,
        "books_by_category": books_by_category,
        "top_readers": top_readers,     
        "loans_by_role": loans_by_role  
    })



    