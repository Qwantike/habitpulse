#!/bin/bash

# Script de setup de la base de données PostgreSQL pour HabitPulse

set -e

echo "🐘 Configuration de PostgreSQL pour HabitPulse..."

# Vérifier que psql est installé
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL n'est pas installé. Veuillez l'installer d'abord."
    echo "   Sur Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "   Sur macOS avec Homebrew: brew install postgresql"
    exit 1
fi

# Charger les variables d'environnement
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️  Fichier .env non trouvé. Utilisation des valeurs par défaut."
    DB_HOST="localhost"
    DB_PORT="5432"
    DB_USER="postgres"
    DB_PASSWORD=""
    DB_NAME="habitpulse_db"
fi

echo "Configuration utilisée:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  User: $DB_USER"
echo "  Database: $DB_NAME"
echo ""

# Créer la base de données et les tables
echo "📝 Création de la base de données et des tables..."

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -f schema.sql

echo ""
echo "✅ Base de données configurée avec succès!"
echo ""
echo "Prochaines étapes:"
echo "  1. npm install"
echo "  2. Configurer les variables d'environnement dans .env"
echo "  3. npm run dev"
