import csv
import os
from django.core.management.base import BaseCommand
from api.models import Book, Category

class Command(BaseCommand):
    help = 'Importe les livres depuis books.csv'

    def handle(self, *args, **kwargs):
        self.stdout.write("Lecture du fichier books.csv...")
        file_path = 'books.csv'  

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR("Fichier books.csv introuvable !"))
            return

        total = 0
        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    # On nettoie les espaces éventuels
                    cat_name = row['category'].strip()
                    category, _ = Category.objects.get_or_create(name=cat_name)

                    try:
                        stock = int(row['stock'])
                        page_count = int(row['page_count'])
                    except ValueError:
                        stock = 0
                        page_count = 0

                    book, created = Book.objects.get_or_create(
                        title=row['title'],
                        defaults={
                            'author': row['author'],
                            'category': category,
                            'cover': row['cover'],
                            'description': row['description'],
                            'isbn': row['isbn'],
                            'editor': row['editor'],
                            'page_count': page_count,
                            'stock': stock,
                            'access_level': row['access_level'],
                            'status': 'Disponible' if stock > 0 else 'Indisponible'
                        }
                    )
                    if created: total += 1

            self.stdout.write(self.style.SUCCESS(f"TERMINÉ ! {total} livres ajoutés."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Erreur CSV : {str(e)}"))