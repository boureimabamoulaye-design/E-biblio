# BiblioLivre — React + Supabase

## Changements
- Couvertures plus petites et fiches de livres compactes.
- Catalogue responsive : 5 colonnes sur grand écran, 4 sur tablette et 3 sur mobile.
- Barre de navigation en bas du téléphone : Accueil, Recherche, Bibliothèque, Compte.
- Création de compte étudiant et connexion avec Supabase Auth (nom, e-mail, mot de passe).
- Schéma de profil étudiant et règles RLS dans `supabase/schema.sql`.

## Lancer
```powershell
npm install
npm run dev
```
Puis ouvrez l'adresse locale affichée par Vite.

## Activer les vrais comptes
1. Créez un projet sur Supabase.
2. Copiez `.env.example` vers `.env`.
3. Dans `.env`, renseignez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` depuis les paramètres API du projet.
4. Dans Supabase > SQL Editor, exécutez le contenu de `supabase/schema.sql`.
5. Dans Authentication, activez le fournisseur Email et configurez la confirmation par e-mail selon vos besoins.
6. Redémarrez Vite après toute modification de `.env`.

Les inscriptions utilisent Supabase Auth. Les profils reçoivent le rôle `student`; ne placez jamais la clé `service_role` dans le code du navigateur.

## Limites actuelles
- Sans fichier `.env`, le formulaire affiche une instruction de configuration et ne crée pas de compte réel.
- Favoris, livres enregistrés et progression sont pour l'instant conservés uniquement dans l'état de l'interface.
- Le lecteur affiche un aperçu, pas encore le contenu réel de fichiers PDF/EPUB.
- Vérifiez les droits de diffusion avant de proposer des livres au public.
