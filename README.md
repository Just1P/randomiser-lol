# Randomiseur LoL

Une application web pour générer aléatoirement des rôles pour les équipes de League of Legends, avec possibilité d'assigner des champions aléatoires adaptés à chaque rôle.

## Fonctionnalités

- Génération aléatoire de rôles pour les joueurs
- Attribution de champions aléatoires adaptés à chaque rôle
- Historique des compositions d'équipe générées
- Mode multijoueur avec système de rooms (nécessite configuration Firebase)

## Démarrage rapide

1. Cloner le projet
2. Installer les dépendances:

```bash
npm install
```

3. Lancer le serveur de développement:

```bash
npm run dev
```

4. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Configuration du mode multijoueur

Le mode multijoueur utilise Firebase Firestore pour synchroniser les données entre les utilisateurs. Pour l'utiliser:

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activez Firestore et Authentication (email/password)
3. Copiez le fichier `.env.local.example` en `.env.local`
4. Remplacez les valeurs par les clés de votre projet Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

5. Redémarrez le serveur de développement

## Comment utiliser le mode multijoueur

1. Sur la page d'accueil, cliquez sur "Mode multijoueur"
2. Vous pouvez soit:
   - Créer une nouvelle room (vous deviendrez l'hôte)
   - Rejoindre une room existante en utilisant un code à 6 caractères
3. Partagez le code de room avec vos amis pour qu'ils puissent vous rejoindre
4. Une fois dans la room, ajoutez des joueurs et générez l'équipe
5. Toutes les actions sont synchronisées en temps réel pour tous les participants

## Déploiement

L'application peut être déployée sur Vercel ou tout autre hébergeur compatible avec Next.js:

```bash
npm run build
```

## Technologies utilisées

- [Next.js 14](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- [Riot API](https://developer.riotgames.com/) (pour les données de champions)
