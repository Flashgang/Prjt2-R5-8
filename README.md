# Prjt2-R5-8
# Système de Gestion de Bibliothèque

## Projet R5-8 
 Grp : - `Naharro Guerby` - `Bonnard Nathan` - `Le Bastard Théo`

 ----
 Une application web full-stack permettant de gérer le catalogue d'une bibliothèque, les emprunts des étudiants et les statistiques administratives.

## Comptes de test
La base de données est automatiquement remplie avec des données au démarrage :

| Rôle | Utilisateur | Mot de passe |
| --- | --- | --- |
|Bibliothecaire|admin|admin|
|Enseignant|Professeur Tournesol|pwd123|
|Enseignant|stephen Hawking|pwd123|
|Élève|Ambre|pwd123|
|Élève|Marine|pwd123|
|Élève|Tom|pwd123|
|Élève|Luc|pwd123|

## Fonctionnalités

Pour les Étudiants & Enseignants

- `Catalogue` : Recherche par titre, auteur ou catégorie.

- `Grille adaptative` : Affichage optimisé sur tous les écrans (4 livres par ligne sur PC).

- `Détails riches` : Consultation de l'ISBN, éditeur, nombre de pages et résumé.

- `Emprunts` : Système de réservation avec détection automatique des retards.

- `Alertes` : Pop-up d'accueil prévenant des livres à rendre prochainement.

## Pour les Bibliothécaires (Admin)

`Dashboard Statistique` : Visualisation des livres populaires, top lecteurs et répartition par rôles.

`Gestion des Livres` : CRUD complet (Ajout, Modification, Suppression) avec tous les champs techniques.

`Gestion des Utilisateurs` : Contrôle des accès et suppression des comptes.

`Suivi des retours` : Interface dédiée pour valider le retour des livres empruntés.

## Installation (Docker)

Le projet est entièrement "Dockerisé" pour garantir un fonctionnement identique sur toutes les machines.

Prérequis

- Docker Desktop installé et lancé.
- Git (optionnel).

### Lancement rapide

Cloner le projet (ou extraire l'archive) :

```Bash
git clone <url-du-repo>
cd bibliotheque
```

### Lancer les conteneurs :

```Bash
docker-compose up --build
```

Accéder aux applications :

`Frontend` : http://localhost:5173

`Backend (API)` : http://localhost:8000/api/

## Architecture Technique

`Frontend` : React 18, Vite, Material UI (MUI v6).

`Backend` : Django 5, Django REST Framework.

`Base de données` : PostgreSQL 16.

`Conteneurisation` : Docker & Docker Compose.

