#!/bin/sh
set -e

echo "--- DÉMARRAGE DU CONTENEUR ---"

echo "1. Attente de la base de données..."

echo "2. Application des migrations..."
python manage.py makemigrations
python manage.py migrate

# On prend uniquement la dernière ligne pour éviter les logs parasites
echo "Checking user count..."
USER_COUNT=$(python manage.py shell -c "from django.contrib.auth import get_user_model; print(get_user_model().objects.count())" | tail -n 1)

# On nettoie d'éventuels espaces invisibles
USER_COUNT=$(echo "$USER_COUNT" | tr -d '[:space:]')

echo "Nombre d'utilisateurs trouvés : '$USER_COUNT'"

if [ "$USER_COUNT" = "0" ]; then
    echo ">>> BASE VIDE DÉTECTÉE ($USER_COUNT user) <<<"
    echo "3. Lancement du script d'initialisation automatique..."
    python manage.py populate_db
    echo ">>> INITIALISATION TERMINÉE <<<"
else
    echo ">>> Données déjà présentes ($USER_COUNT utilisateurs). On ne touche à rien. <<<"
fi

echo "4. Démarrage du serveur Django..."
exec python manage.py runserver 0.0.0.0:8000