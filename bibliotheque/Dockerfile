# Utiliser une image Python légère
FROM python:3.11-slim

# Empêcher Python d'écrire des fichiers .pyc et activer les logs en direct
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Dossier de travail dans le conteneur
WORKDIR /app

# Installer dos2unix
RUN apt-get update && apt-get install -y dos2unix

# Copier le script
COPY entrypoint.sh /entrypoint.sh

# FORCER la conversion en format Linux et donner les droits
RUN dos2unix /entrypoint.sh && chmod +x /entrypoint.sh

# Installer les dépendances système pour Postgres
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Installer les dépendances Python
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copier le reste du projet
COPY . /app/

# Commande par défaut 
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]