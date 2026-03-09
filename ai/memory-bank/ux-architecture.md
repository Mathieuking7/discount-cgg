# SIVFlow - Architecture UX Complete

**Agent**: ArchitectUX
**Date**: 2026-03-09
**Cible**: Pros auto 45+, mobile-first, friendly/accessible

---

## 1. LANDING PAGE (/)

### 1.1 Architecture d'information

1. **Navbar** - Logo, navigation ancrees, CTA "Espace Pro" / "Simuler mon prix"
2. **Hero** - Tagline + sous-titre + CTA principal + image vehicule
3. **SimulateurSection** - Simulateur de prix integre (immatriculation -> prix)
4. **Services** - Grille des demarches disponibles (DA, DC, CG, etc.)
5. **TrustSection** - Chiffres cles (nombre de demarches, note Google, delai moyen)
6. **GoogleReviewsCarousel** - Avis clients avec etoiles
7. **Process** - Etapes numerotees 1-2-3 (Simulez, Envoyez, Recevez)
8. **WhyUs** - Avantages competitifs
9. **FAQ** - Accordion des questions frequentes
10. **ContactForm** - Formulaire simple (nom, email, message)
11. **Footer** - Liens legaux, contact, reseaux

### 1.2 User flow simplifie

```
1. Visiteur arrive sur la page
2. Lit la tagline -> comprend le service
3. Voit le simulateur -> entre son immatriculation
4. Obtient un prix -> CTA "Commander" ou "Creer un compte pro"
5. Scroll -> Trust badges + avis rassurent
6. Process 1-2-3 -> comprend la simplicite
7. FAQ -> repond aux dernieres objections
8. CTA final -> conversion
```

### 1.3 Wireframes

**Mobile (375px)**
```
+-------------------------------------+
| [Logo]              [=] Menu burger  |
+-------------------------------------+
|                                      |
|  Gerez vos demarches                 |
|  auto en quelques clics              |
|                                      |
|  Plateforme SIV agreee par l'Etat    |
|  pour professionnels de l'automobile  |
|                                      |
|  [============================]      |
|  |  Entrez votre immatriculation |   |
|  [============================]      |
|  [   SIMULER MON PRIX   ]           |
|                                      |
|  [   Espace professionnel   ]        |
|                                      |
+--------------------------------------+
|                                      |
|  -- Nos services --                  |
|                                      |
|  +--------------------------------+  |
|  | [icon] Carte Grise             |  |
|  | A partir de 29.90EUR           |  |
|  | [  Commander  ]                |  |
|  +--------------------------------+  |
|                                      |
|  +--------------------------------+  |
|  | [icon] Declaration d'achat     |  |
|  | 14.90EUR                       |  |
|  | [  Commander  ]                |  |
|  +--------------------------------+  |
|                                      |
|  +--------------------------------+  |
|  | [icon] Declaration de cession  |  |
|  | 14.90EUR                       |  |
|  | [  Commander  ]                |  |
|  +--------------------------------+  |
|                                      |
+--------------------------------------+
|                                      |
|  +----------+ +----------+ +------+  |
|  | 15 000+  | | 4.8/5    | | 24h  |  |
|  | demarches| | Google   | | delai|  |
|  +----------+ +----------+ +------+  |
|                                      |
+--------------------------------------+
|                                      |
|  -- Comment ca marche ? --           |
|                                      |
|  (1) Simulez votre prix             |
|      Entrez l'immatriculation        |
|                                      |
|  (2) Envoyez vos documents           |
|      Upload simple et guide          |
|                                      |
|  (3) Recevez votre carte grise       |
|      Suivi en temps reel             |
|                                      |
+--------------------------------------+
|                                      |
|  -- Avis clients --                  |
|  [< ] *****(5) "Tres rapide..." [> ] |
|                                      |
+--------------------------------------+
|  -- FAQ --                           |
|  [v] Combien de temps ca prend ?     |
|  [v] Quels documents fournir ?       |
|  [v] Comment suivre ma demarche ?    |
+--------------------------------------+
|  -- Contact --                       |
|  [Nom___________]                    |
|  [Email_________]                    |
|  [Message_______]                    |
|  [____]                              |
|  [  Envoyer  ]                       |
+--------------------------------------+
|  Footer - Mentions - CGV - Contact   |
+--------------------------------------+
```

**Desktop (1280px)**
```
+------------------------------------------------------------------------+
| [Logo SIVFlow]     Services  Comment ca marche  FAQ  Contact  [Espace Pro]|
+------------------------------------------------------------------------+
|                                                                          |
|   Gerez vos demarches              +-----------------------------+       |
|   auto en quelques clics           |     [Image vehicule/       |       |
|                                    |      illustration]          |       |
|   Plateforme SIV agreee            +-----------------------------+       |
|   par l'Etat pour pros auto                                              |
|                                                                          |
|   +--------------------------------------------+                        |
|   | Immatriculation : [__________] [SIMULER]   |                        |
|   +--------------------------------------------+                        |
|                                                                          |
|   [Espace professionnel]   [Simuler mon prix]                           |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|   -- Nos services --                                                     |
|                                                                          |
|   +------------------+ +------------------+ +------------------+         |
|   | [icon]           | | [icon]           | | [icon]           |         |
|   | Carte Grise      | | Decl. d'achat   | | Decl. de cession |         |
|   | A partir de      | | 14.90EUR         | | 14.90EUR         |         |
|   | 29.90EUR         | |                  | |                  |         |
|   | [Commander]      | | [Commander]      | | [Commander]      |         |
|   +------------------+ +------------------+ +------------------+         |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|   +----------+        +----------+        +----------+                   |
|   | 15 000+  |        | 4.8/5    |        | < 24h    |                   |
|   | demarches|        | note     |        | delai    |                   |
|   +----------+        +----------+        +----------+                   |
|                                                                          |
+--------------------------------------------------------------------------+
|                                                                          |
|   (1) Simulez  ------->  (2) Envoyez  ------->  (3) Recevez            |
|   votre prix              vos documents           votre CG              |
|                                                                          |
+--------------------------------------------------------------------------+
|  Avis clients carousel  |  FAQ accordion           |  Formulaire contact |
+--------------------------------------------------------------------------+
|  Footer                                                                  |
+--------------------------------------------------------------------------+
```

### 1.4 Points d'attention UX 45+

- **Taille du champ immatriculation** : min 48px de hauteur, font-size 18px
- **CTA principal** : min 56px de hauteur, couleur contrastee (ratio 4.5:1 minimum)
- **Texte hero** : font-size 28px mobile, 40px desktop, line-height 1.3
- **Cards services** : bordure visible, pas seulement une ombre subtile
- **Avis Google** : etoiles en jaune bien visible, pas de gris clair
- **Process 1-2-3** : numeros en gros (40px), cercles colores, texte descriptif sous chaque etape

### 1.5 Micro-interactions

- **Simulateur** : animation de chargement pendant la recherche du vehicule, puis apparition du prix avec transition slide-up
- **CTA hover** : leger scale(1.02) + ombre plus prononcee, transition 200ms
- **Cards services** : bordure gauche coloree qui s'epaissit au hover
- **Scroll sections** : fade-in au scroll (IntersectionObserver), delai progressif entre les cards
- **FAQ accordion** : rotation de l'icone chevron, hauteur animee en 300ms ease
- **Trust numbers** : animation compteur au scroll (count-up de 0 a la valeur)

### 1.6 Accessibilite

- Tout le contenu accessible au clavier (Tab order logique)
- Simulateur : label associe au champ, aria-live pour le resultat
- Skip-to-content link en premier element focusable
- FAQ : role="region" aria-labelledby sur chaque section
- Images : alt text descriptif
- Contraste texte : WCAG AA sur tous les elements textuels
- Focus visible : outline 2px offset sur tous les elements interactifs

---

## 2. DASHBOARD PRO (/dashboard)

### 2.1 Architecture d'information (redesign simplifie)

**Priorite : actions frequentes en premier**

1. **Header sticky** - Logo, nav, notifications, menu mobile
2. **Annonces admin** (conditionnelle)
3. **Alerte verification** (conditionnelle - nouveau compte non verifie)
4. **Alerte jeton offert** (conditionnelle - premiere demarche gratuite)
5. **Barre de solde** - Montant + bouton recharger (toujours visible)
6. **Actions rapides** - Cards des demarches disponibles (CTA "Creer")
7. **Stats** - 3 cards : Total, En attente, Validees
8. **Dernieres demarches** - 5 dernieres avec statut
9. **Infos entreprise** - Card secondaire

### 2.2 User flow simplifie

```
1. Pro se connecte -> arrive sur le dashboard
2. Voit son solde immediatement (element le plus visible)
3. Alertes prioritaires : verification docs / jeton offert
4. Actions rapides : clic direct sur "Creer une DA" / "Creer une DC" / etc.
5. Stats : vision rapide de l'etat des demarches
6. Dernieres demarches : clic pour voir le detail
7. Navigation secondaire : factures, parametres, support
```

### 2.3 Wireframes

**Mobile (375px) - Dashboard redesign**
```
+-------------------------------------+
| [Logo]        [bell] [=]            |
+-------------------------------------+
|                                      |
| +----------------------------------+ |
| | [!] Bienvenue ! Envoyez vos     | |
| | documents pour valider votre    | |
| | compte.                          | |
| | [Envoyer mes documents]         | |
| +----------------------------------+ |
|                                      |
| +----------------------------------+ |
| | [coin]  Solde : 150.00EUR       | |
| |                    [+ Recharger] | |
| +----------------------------------+ |
|                                      |
| -- Actions rapides --                |
|                                      |
| +----------------------------------+ |
| | [icon] Declaration d'achat      | |
| | 14.90EUR          [+ Creer]     | |
| +----------------------------------+ |
|                                      |
| +----------------------------------+ |
| | [icon] Declaration de cession   | |
| | 14.90EUR          [+ Creer]     | |
| +----------------------------------+ |
|                                      |
| +----------------------------------+ |
| | [icon] Carte Grise              | |
| | 29.90EUR + CG     [+ Creer]    | |
| +----------------------------------+ |
|                                      |
| -- Tableau de bord --                |
|                                      |
| +--------+ +--------+ +--------+    |
| |  12    | |   3    | |   9    |    |
| | Total  | |Attente | |Validees|    |
| +--------+ +--------+ +--------+    |
|                                      |
| -- Dernieres demarches --            |
|                                      |
| +----------------------------------+ |
| | AB-123-CD  DA  [En attente]     | |
| +----------------------------------+ |
| | EF-456-GH  CG  [Payee]         | |
| +----------------------------------+ |
| | IJ-789-KL  DC  [Validee]       | |
| +----------------------------------+ |
|                                      |
| [Voir toutes mes demarches ->]       |
|                                      |
+--------------------------------------+
```

**Desktop (1280px) - Dashboard redesign**
```
+------------------------------------------------------------------------+
| [Logo]  Tableau de bord | Mes demarches | Factures | Support  [bell] [Deconnexion]|
+------------------------------------------------------------------------+
|                                                                          |
|  +-------------------------------------------------------------------+  |
|  | [!] Bienvenue ! Envoyez vos documents pour verifier votre compte  |  |
|  |     KBIS + Carte d'identite + Mandat    [Envoyer mes documents]   |  |
|  +-------------------------------------------------------------------+  |
|                                                                          |
|  +-------------------------------------------------------------------+  |
|  | [coin] Solde disponible : 150.00EUR              [+ Recharger]    |  |
|  +-------------------------------------------------------------------+  |
|                                                                          |
|  -- Actions rapides --                                                   |
|  +------------------+ +------------------+ +------------------+         |
|  | [icon] DA        | | [icon] DC        | | [icon] CG        |         |
|  | 14.90EUR         | | 14.90EUR         | | 29.90EUR + CG    |         |
|  | [+ Creer]        | | [+ Creer]        | | [+ Creer]        |         |
|  +------------------+ +------------------+ +------------------+         |
|                                                                          |
|  +----------------------------+  +-----------------------------------+  |
|  | Statistiques               |  | Dernieres demarches               |  |
|  |                            |  |                                   |  |
|  | Total     En att.  Valid.  |  | AB-123-CD  DA  [En attente]      |  |
|  |  12         3        9     |  | EF-456-GH  CG  [Payee]          |  |
|  |                            |  | IJ-789-KL  DC  [Validee]        |  |
|  +----------------------------+  |                                   |  |
|  | Infos entreprise           |  | [Voir tout ->]                   |  |
|  | Raison sociale: ...        |  +-----------------------------------+  |
|  | SIRET: ...                 |                                         |
|  | [Modifier]                 |                                         |
|  +----------------------------+                                         |
|                                                                          |
+--------------------------------------------------------------------------+
```

### 2.4 Points d'attention UX 45+

- **Solde** : affichage tres gros (32px font, bold), couleur contrastee sur fond pastel
- **Actions rapides** : pas plus de 3-4 actions visibles, cards larges avec icones de 40px
- **Boutons "Creer"** : min 48px de hauteur, texte lisible, couleur de l'action
- **Stats** : chiffres gros (36px), labels en dessous en muted-foreground
- **Liste demarches** : elements espaces de 12px minimum, zone cliquable large (toute la ligne)
- **Navigation mobile** : Sheet lateral avec icones + texte, pas d'icones seules
- **Alerte verification** : bordure epaisse (3px), icone grande, texte lisible, CTA clair

### 2.5 Micro-interactions

- **Solde** : animation pulse subtile quand le solde change
- **Cards actions** : scale(1.01) au hover avec ombre portee, border-color transition
- **Stats** : count-up animation au premier chargement
- **Liste demarches** : fond gris leger au hover, transition 150ms
- **Badge statut** : code couleur coherent (orange=attente, vert=valide, bleu=paye)
- **Bouton recharger** : icone "+" avec rotation subtile au hover
- **Notification bell** : badge rouge anime (bounce) quand nouvelles notifs

### 2.6 Accessibilite

- Navigation au clavier complete (Tab dans l'ordre visuel)
- aria-label sur les cards de stats pour lecteurs d'ecran
- role="status" sur le solde (lecture automatique par SR)
- Badges de statut : texte + couleur (jamais couleur seule)
- Boutons : min 44x44px touch target
- Mobile Sheet : focus trap actif, Escape pour fermer

---

## 3. NOUVELLE DEMARCHE (/nouvelle-demarche)

### 3.1 Architecture d'information

**Flow actuel analyse** : La page est longue avec beaucoup de blocs. Recommandation : conserver le flow lineaire mais avec des sections clairement delimitees et numerotees.

1. **Header** - Bouton retour + titre "Nouvelle demarche"
2. **Etape 1 : Choix du type** - Cards des types de demarches disponibles
3. **Etape 2 : Informations vehicule** - Formulaire immatriculation OU saisie manuelle selon type
4. **Etape 3 : Questionnaire** (conditionnel) - Questions specifiques au type de demarche
5. **Etape 4 : Documents** - Upload des documents requis + documents conditionnels
6. **Etape 5 : Commentaire** (optionnel)
7. **Etape 6 : Recapitulatif + Paiement** - Resume + choix du mode de paiement

### 3.2 User flow simplifie

```
1. Pro clique "Creer" depuis le dashboard (type pre-selectionne) OU arrive vierge
2. Etape 1 : choisit le type de demarche (si pas pre-selectionne)
3. Etape 2 : entre l'immatriculation -> infos vehicule s'affichent automatiquement
4. Etape 3 : repond au questionnaire (si applicable)
5. Etape 4 : uploade les documents requis (checklist avec statut)
6. Etape 5 : ajoute un commentaire optionnel
7. Etape 6 : voit le recapitulatif -> paye (solde, CB, ou free token)
8. Redirection vers page succes ou detail de la demarche
```

### 3.3 Wireframes

**Mobile (375px)**
```
+-------------------------------------+
| [<- Retour]  Nouvelle demarche      |
+-------------------------------------+
|                                      |
| -- Progression --                    |
| (1)----(2)----(3)----(4)----(5)     |
|  *                                   |
|                                      |
| === ETAPE 1 : Type de demarche ===  |
|                                      |
| +----------------------------------+ |
| | [o] Declaration d'achat  14.90EUR | |
| +----------------------------------+ |
| | [ ] Declaration de cession 14.90 | |
| +----------------------------------+ |
| | [ ] Carte grise       29.90+CG  | |
| +----------------------------------+ |
|                                      |
| [   Suivant ->   ]                   |
|                                      |
+--------------------------------------+

--- Apres selection ---

+-------------------------------------+
| [<- Retour]  Nouvelle demarche      |
+-------------------------------------+
|                                      |
| (1)----(2)----(3)----(4)----(5)     |
|          *                           |
|                                      |
| === ETAPE 2 : Vehicule ===          |
|                                      |
| Immatriculation                      |
| [____AB-123-CD____]                 |
| [  Rechercher  ]                     |
|                                      |
| +----------------------------------+ |
| | Marque : Renault                 | |
| | Modele : Clio V                  | |
| | Date 1ere immat : 12/03/2020    | |
| | Puissance fiscale : 5 CV        | |
| +----------------------------------+ |
|                                      |
| [<- Precedent]   [Suivant ->]        |
|                                      |
+--------------------------------------+

--- Upload documents ---

+-------------------------------------+
| [<- Retour]  Nouvelle demarche      |
+-------------------------------------+
|                                      |
| (1)----(2)----(3)----(4)----(5)     |
|                        *             |
|                                      |
| === ETAPE 4 : Documents ===         |
|                                      |
| Documents obligatoires :             |
|                                      |
| +----------------------------------+ |
| | [v] Carte grise originale       | |
| |     carte_grise.pdf  [X]        | |
| +----------------------------------+ |
|                                      |
| +----------------------------------+ |
| | [ ] Piece d'identite            | |
| |     [Choisir un fichier]        | |
| |     PDF, JPG ou PNG (max 5MB)   | |
| +----------------------------------+ |
|                                      |
| +----------------------------------+ |
| | [ ] Cerfa rempli                 | |
| |     [Choisir un fichier]        | |
| |     [Telecharger le cerfa vierge]| |
| +----------------------------------+ |
|                                      |
| [<- Precedent]   [Suivant ->]        |
|                                      |
+--------------------------------------+
```

**Desktop (1280px)**
```
+------------------------------------------------------------------------+
| [<- Retour au dashboard]          Nouvelle demarche                     |
+------------------------------------------------------------------------+
|                                                                          |
|  Progression : (1) Type -- (2) Vehicule -- (3) Questions -- (4) Docs -- (5) Paiement
|                              *                                           |
|                                                                          |
|  +-----------------------------------------------+  +----------------+ |
|  |  === ETAPE 2 : Informations vehicule ===      |  | Recapitulatif  | |
|  |                                                |  |                | |
|  |  Immatriculation                               |  | Type : DA      | |
|  |  [____AB-123-CD____] [Rechercher]              |  | Prix : 14.90EUR| |
|  |                                                |  |                | |
|  |  +------------------------------------------+  |  | Vehicule :     | |
|  |  | Marque : Renault                         |  |  | AB-123-CD      | |
|  |  | Modele : Clio V                          |  |  | Renault Clio   | |
|  |  | Date 1ere immat : 12/03/2020            |  |  |                | |
|  |  | Puissance fiscale : 5 CV                |  |  | Docs : 0/3     | |
|  |  +------------------------------------------+  |  |                | |
|  |                                                |  +----------------+ |
|  |  [<- Precedent]              [Suivant ->]      |                     |
|  +------------------------------------------------+                     |
|                                                                          |
+--------------------------------------------------------------------------+
```

### 3.4 Points d'attention UX 45+

- **Barre de progression** : visible et numerotee, pas juste des points
- **Un seul sujet par etape** : eviter de surcharger avec trop d'infos
- **Champ immatriculation** : format guide (XX-XXX-XX), taille de texte 18px, auto-uppercase
- **Upload documents** : zone de drop large (min 120px hauteur), texte explicatif sous chaque doc
- **Lien telechargement cerfa** : bien visible, icone PDF, texte explicite
- **Boutons navigation** : toujours visibles en bas, "Precedent" a gauche, "Suivant" a droite
- **Validation** : feedback inline immediat (check vert ou erreur rouge avec texte)
- **Recapitulatif lateral desktop** : sticky, resume ce qui a ete rempli

### 3.5 Micro-interactions

- **Selection type** : radio card avec bordure coloree animee + check vert
- **Recherche vehicule** : spinner pendant la requete, puis slide-down des infos
- **Upload** : barre de progression pendant l'envoi, check anime quand fini
- **Barre de progression** : etapes completees en vert avec transition, etape courante pulse
- **Bouton Suivant** : disabled + grise si etape non valide, enabled avec transition de couleur
- **Recapitulatif** : mise a jour en temps reel avec highlight jaune 1s sur le champ modifie
- **Erreur validation** : shake animation sur le champ + texte rouge qui apparait

### 3.6 Accessibilite

- Progress bar : role="progressbar" aria-valuenow aria-valuemax
- Champs de formulaire : label explicite, aria-required, aria-invalid
- Upload : instructions claires, acceptation des formats annoncee
- Navigation clavier : Enter pour valider, Echap pour annuler upload
- Erreurs : aria-live="polite" pour annonce automatique
- Focus automatique sur le premier champ de chaque etape

---

## 4. MES DEMARCHES (/mes-demarches)

### 4.1 Architecture d'information

1. **Header** - Retour dashboard + bouton "Nouvelle demarche"
2. **Section brouillons** (conditionnelle) - Brouillons non payes avec "Reprendre" / "Supprimer"
3. **Titre + description**
4. **Barre de filtres** - Recherche + filtre statut + filtre type
5. **Liste des demarches** - Tableau avec colonnes : N, Type, Immat, Statut, Montant, Date, Action
6. **Etat vide** - Illustration + CTA si aucune demarche

### 4.2 User flow simplifie

```
1. Pro arrive sur la liste
2. Voit les brouillons en haut (s'il y en a) -> peut reprendre
3. Utilise la recherche ou les filtres pour trouver une demarche
4. Clique sur "Voir" pour acceder au detail
5. Depuis le detail, peut suivre l'avancement
```

### 4.3 Wireframes

**Mobile (375px)**
```
+-------------------------------------+
| [<- Dashboard]     [+ Nouvelle]     |
+-------------------------------------+
|                                      |
| +----------------------------------+ |
| | Brouillons (2)                   | |
| | DA  AB-123-CD  12/03  [Reprendre]| |
| | CG  EF-456-GH  10/03  [Reprendre]| |
| +----------------------------------+ |
|                                      |
| Mes demarches                        |
|                                      |
| [Rechercher________________]         |
| [Statut : Tous v] [Type : Tous v]   |
|                                      |
| +----------------------------------+ |
| | N: DCG-2026-001                  | |
| | DA - AB-123-CD                   | |
| | [v Paiement accepte]    14.90EUR | |
| | 12/03/2026            [Voir ->]  | |
| +----------------------------------+ |
|                                      |
| +----------------------------------+ |
| | N: DCG-2026-002                  | |
| | CG - EF-456-GH                  | |
| | [o En attente]          189.50EUR| |
| | 10/03/2026            [Voir ->]  | |
| +----------------------------------+ |
|                                      |
+--------------------------------------+
```

**Desktop (1280px)**
```
+------------------------------------------------------------------------+
| [<- Retour au dashboard]                     [+ Nouvelle demarche]      |
+------------------------------------------------------------------------+
|                                                                          |
|  +-------------------------------------------------------------------+  |
|  | Brouillons (2)                                                    |  |
|  | DA  AB-123-CD  12/03  [Reprendre] [X]                           |  |
|  | CG  EF-456-GH  10/03  [Reprendre] [X]                           |  |
|  +-------------------------------------------------------------------+  |
|                                                                          |
|  Mes demarches                                                          |
|                                                                          |
|  [Rechercher_________]  [Statut: Tous v]  [Type: Tous v]  [Tri v] [^]  |
|                                                                          |
|  +-------------------------------------------------------------------+  |
|  | N Demarche   | Type   | Immat     | Statut       | Montant | Date |  |
|  |------------- |--------|-----------|--------------|---------|------|  |
|  | DCG-2026-001 | DA     | AB-123-CD | [v Accepte]  | 14.90EUR| 12/03|  |
|  | DCG-2026-002 | CG     | EF-456-GH | [o Attente]  |189.50EUR| 10/03|  |
|  | DCG-2026-003 | DC     | IJ-789-KL | [v Validee]  | 14.90EUR| 08/03|  |
|  +-------------------------------------------------------------------+  |
|                                                                          |
+--------------------------------------------------------------------------+
```

### 4.4 Points d'attention UX 45+

- **Probleme actuel** : filtres dupliques dans le code (deux jeux de Select). A corriger.
- **Mobile** : remplacer le tableau par des cards empilees (un tableau n'est pas lisible sur 375px)
- **Statuts** : toujours texte + icone + couleur (triple codage)
- **Bouton "Voir"** : min 44px, bien visible
- **Brouillons** : section distincte visuellement (fond jaune pastel, bordure tiretee)
- **Recherche** : placeholder explicite, champ large
- **Pagination** : si > 10 demarches, ajouter pagination avec gros boutons

### 4.5 Micro-interactions

- **Filtres** : resultats filtres instantanement (deja en place avec useEffect)
- **Hover ligne** : fond gris leger, cursor pointer
- **Badge statut** : pulse subtile pour "En attente" (attire l'attention)
- **Suppression brouillon** : confirmation dialog + animation de disparition
- **Recherche** : debounce 300ms, highlight du texte trouve

### 4.6 Accessibilite

- Tableau : caption, scope="col" sur les headers
- Mobile cards : role="article" avec aria-label descriptif
- Filtres : labels visibles (pas seulement placeholder)
- Focus visible sur chaque ligne cliquable
- Annonce du nombre de resultats : aria-live="polite"

---

## 5. GUEST ORDER FLOW (/commander/:id) - REDESIGN COMPLET

### 5.1 Architecture d'information - Wizard step-by-step

**Probleme actuel** : tout sur une seule page longue (infos personnelles + documents + options + paiement). Pour un public non tech-savvy, c'est intimidant.

**Solution : wizard en 4 etapes**

- **Etape 1 : Recapitulatif commande** - Ce qui a ete commande, prix, badges de confiance
- **Etape 2 : Vos informations** - Formulaire coordonnees personnelles
- **Etape 3 : Vos documents** - Upload des documents requis
- **Etape 4 : Paiement** - Resume final + options de paiement

### 5.2 User flow simplifie

```
1. Client recoit un lien de son garagiste (ex: /commander/abc-123)
2. Etape 1 : voit le recapitulatif de la commande + badges confiance -> "Continuer"
3. Etape 2 : remplit ses coordonnees (nom, email, tel, adresse) -> "Continuer"
4. Etape 3 : uploade les documents requis (guide par document) -> "Continuer"
5. Etape 4 : voit le resume total -> paye (Stripe ou PayPal)
6. Redirection vers page de suivi avec numero de tracking
```

### 5.3 Wireframes

**Mobile (375px) - Wizard Guest Order**
```
--- ETAPE 1 : Recapitulatif ---

+-------------------------------------+
| [Logo SIVFlow]                       |
+-------------------------------------+
|                                      |
| Votre commande                       |
| Carte grise pour AB-123-CD           |
|                                      |
| +----------------------------------+ |
| | [clock] Traitee en 24h maximum   | |
| +----------------------------------+ |
|                                      |
| +----------------------------------+ |
| | Recapitulatif                    | |
| |                                  | |
| | Carte grise ........... 89.50EUR | |
| | Frais de dossier ....... 30.00EUR| |
| |                                  | |
| | TOTAL ................. 119.50EUR| |
| +----------------------------------+ |
|                                      |
| +------+ +------+ +------+          |
| |Securise| |Agree | |Rapide|        |
| +------+ +------+ +------+          |
|                                      |
| Etape 1 sur 4                        |
|                                      |
| [   Commencer   ]                    |
|                                      |
+--------------------------------------+

--- ETAPE 2 : Informations ---

+-------------------------------------+
| [Logo]       Etape 2 / 4            |
+-------------------------------------+
|                                      |
| (1)=====(2)-------(3)-------(4)      |
|           *                          |
|                                      |
| Vos informations                     |
|                                      |
| Nom *                                |
| [___________________________]        |
|                                      |
| Prenom *                             |
| [___________________________]        |
|                                      |
| Email *                              |
| [___________________________]        |
|                                      |
| Telephone *                          |
| [___________________________]        |
|                                      |
| Adresse *                            |
| [___________________________]        |
|                                      |
| Code postal *        Ville *         |
| [____________]  [____________]       |
|                                      |
| [<- Retour]      [Continuer ->]      |
|                                      |
+--------------------------------------+

--- ETAPE 3 : Documents ---

+-------------------------------------+
| [Logo]       Etape 3 / 4            |
+-------------------------------------+
|                                      |
| (1)=====(2)=====(3)-------(4)        |
|                   *                  |
|                                      |
| Vos documents                        |
|                                      |
| Envoyez les documents suivants :     |
|                                      |
| +----------------------------------+ |
| | 1. Carte grise originale    [!]  | |
| |                                  | |
| | +------------------------------+ | |
| | |                              | | |
| | |   [icone upload]             | | |
| | |   Cliquez ou deposez ici     | | |
| | |   PDF, JPG, PNG (max 5MB)   | | |
| | |                              | | |
| | +------------------------------+ | |
| +----------------------------------+ |
|                                      |
| +----------------------------------+ |
| | 2. Piece d'identite         [!]  | |
| |                                  | |
| | +------------------------------+ | |
| | |   [v] carte_id.pdf          | | |
| | |       1.2 MB   [Supprimer]  | | |
| | +------------------------------+ | |
| +----------------------------------+ |
|                                      |
| Documents envoyes : 1 / 3           |
|                                      |
| [<- Retour]      [Continuer ->]      |
|                                      |
+--------------------------------------+

--- ETAPE 4 : Paiement ---

+-------------------------------------+
| [Logo]       Etape 4 / 4            |
+-------------------------------------+
|                                      |
| (1)=====(2)=====(3)=====(4)          |
|                           *          |
|                                      |
| Recapitulatif et paiement            |
|                                      |
| +----------------------------------+ |
| | AB-123-CD - Carte grise         | |
| |                                  | |
| | Nom : Jean Dupont               | |
| | Email : jean@email.fr           | |
| | Documents : 3/3 [v]             | |
| |                                  | |
| | Carte grise .......... 89.50EUR | |
| | Frais de dossier ...... 30.00EUR| |
| |                                  | |
| | TOTAL : 119.50EUR               | |
| +----------------------------------+ |
|                                      |
| [v] Notifications email (gratuit)    |
|                                      |
| Choisissez votre paiement :         |
|                                      |
| [  Carte bancaire  ]                |
|                                      |
| ---- ou ----                         |
|                                      |
| [  PayPal  ]                         |
|                                      |
| [lock] Paiement 100% securise       |
|                                      |
+--------------------------------------+
```

**Desktop (1280px) - Wizard Guest Order**
```
+------------------------------------------------------------------------+
| [Logo SIVFlow]                                           Etape 2 / 4    |
+------------------------------------------------------------------------+
|                                                                          |
|  (1) Recapitulatif === (2) Informations --- (3) Documents --- (4) Paiement
|                           *                                              |
|                                                                          |
|  +--------------------------------------------+ +---------------------+ |
|  |  Vos informations                          | | Votre commande      | |
|  |                                            | |                     | |
|  |  Nom *               Prenom *              | | CG - AB-123-CD      | |
|  |  [____________]  [____________]            | |                     | |
|  |                                            | | CG : 89.50EUR       | |
|  |  Email *             Telephone *           | | Frais : 30.00EUR    | |
|  |  [____________]  [____________]            | |                     | |
|  |                                            | | Total : 119.50EUR   | |
|  |  Adresse *                                 | |                     | |
|  |  [_________________________________]       | | [lock] Securise     | |
|  |                                            | | [badge] Agree       | |
|  |  Code postal *       Ville *               | | [clock] 24h         | |
|  |  [____________]  [____________]            | |                     | |
|  |                                            | +---------------------+ |
|  |  [<- Retour]           [Continuer ->]      |                         |
|  +--------------------------------------------+                         |
|                                                                          |
+--------------------------------------------------------------------------+
```

### 5.4 Points d'attention UX 45+

- **Wizard** : ne JAMAIS montrer plus d'une etape a la fois
- **Barre de progression** : numerotee, labels texte sous chaque etape
- **Trust badges** : visibles a CHAQUE etape (sidebar desktop, haut de page mobile)
- **Upload** : zone de drop grande (150px min), texte tres explicite, formats acceptes visibles
- **Boutons** : tres gros (56px hauteur), texte 18px, full-width sur mobile
- **Recap prix** : toujours visible (sidebar desktop, haut de page sur mobile etape 1 et 4)
- **Erreurs** : inline sous chaque champ, en rouge avec icone, texte explicite
- **Confirmation documents** : check vert + nom du fichier + taille, tres rassurant
- **Delai de traitement** : rappele a chaque etape (badge "24h")

### 5.5 Micro-interactions

- **Transition entre etapes** : slide horizontal (gauche vers droite), 300ms ease
- **Barre de progression** : remplissage anime en vert entre les etapes
- **Upload zone** : bordure en pointilles qui devient pleine au hover, fond bleu pastel au drag-over
- **Upload succes** : animation check + confetti subtil
- **Champs formulaire** : label qui monte en haut du champ au focus (floating label)
- **Bouton Continuer** : pulse subtile quand l'etape est valide et que l'utilisateur n'a pas encore clique
- **Recap sidebar** : check animes quand les sections sont completees

### 5.6 Accessibilite

- Wizard : aria-current="step" sur l'etape active
- Navigation : boutons "Retour" et "Continuer" bien labellises
- Upload : aria-label descriptif, aria-live pour feedback
- Formulaire : autocomplete attributes (name, email, tel, street-address, postal-code)
- Focus manage : auto-focus sur le premier champ de chaque etape
- Annonces : "Etape 2 sur 4 : Vos informations" en aria-live a chaque changement

---

## 6. PAIEMENT (/paiement-demarche/:id)

### 6.1 Architecture d'information

1. **Header** - Retour + titre
2. **Colonne gauche : Moyens de paiement**
   - Paiement par solde (si applicable et suffisant)
   - Separateur "ou"
   - Carte bancaire (Stripe)
   - Separateur "ou"
   - Apple Pay / Google Pay
   - Separateur "ou"
   - PayPal (avec option 4x si >= 30EUR)
3. **Colonne droite : Recapitulatif** (sticky)
   - Type + immatriculation
   - Detail des frais (collapsible)
   - Total

### 6.2 User flow simplifie

```
1. Pro arrive apres avoir cree sa demarche
2. Voit le recapitulatif a droite (desktop) ou en haut (mobile)
3. Si solde suffisant : option mise en avant en vert -> 1 clic
4. Sinon : choisit CB, Apple/Google Pay, ou PayPal
5. Complete le paiement
6. Redirection vers page succes
```

### 6.3 Wireframes

**Mobile (375px)**
```
+-------------------------------------+
| [<- Retour]                          |
+-------------------------------------+
|                                      |
| +----------------------------------+ |
| | Recapitulatif                    | |
| | DCG-2026-001 - DA               | |
| | AB-123-CD                        | |
| | Total : 14.90EUR                 | |
| | [v Voir le detail]              | |
| +----------------------------------+ |
|                                      |
| Choisissez votre paiement           |
|                                      |
| +----------------------------------+ |
| | [coin] Payer avec mon solde      | |
| | Solde : 150.00EUR                | |
| | [Utiliser mon solde (14.90EUR)]  | |
| +----------------------------------+ |
|                                      |
| ---- ou ----                         |
|                                      |
| Carte bancaire                       |
| [Numero de carte_________________]  |
| [MM/AA___] [CVC___]                |
| [  Payer par carte  ]               |
|                                      |
| ---- ou ----                         |
|                                      |
| [  Apple Pay / Google Pay  ]         |
|                                      |
| ---- ou ----                         |
|                                      |
| [  PayPal  ]                         |
|                                      |
| [lock] Paiement 100% securise       |
+--------------------------------------+
```

**Desktop (1280px)** - identique au code actuel (layout 2 colonnes deja correct)

### 6.4 Points d'attention UX 45+

- **Paiement par solde** : mis en avant clairement quand suffisant, un seul bouton
- **Card form** : champs grands (48px), labels explicites
- **Logos CB** : afficher Visa/Mastercard/Amex pour rassurer
- **Badge securite** : cadenas + "Paiement securise" visible en permanence
- **PayPal 4x** : bien expliquer le montant par mois en gros
- **Erreur paiement** : message clair en francais, pas de code technique
- **Confirmation** : dialog modale avant paiement par solde (deja en place)

### 6.5 Micro-interactions

- **Selection moyen de paiement** : bordure animee sur la section choisie
- **Bouton payer** : spinner pendant le traitement, disabled pour eviter double clic
- **Succes** : animation check vert + confetti, puis redirection auto apres 2s
- **Erreur** : shake du bouton + message rouge

### 6.6 Accessibilite

- Formulaire Stripe : labels associes, aria-invalid en cas d'erreur
- Boutons de paiement : aria-label descriptif incluant le montant
- Focus management : apres erreur, focus revient sur le champ en erreur
- Annonce du statut : aria-live pour "Traitement en cours" / "Paiement accepte"

---

## 7. ADMIN DASHBOARD (/admin)

### 7.1 Architecture d'information

1. **Header** - Retour dashboard + titre "Administration"
2. **Stats globales** - Cards : Garages total, Demarches total, A traiter, Paiements
3. **Revenue stats** (composant RevenueStats existant)
4. **Annonces** (composant AnnouncementManager existant)
5. **Navigation admin** - Grille de liens vers les sous-pages
   - Gestion demarches
   - Gestion utilisateurs
   - Gestion garages
   - Gestion comptes
   - Guest orders
   - Notifications
   - Historique paiements
   - Achats jetons
   - Templates email
   - Config pricing
   - Revenus
   - Guest actions

### 7.2 User flow simplifie

```
1. Admin arrive sur le dashboard
2. Voit les stats cles en haut (demarches a traiter en surbrillance)
3. Section revenue pour les KPIs financiers
4. Grille de navigation vers les sous-pages de gestion
5. Gestion annonces en bas
```

### 7.3 Wireframes

**Mobile (375px)**
```
+-------------------------------------+
| [<- Dashboard]    Administration     |
+-------------------------------------+
|                                      |
| +--------+ +--------+               |
| |  25    | |   8    |               |
| |Garages | |A traiter|              |
| +--------+ +--------+               |
| +--------+ +--------+               |
| |  142   | | 12.5k |               |
| |Demarche| |Paiement|              |
| +--------+ +--------+               |
|                                      |
| [Revenue chart]                      |
|                                      |
| -- Navigation --                     |
|                                      |
| [Demarches]  [Utilisateurs]         |
| [Garages]    [Guest orders]         |
| [Paiements]  [Pricing]              |
| [Emails]     [Revenus]              |
|                                      |
| -- Annonces --                       |
| [Gerer les annonces]                |
+--------------------------------------+
```

**Desktop (1280px)**
```
+------------------------------------------------------------------------+
| [<- Dashboard]                    Administration                        |
+------------------------------------------------------------------------+
|                                                                          |
|  +------------+ +------------+ +------------+ +------------+            |
|  | 25 Garages | | 142 Demar. | | 8 A traiter| | 12.5k EUR |            |
|  +------------+ +------------+ +------------+ +------------+            |
|                                                                          |
|  +-------------------------------------------------------------------+  |
|  | Revenue Stats                                                     |  |
|  +-------------------------------------------------------------------+  |
|                                                                          |
|  -- Navigation rapide --                                                 |
|  +------------+ +------------+ +------------+ +------------+            |
|  | Demarches  | | Utilisateurs| | Garages   | | Comptes    |            |
|  +------------+ +------------+ +------------+ +------------+            |
|  +------------+ +------------+ +------------+ +------------+            |
|  | Guest ord. | | Paiements  | | Emails     | | Pricing    |            |
|  +------------+ +------------+ +------------+ +------------+            |
|                                                                          |
|  +-------------------------------------------------------------------+  |
|  | Gestion des annonces                                              |  |
|  +-------------------------------------------------------------------+  |
|                                                                          |
+--------------------------------------------------------------------------+
```

### 7.4 Points d'attention UX 45+

- L'admin est un utilisateur interne, les contraintes 45+ sont moins fortes ici
- Neanmoins : cards de navigation avec icones + texte, pas d'icones seules
- Badge rouge sur "A traiter" pour attirer l'attention
- Stats financieres : formatage francais (separateur milliers avec espace)

### 7.5 Micro-interactions

- Stats : count-up au chargement
- Cards navigation : hover avec elevation + bordure coloree
- Badge "A traiter" : pulse si > 0
- Regeneration factures : spinner + progress feedback

### 7.6 Accessibilite

- Navigation admin : liens avec aria-label descriptifs
- Stats : role="status" pour les valeurs qui changent
- Cards : taille de clic min 44x44px

---

## RECOMMANDATIONS TRANSVERSALES

### Design System Tokens pour SIVFlow

```
Couleurs semantiques :
- primary : bleu (#2563eb) - actions principales, liens
- success : vert (#16a34a) - valide, paye, succes
- warning : orange (#f59e0b) - en attente, alerte
- danger : rouge (#dc2626) - erreur, refuse
- muted : gris (#6b7280) - texte secondaire

Typographie (mobile-first) :
- H1 : 28px / 40px desktop, bold, line-height 1.2
- H2 : 22px / 30px desktop, semibold
- H3 : 18px / 24px desktop, semibold
- Body : 16px / 16px desktop, regular, line-height 1.5
- Small : 14px, muted
- Min CTA text : 16px

Espacement :
- Touch targets : min 44x44px (WCAG), recommande 48x48px
- Espacement entre elements interactifs : min 8px
- Padding cards : 16px mobile, 24px desktop
- Marge entre sections : 32px mobile, 48px desktop

Composants cles :
- Boutons : height 48px (default), 56px (CTA principal)
- Champs input : height 48px, font-size 16px (evite zoom iOS)
- Cards : border visible (1px solid border), border-radius 12px
- Badges statut : padding 6px 12px, font-weight 600, border-radius 9999px
```

### Features a implementer

1. **Demarches activables/desactivables** : Ajouter un champ `actif` boolean sur `actions_rapides` (deja present dans le code). Cote dashboard pro, filtrer les actions rapides par `actif: true`. Cote admin, toggle on/off par garage instance.

2. **Pricing configurable par le pro** : Ajouter une section dans GarageSettings pour definir les marges par type de demarche. Les guest orders utiliseraient le pricing du garage (base + marge).

3. **Guest orders flow plus guide** : Implementer le wizard 4 etapes decrit en section 5. Chaque etape valide avant de passer a la suivante. Sidebar recapitulatif sur desktop.
