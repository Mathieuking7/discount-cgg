# SIVFlow -- Brand Guidelines
## Document de reference pour toutes les instances deployees

**Version** : 1.0
**Date** : 2026-03-09
**Statut** : Reference active

---

## Table des matieres

1. [Voix et Ton](#1-voix-et-ton)
2. [Logo Usage](#2-logo-usage)
3. [Palette etendue](#3-palette-etendue)
4. [Iconographie](#4-iconographie)
5. [Photographie et Illustrations](#5-photographie-et-illustrations)
6. [Naming Conventions](#6-naming-conventions)

---

## 1. Voix et Ton

### 1.1 Principes generaux

**Registre** : Vouvoiement systematique. Registre courant professionnel -- ni familier, ni administratif lourd. Le ton est celui d'un collegue competent qui simplifie la vie, pas celui d'une administration ni d'une startup decontractee.

**Personnalite de la marque en mots** :
- **Fiable** : inspire confiance sans etre rigide
- **Direct** : va droit au but sans jargon inutile
- **Accessible** : explique simplement sans infantiliser
- **Efficace** : met en avant le gain de temps et la simplicite

### 1.2 Regles d'ecriture

| Regle | Application |
|-------|------------|
| Vouvoiement | Toujours. "Votre demarche", jamais "Ta demarche" |
| Phrases courtes | Maximum 20 mots par phrase dans l'UI |
| Voix active | "Nous traitons votre dossier" et non "Votre dossier est en cours de traitement" |
| Verbes d'action | Privilegier l'infinitif dans les boutons, l'imperatif dans les instructions |
| Chiffres | Ecrire en chiffres dans l'UI (24h, pas vingt-quatre heures) |
| Ponctuation | Pas de point final dans les boutons ni les labels. Point final dans les phrases completes |
| Majuscules | Casse de phrase pour tout (pas de Title Case sauf nom propre). "Nouvelle demarche" et non "Nouvelle Demarche" |

### 1.3 Do's and Don'ts

**DO** :
- Utiliser des verbes concrets : "Envoyer", "Telecharger", "Valider"
- Confirmer les actions reussies : "Dossier envoye avec succes"
- Expliquer ce qui se passe ensuite : "Vous recevrez un email de confirmation sous 24h"
- Rassurer sur la securite : "Vos donnees sont chiffrees et protegees"
- Donner des delais concrets : "Traitement sous 24h" plutot que "Traitement rapide"

**DON'T** :
- Jargon administratif pur : "Le titulaire du certificat d'immatriculation doit proceder a..." -> "Enregistrez le nouveau proprietaire"
- Anglicismes non necessaires : pas de "checker", "uploader" -> "verifier", "telecharger"
- Ton alarmiste pour les erreurs : pas de "ERREUR CRITIQUE" -> "Un probleme est survenu"
- Humour ou emojis dans l'interface pro (reserve aux emails marketing ponctuels)
- Abreviations ambigues : "CG" seul sans contexte (ecrire "carte grise" en entier la premiere fois, puis "CG" est acceptable)
- Formulations passives ou vagues : "Il semblerait que..." -> "Le document est manquant"

### 1.4 Exemples par contexte

#### Boutons (CTA)

| Contexte | Formulation correcte | Formulation incorrecte |
|----------|---------------------|----------------------|
| Action principale | Commencer ma demarche | Go ! / C'est parti |
| Soumission | Envoyer le dossier | Submit / Soumettre |
| Confirmation | Confirmer et payer | Valider le paiement |
| Secondaire | Simuler mon tarif | Voir les prix |
| Annulation | Annuler | Cancel / Laisser tomber |
| Telechargement | Telecharger le certificat | Download |
| Navigation retour | Retour au tableau de bord | Revenir en arriere |

#### Notifications et toasts

| Type | Exemple |
|------|---------|
| Succes | "Dossier envoye avec succes. Vous recevrez un email de confirmation." |
| Information | "Votre demarche est en cours de traitement." |
| Avertissement | "Un document est manquant. Ajoutez-le pour finaliser votre dossier." |
| Erreur | "Impossible d'envoyer le dossier. Verifiez votre connexion et reessayez." |

#### Messages d'erreur

| Contexte | Formulation |
|----------|------------|
| Champ obligatoire | "Ce champ est requis" |
| Format email | "Adresse email invalide" |
| Immatriculation invalide | "Format d'immatriculation non reconnu (ex. : AB-123-CD)" |
| Fichier trop lourd | "Le fichier depasse 10 Mo. Reduisez sa taille et reessayez." |
| Erreur serveur | "Un probleme technique est survenu. Reessayez dans quelques instants." |
| Session expiree | "Votre session a expire. Reconnectez-vous pour continuer." |
| Paiement echoue | "Le paiement n'a pas abouti. Verifiez vos informations bancaires." |

#### Emails transactionnels

**Objet** : Format "[SIVFlow] Action -- [Detail]"
- "[SIVFlow] Confirmation -- Votre demarche a ete envoyee"
- "[SIVFlow] Action requise -- Document manquant pour votre dossier"
- "[SIVFlow] Termine -- Votre certificat est disponible"

**Corps** : Toujours ouvrir par "Bonjour [Prenom],". Fermer par "L'equipe SIVFlow". Inclure un CTA clair en bouton. Maximum 3 paragraphes courts.

**Exemple de mail complet** :

```
Objet : [SIVFlow] Termine -- Votre certificat est disponible

Bonjour Jean-Pierre,

Votre demarche de changement de titulaire pour le vehicule AB-123-CD
a ete traitee avec succes.

Votre certificat d'immatriculation est disponible dans votre
espace pro. Vous pouvez le telecharger des maintenant.

[Telecharger mon certificat]

En cas de question, notre equipe est disponible par email
ou via votre espace pro.

Cordialement,
L'equipe SIVFlow
```

#### Titres de page

| Page | Titre |
|------|-------|
| Tableau de bord | Tableau de bord |
| Nouvelle demarche | Nouvelle demarche |
| Suivi des dossiers | Mes demarches |
| Profil garage | Mon etablissement |
| Parametres | Parametres |
| Facturation | Facturation |
| Admin / gestion | Administration |

---

## 2. Logo Usage

### 2.1 Logo principal

Le logo SIVFlow est compose d'un cercle bleu gradient contenant les lettres "SF" en negatif (blanc) et d'une fleche teal orientee vers le haut-droit, symbolisant la progression et la simplicite.

### 2.2 Variantes autorisees

| Variante | Usage | Description |
|----------|-------|-------------|
| **Primaire couleur** | Fond clair (blanc, gris clair) | Cercle bleu gradient + fleche teal + texte "SIVFlow" en bleu fonce |
| **Primaire inverse** | Fond sombre (bleu fonce, noir) | Cercle blanc + lettres SF en bleu + fleche teal + texte "SIVFlow" en blanc |
| **Monochrome sombre** | Documents officiels, fax, tampon | Tout en #1E3A8A (bleu fonce) |
| **Monochrome clair** | Sur fond photographique sombre | Tout en blanc #FFFFFF |
| **Icone seule** | Favicon, avatar, espaces reduits | Cercle bleu gradient avec SF uniquement, sans texte |

### 2.3 Espacement minimum (clear space)

La zone de protection autour du logo est egale a la hauteur de la lettre "S" du logo (notee "x"). Aucun element graphique, texte ou bord de page ne doit entrer dans cette zone.

```
    x
  +---+
  |   |
x | LOGO | x
  |   |
  +---+
    x
```

- Zone de protection : 1x sur chaque cote (haut, bas, gauche, droite)
- Sur fond photographique : 1.5x minimum

### 2.4 Taille minimum

| Support | Taille minimum (largeur) |
|---------|------------------------|
| Ecran (logo complet avec texte) | 120px |
| Ecran (icone seule) | 24px |
| Print (logo complet) | 30mm |
| Print (icone seule) | 8mm |
| Favicon | 16x16px (icone simplifiee) |

### 2.5 Ce qu'on ne fait PAS avec le logo

- **Ne pas** modifier les couleurs du gradient (pas de rose, pas de vert)
- **Ne pas** pivoter, incliner ou deformer le logo
- **Ne pas** ajouter d'ombre portee, de contour ou d'effet de brillance
- **Ne pas** placer le logo sur un fond charge ou photographique sans contraste suffisant (ratio minimum 3:1)
- **Ne pas** redimensionner de maniere non proportionnelle (etirer/ecraser)
- **Ne pas** animer le logo (pas de rotation, rebond, pulse)
- **Ne pas** utiliser le logo comme element de pattern ou de motif repete
- **Ne pas** modifier l'espacement entre l'icone et le texte "SIVFlow"
- **Ne pas** substituer la police du texte "SIVFlow"
- **Ne pas** associer le logo a des marques tierces sans accord prealable

---

## 3. Palette etendue

### 3.1 Couleurs primaires

| Nom | Hex | HSL | Role |
|-----|-----|-----|------|
| **Bleu Primaire Fonce** | #1E3A8A | 225 64% 33% | Texte sur fond clair, fond de header/sidebar |
| **Bleu Primaire** | #1447C7 | 225 100% 39% | CTA principaux, liens, focus rings, marque |
| **Bleu Primaire Clair** | #2563EB | 217 91% 53% | Hover sur CTA, gradient fin du logo |
| **Bleu Primaire Tres Clair** | #DBEAFE | 214 95% 93% | Fond de badge info, fond de selection |

### 3.2 Couleur accent

| Nom | Hex | HSL | Role |
|-----|-----|-----|------|
| **Teal Accent** | #0D9488 | 175 84% 32% | Indicateur de progression, badges succes, fleche logo |
| **Teal Clair** | #CCFBF1 | 166 76% 89% | Fond de badge succes, highlight |

### 3.3 Couleur highlight

| Nom | Hex | HSL | Role |
|-----|-----|-----|------|
| **Dore** | #EAB308 | 48 96% 47% | Etoiles d'avis, badges premium, promotions |
| **Dore Clair** | #FEF9C3 | 55 97% 88% | Fond d'alerte attention |

### 3.4 Couleurs semantiques

| Nom | Hex | HSL | Role |
|-----|-----|-----|------|
| **Succes** | #16A34A | 142 76% 36% | Demarche validee, paiement confirme |
| **Avertissement** | #EA8C07 | 38 92% 47% | Document manquant, delai proche |
| **Erreur / Destructif** | #DC2626 | 0 84% 50% | Erreurs, suppressions, refus |

### 3.5 Neutres

| Nom | Hex | HSL | Role |
|-----|-----|-----|------|
| **Neutral 50** | #FAFAFA | 0 0% 98% | Fond de page, fond de section alternee |
| **Neutral 100** | #F5F5F5 | 0 0% 96% | Fond muted, fond de sidebar |
| **Neutral 200** | #E5E5E5 | 0 0% 90% | Bordures, separateurs |
| **Neutral 400** | #A3A3A3 | 0 0% 64% | Texte placeholder, texte desactive |
| **Neutral 500** | #737373 | 0 0% 45% | Texte secondaire, muted-foreground |
| **Neutral 800** | #333333 | 0 0% 20% | Texte principal body |
| **Neutral 900** | #171717 | 0 0% 9% | Titres, texte a fort impact |

### 3.6 Ratios de contraste WCAG AA

Les ratios ci-dessous sont calcules pour du texte normal (minimum 4.5:1) et du texte large/gras (minimum 3:1).

| Combinaison texte / fond | Ratio | WCAG AA Normal | WCAG AA Large |
|---------------------------|-------|----------------|---------------|
| Neutral 800 (#333) sur Background (#FFF) | 12.6:1 | Passe | Passe |
| Neutral 500 (#737373) sur Background (#FFF) | 4.6:1 | Passe | Passe |
| Neutral 400 (#A3A3A3) sur Background (#FFF) | 2.6:1 | Echoue | Passe |
| Bleu Primaire (#1447C7) sur Background (#FFF) | 5.8:1 | Passe | Passe |
| Bleu Primaire Fonce (#1E3A8A) sur Background (#FFF) | 9.4:1 | Passe | Passe |
| Blanc (#FFF) sur Bleu Primaire (#1447C7) | 5.8:1 | Passe | Passe |
| Blanc (#FFF) sur Bleu Primaire Fonce (#1E3A8A) | 9.4:1 | Passe | Passe |
| Blanc (#FFF) sur Teal Accent (#0D9488) | 3.4:1 | Echoue | Passe |
| Blanc (#FFF) sur Succes (#16A34A) | 3.2:1 | Echoue | Passe |
| Blanc (#FFF) sur Erreur (#DC2626) | 4.6:1 | Passe | Passe |
| Neutral 900 (#171717) sur Dore Clair (#FEF9C3) | 14.8:1 | Passe | Passe |
| Neutral 800 (#333) sur Bleu Tres Clair (#DBEAFE) | 9.8:1 | Passe | Passe |

**Attention** : Le blanc sur Teal (#0D9488) echoue en texte normal. Pour du texte sur fond teal, utiliser du texte en gras 18px+ ou passer a un teal plus fonce (#0F766E, ratio 4.6:1).

**Attention** : Le blanc sur Succes (#16A34A) echoue en texte normal. Utiliser du texte gras/large ou un vert plus fonce (#15803D) pour le texte courant.

### 3.7 Usage par contexte

| Contexte | Couleur(s) a utiliser |
|----------|----------------------|
| Bouton principal (CTA) | Fond : Bleu Primaire. Texte : Blanc |
| Bouton secondaire | Fond : transparent, bordure Neutral 200. Texte : Neutral 800 |
| Bouton destructif | Fond : Erreur. Texte : Blanc |
| Liens | Bleu Primaire. Hover : Bleu Primaire Clair |
| Fond de page | Background (#FFF) ou Neutral 50 en alternance |
| Sidebar / navigation | Fond : Bleu Primaire Fonce ou Neutral 100 |
| Badges statut "En cours" | Fond : Bleu Tres Clair. Texte : Bleu Primaire Fonce |
| Badges statut "Valide" | Fond : Teal Clair. Texte : Teal Accent |
| Badges statut "Erreur" | Fond : #FEE2E2. Texte : Erreur |
| Badges statut "Attention" | Fond : Dore Clair. Texte : #92400E |
| Focus ring | Bleu Primaire, 2px, offset 2px |

---

## 4. Iconographie

### 4.1 Bibliotheque

**Bibliotheque officielle** : lucide-react (deja integree dans le projet).

Ne pas mixer avec d'autres bibliotheques d'icones (pas de FontAwesome, Heroicons, ou Material Icons en parallele). Si une icone n'existe pas dans Lucide, creer un SVG custom respectant les specifications ci-dessous.

### 4.2 Specifications techniques

| Propriete | Valeur |
|-----------|--------|
| Taille par defaut (inline avec texte) | 16px (`w-4 h-4`) |
| Taille dans les boutons | 16px (`w-4 h-4`) ou 20px (`w-5 h-5`) pour les boutons large |
| Taille dans les cards/sections | 24px (`w-6 h-6`) |
| Taille hero/decorative | 32-48px (`w-8 h-8` a `w-12 h-12`) |
| Epaisseur de trait (stroke-width) | 2 (defaut Lucide, ne pas modifier) |
| Coin de ligne (stroke-linecap) | round (defaut Lucide) |

### 4.3 Couleurs des icones selon contexte

| Contexte | Classe Tailwind | Couleur resultante |
|----------|----------------|-------------------|
| Navigation / header | `text-foreground` | Neutral 800 |
| Dans un bouton primaire | `text-primary-foreground` | Blanc |
| Decorative dans une card | `text-primary` | Bleu Primaire |
| Statut succes | `text-success` ou `text-teal-600` | Vert / Teal |
| Statut erreur | `text-destructive` | Rouge |
| Statut avertissement | `text-warning` ou `text-yellow-600` | Dore / Jaune |
| Placeholder / inactive | `text-muted-foreground` | Neutral 500 |
| Fond d'icone decorative | `bg-primary/10` avec icone `text-primary` | Fond bleu pale, icone bleue |

### 4.4 Icones standard par fonctionnalite

| Fonctionnalite | Icone Lucide | Nom du composant |
|----------------|-------------|-----------------|
| Tableau de bord | `LayoutDashboard` | LayoutDashboard |
| Nouvelle demarche | `Plus` ou `FilePlus` | Plus / FilePlus |
| Liste des demarches | `FileText` | FileText |
| Suivi / statut | `Clock` | Clock |
| Demarche validee | `CheckCircle` | CheckCircle |
| Erreur / refus | `AlertCircle` | AlertCircle |
| Telechargement | `Download` | Download |
| Upload document | `Upload` | Upload |
| Parametres | `Settings` | Settings |
| Profil / compte | `UserCircle` | UserCircle |
| Deconnexion | `LogOut` | LogOut |
| Connexion | `LogIn` | LogIn |
| Notifications | `Bell` | Bell |
| Facturation | `Receipt` ou `CreditCard` | Receipt / CreditCard |
| Aide | `HelpCircle` | HelpCircle |
| Recherche | `Search` | Search |
| Fermer | `X` | X |
| Menu mobile | `Menu` | Menu |
| Fleche retour | `ArrowLeft` | ArrowLeft |
| Fleche suivant / CTA | `ArrowRight` | ArrowRight |
| Securite / agrement | `Shield` ou `ShieldCheck` | Shield / ShieldCheck |
| Vehicule | `Car` | Car |

---

## 5. Photographie et Illustrations

### 5.1 Style photographique pour la landing page

**Direction artistique** :
- Photographies reelles, pas d'IA generative identifiable
- Ambiance lumineuse, eclairage naturel ou studio doux
- Tons froids dominants (bleu, gris clair) avec touches chaudes ponctuelles
- Nettet sur le sujet principal, arriere-plan flou ou neutre acceptable

**Sujets a montrer** :
- Vehicules francais courants (Renault, Peugeot, Citroen, etc.) -- neufs et occasions
- Carte grise francaise en plan rapproche (le document officiel)
- Professionnels au travail dans un garage ou un bureau (ecran, documents)
- Mains sur un clavier / ecran illustrant la demarche en ligne
- Drapeaux francais ou references institutionnelles subtiles (tricolore)

**Ce qu'on evite** :
- Photos de stock generiques avec sourires exageres
- Vehicules de luxe ou exotiques (pas representatif de la cible)
- Images de pre-fecture, files d'attente, paperasse en desordre (connotation negative)
- Visuels sombres, contraste agressif, filtres Instagram
- Photos avec du texte incruste (les textes doivent etre dans le HTML)
- Images contenant des plaques d'immatriculation etrangeres

### 5.2 Illustrations et elements graphiques

**Style si illustrations** :
- Flat design ou line-art simple
- Palette limitee aux couleurs de la marque (bleu primaire, teal, neutrals)
- Epaisseur de trait coherente avec les icones Lucide (2px)
- Pas de degradees complexes dans les illustrations
- Pas de personnages cartoon

**Elements graphiques acceptes** :
- Badges de confiance ("Service agree", "100% en ligne", etoiles)
- Icones decoratives large (section features)
- Separateurs de section subtils (ligne fine ou gradient doux)
- Fond de section en gradient bleu tres leger (#DBEAFE -> blanc)

---

## 6. Naming Conventions

### 6.1 Nommage des features dans l'UI

Toutes les fonctionnalites sont nommees en francais dans l'interface utilisateur. Les termes anglais sont proscrits dans tout element visible par l'utilisateur.

| Concept technique | Nom dans l'UI | A ne pas utiliser |
|-------------------|--------------|-------------------|
| Dashboard | Tableau de bord | Dashboard |
| Login | Connexion | Login, Se connecter |
| Logout | Deconnexion | Logout, Se deconnecter |
| Settings | Parametres | Settings, Reglages |
| Profile | Mon etablissement (pro) / Mon compte (particulier) | Profil, Profile |
| Upload | Ajouter un document / Telecharger (vers le serveur) | Upload, Uploader |
| Download | Telecharger | Download |
| Search | Rechercher | Search |
| Filter | Filtrer | Filter |
| Notifications | Notifications | Alerts |
| Invoice | Facture | Invoice |
| Billing | Facturation | Billing |
| Status tracking | Suivi | Tracking, Status |
| Submit | Envoyer | Soumettre, Submit |
| Delete | Supprimer | Delete, Effacer |
| Edit | Modifier | Edit, Editer |
| Cancel | Annuler | Cancel |
| Confirm | Confirmer | Confirm |
| Back | Retour | Back, Precedent |
| Next | Suivant | Next |
| Save | Enregistrer | Sauvegarder, Save |

### 6.2 Vocabulaire SIV standardise

Les termes ci-dessous sont les seuls acceptes dans toute l'interface et la communication. Ils doivent etre utilises de maniere coherente sur toutes les instances.

| Terme officiel SIVFlow | Definition | Synonymes a ne PAS utiliser |
|------------------------|-----------|----------------------------|
| **Demarche** | Action administrative globale (unite de travail) | Demande, Requete, Dossier (sauf dans "dossier complet" contextuellement) |
| **Carte grise** | Certificat d'immatriculation | CI (trop technique), Carte G., CG (acceptable apres premiere mention complete) |
| **Immatriculation** | Numero de plaque au format SIV | Plaque, Numero de plaque (acceptable en contexte conversationnel) |
| **Certificat d'immatriculation** | Document officiel delivre | CPI, Titre |
| **Changement de titulaire** | Transfert de propriete du vehicule | Mutation, Transfert de carte grise |
| **Declaration de cession** | Acte de vente officiel | Cession, Acte de vente, DC (acceptable apres premiere mention) |
| **Changement d'adresse** | Mise a jour de l'adresse sur la CG | Modification d'adresse |
| **Duplicata** | Reedition de la carte grise | Copie, Refaire la carte grise |
| **Correction** | Correction d'erreur sur le certificat | Rectification |
| **Immatriculation import** | Immatriculation d'un vehicule etranger | Import, WW |
| **Taxe regionale** | Composante de la taxe d'immatriculation | Y1, Cheval fiscal (acceptable en explication) |
| **Cheval fiscal** | Unite de puissance administrative | CV fiscaux, CV (acceptable en contexte) |
| **ANTS** | Agence Nationale des Titres Securises | Toujours ecrire "ANTS" en majuscules |
| **SIV** | Systeme d'Immatriculation des Vehicules | Toujours ecrire "SIV" en majuscules |
| **Espace pro** | Zone authentifiee du professionnel | Dashboard, Portail, Back-office |
| **Etablissement** | Le garage / commerce du professionnel | Garage (acceptable en contexte), Societe |
| **Titulaire** | Proprietaire du vehicule | Owner, Proprietaire (acceptable en contexte) |

### 6.3 Nommage des statuts de demarche

| Statut interne | Label affiche | Badge couleur |
|----------------|--------------|---------------|
| `draft` | Brouillon | Neutral (gris) |
| `pending` | En attente | Bleu clair |
| `documents_missing` | Document(s) manquant(s) | Dore (warning) |
| `processing` | En cours de traitement | Bleu |
| `completed` | Terminee | Teal (succes) |
| `rejected` | Refusee | Rouge (erreur) |
| `cancelled` | Annulee | Neutral (gris) |

### 6.4 Conventions de nommage technique (code)

Pour garantir la coherence entre le code et l'interface :

- **Composants React** : PascalCase en anglais (`DemarcheList`, `VehicleForm`)
- **Variables / props** : camelCase en anglais (`demarcheStatus`, `vehicleData`)
- **Tables Supabase** : snake_case en francais (`demarches`, `actions_rapides`, `garages`)
- **Colonnes Supabase** : snake_case en francais (`date_creation`, `statut`, `titulaire_nom`)
- **Fichiers** : PascalCase pour les composants (`Dashboard.tsx`), camelCase pour les utilitaires (`formatDate.ts`)
- **Routes URL** : kebab-case en francais (`/nouvelle-demarche`, `/mes-demarches`, `/recherche-suivi`)
- **Tokens CSS / variables** : kebab-case prefixe `--brand-` ou semantique (`--primary`, `--success`)

---

## Annexe A : Mapping entre CSS actuel et palette SIVFlow

Le design system actuel utilise des variables HSL dans `index.css`. Voici le mapping vers la palette SIVFlow pour les futures migrations :

```css
/* Variables actuelles -> Equivalence SIVFlow */
--primary: 225 100% 39%;        /* -> Bleu Primaire #1447C7 */
--primary-foreground: 0 0% 100%; /* -> Blanc */
--secondary: 0 0% 20%;           /* -> Neutral 800 */
--accent: 0 100% 50%;            /* -> France Red (a remplacer par Teal #0D9488 pour SIVFlow) */
--success: 142 76% 36%;          /* -> Succes #16A34A */
--warning: 38 92% 50%;           /* -> Avertissement #EA8C07 */
--destructive: 0 84.2% 60.2%;   /* -> Erreur #DC2626 (ajuster) */
```

**Action de migration recommandee** : La variable `--accent` utilise actuellement le rouge du drapeau francais. Pour SIVFlow, l'accent doit passer au Teal (#0D9488, soit `175 84% 32%` en HSL) afin de refleter l'identite SIVFlow distincte de l'instance "Discount Carte Grise".

---

## Annexe B : Checklist de conformite pour nouvelle instance

Avant de deployer une nouvelle instance SIVFlow, verifier :

- [ ] Logo remplace par la variante appropriee (fond clair ou sombre)
- [ ] Favicon et meta og:image mis a jour
- [ ] Variable `--accent` migree vers Teal (#0D9488)
- [ ] Tous les textes "DiscountCG" / "Discount Carte Grise" remplaces par "SIVFlow"
- [ ] Tagline "Gerez vos demarches auto en quelques clics" presente sur la landing page
- [ ] Vouvoiement verifie dans tous les textes de l'interface
- [ ] Noms des statuts conformes au tableau de la section 6.3
- [ ] Emails transactionnels utilisant le format "[SIVFlow]" en objet
- [ ] Contraste WCAG AA verifie sur tous les CTA et textes de body
- [ ] Icones exclusivement issues de lucide-react
- [ ] Routes URL en kebab-case francais
- [ ] Meta title format : "SIVFlow | [Nom de la page]"
