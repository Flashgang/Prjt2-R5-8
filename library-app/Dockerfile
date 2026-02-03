# On utilise une image Node légère
FROM node:22-alpine

# Dossier de travail dans le conteneur
WORKDIR /app

# On copie les fichiers de dépendances
COPY package*.json ./

# On installe les dépendances
RUN npm install

# On copie tout le reste du code
COPY . .

# On expose le port de Vite
EXPOSE 5173

# On lance le serveur de développement accessible depuis l'extérieur
CMD ["npm", "run", "dev", "--", "--host"]