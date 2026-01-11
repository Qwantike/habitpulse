# Setup PostgreSQL pour HabitPulse

## 📋 Prérequis

- PostgreSQL 12+ installé
- Node.js 16+
- npm ou yarn

## 🚀 Étapes d'installation

### 1. Installer PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Télécharger depuis [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Configurer les variables d'environnement

Copier `.env.example` en `.env`:
```bash
cp .env.example .env
```

Éditer `.env` avec vos paramètres PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
DB_NAME=habitpulse_db
```

### 3. Créer la base de données

**Option A: Utiliser le script setup (Linux/macOS)**
```bash
chmod +x setup-db.sh
./setup-db.sh
```

**Option B: Manuellement avec psql**
```bash
psql -U postgres -h localhost -p 5432 -f schema.sql
```

**Option C: Avec pgAdmin (GUI)**
1. Ouvrir pgAdmin
2. Créer une nouvelle base de données `habitpulse_db`
3. Exécuter le contenu de `schema.sql`

### 4. Installer les dépendances Node

```bash
npm install
```

### 5. Démarrer le serveur

```bash
npm run dev
```

Le serveur démarrera sur `http://localhost:5000`

## 🧪 Vérifier la connexion

```bash
# Tester la connexion à PostgreSQL
psql -U postgres -h localhost -p 5432 -d habitpulse_db -c "SELECT version();"

# Lister les tables créées
psql -U postgres -h localhost -p 5432 -d habitpulse_db -c "\dt"
```

## 🔧 Commandes PostgreSQL utiles

```bash
# Se connecter à la base
psql -U postgres -h localhost -p 5432 -d habitpulse_db

# Dans psql:
\dt                    # Lister les tables
\d users               # Voir la structure d'une table
SELECT * FROM users;   # Afficher les données
\du                    # Lister les utilisateurs
\l                     # Lister les bases de données
\q                     # Quitter
```

## ⚠️ Dépannage

### Erreur: "connection refused"
- Vérifier que PostgreSQL est en cours d'exécution: `sudo systemctl status postgresql`
- Redémarrer: `sudo systemctl restart postgresql`

### Erreur: "permission denied" sur le mot de passe
- Vérifier les permissions PostgreSQL
- Utiliser `sudo` si nécessaire: `sudo -u postgres psql`

### Erreur: "database does not exist"
- Vérifier le nom de la DB dans `.env`
- Recréer avec: `./setup-db.sh`

### Erreur: "role does not exist"
- Créer l'utilisateur PostgreSQL:
```bash
sudo -u postgres createuser -P votre_user
```

## 📊 Schéma de la base de données

```
users
├── id (SERIAL PRIMARY KEY)
├── username (VARCHAR)
├── email (VARCHAR UNIQUE)
├── password (VARCHAR)
└── created_at (TIMESTAMP)

habits
├── id (SERIAL PRIMARY KEY)
├── user_id (INT FK → users.id)
├── title (VARCHAR)
├── description (TEXT)
├── type (user_type: 'boolean', 'numeric')
├── period (period_type: 'daily', 'weekly')
├── goal (INT)
├── unit (VARCHAR)
├── color (VARCHAR)
└── created_at (TIMESTAMP)

habit_logs
├── id (SERIAL PRIMARY KEY)
├── habit_id (INT FK → habits.id)
├── date (DATE)
├── value (FLOAT)
├── created_at (TIMESTAMP)
└── UNIQUE (habit_id, date)
```

## 🔐 Sécurité

- **En production**: Utiliser un mot de passe fort pour PostgreSQL
- **En production**: Configurer SSL pour PostgreSQL
- **En production**: Utiliser des variables d'environnement sécurisées
- **En production**: Limiter les accès à la base de données

## 📝 Notes

- PostgreSQL utilise les indices pour améliorer les performances (ajoutés automatiquement)
- Les types ENUM garantissent l'intégrité des données
- Les contraintes UNIQUE empêchent les doublons
- Les clés étrangères garantissent la cohérence des données
