import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.utils import timezone
from api.models import Category, Book, Loan, Role

User = get_user_model()

class Command(BaseCommand):
    help = 'Remplit la base avec des utilisateurs et des emprunts INTELLIGENTS.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("--- DÉBUT DU NETTOYAGE ---"))
        Loan.objects.all().delete()
        Book.objects.all().delete()
        Category.objects.all().delete()
        User.objects.exclude(is_superuser=True).delete()
        Role.objects.all().delete()

        # 1. RÔLES & USERS
        self.stdout.write("Création des rôles et utilisateurs...")
        role_biblio = Role.objects.create(name="Bibliothécaire")
        role_prof = Role.objects.create(name="Enseignant")
        role_eleve = Role.objects.create(name="Élève")

        User.objects.create_user(username="admin", password="admin", role=role_biblio)
        
        users_list = []
        for name in ["Professeur Tournesol", "Stephen Hawkins"]:
            users_list.append(User.objects.create_user(username=name, password="pwd123", role=role_prof))
        for name in ["Tom", "Marine", "Ambre", "Luc"]:
            users_list.append(User.objects.create_user(username=name, password="pwd123", role=role_eleve))

        # 2. IMPORT LIVRES
        self.stdout.write(self.style.SUCCESS("Import des livres..."))
        call_command('import_books')
        all_books = list(Book.objects.all())

        # 3. EMPRUNTS (AVEC RETARDS !)
        self.stdout.write("Génération des emprunts...")
        
        # Cas 1 : Des livres rendus (Historique)
        for i in range(10):
            book = random.choice(all_books)
            user = random.choice(users_list)
            # Emprunté il y a 2 mois, rendu il y a 1 mois
            loan_date = timezone.now() - timedelta(days=60)
            return_date = timezone.now() - timedelta(days=30)
            Loan.objects.create(book=book, user=user, loan_date=loan_date, return_date=return_date, status="Retourné")

        # Cas 2 : Des livres en cours (Dans les temps)
        for i in range(5):
            book = random.choice(all_books)
            user = random.choice(users_list)
            # Emprunté hier
            loan_date = timezone.now() - timedelta(days=1)
            # A rendre dans 14 jours (Date Limite)
            due_date = timezone.now() + timedelta(days=14)
            
            Loan.objects.create(book=book, user=user, loan_date=loan_date, return_date=due_date, status="En cours")
            if book.stock > 0: book.stock -= 1; book.save()

        # Cas 3 : DES RETARDS
        for i in range(4): # 4 retards créés
            book = random.choice(all_books)
            user = random.choice(users_list)
            
            # Emprunté il y a 30 jours
            loan_date = timezone.now() - timedelta(days=30)
            # Devait être rendu il y a 15 jours (Date Limite dépassée !)
            due_date = timezone.now() - timedelta(days=15)
            
            Loan.objects.create(book=book, user=user, loan_date=loan_date, return_date=due_date, status="En cours")
            if book.stock > 0: book.stock -= 1; book.save()

        self.stdout.write(self.style.SUCCESS("TERMINÉ ! Données insérées avec des retards simulés."))