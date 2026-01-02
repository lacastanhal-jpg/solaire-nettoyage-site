# 🔄 WORKFLOWS COMPLETS - ERP SOLAIRE NETTOYAGE

**Date :** 2 Janvier 2026, 15h40  
**Version :** v1.2 (Session 2)

---

## 1️⃣ WORKFLOW CRM : GESTION HIÉRARCHIQUE

### Création hiérarchie complète

```
ÉTAPE 1 : CRÉER GROUPE
─────────────────────────
Interface : /admin/crm/groupes
Action : Clic [+ Nouveau Groupe]

Formulaire :
├─ Nom : "ENGIE"
├─ Description : "Groupe ENGIE - Leader énergie"
├─ Logo : Upload image
└─ [Enregistrer]

Résultat : Groupe créé → ID auto-généré
```

```
ÉTAPE 2 : CRÉER CLIENT
─────────────────────────
Interface : /admin/crm/clients
Action : Clic [+ Nouveau Client]

Formulaire :
├─ Sélection Groupe : "ENGIE" (dropdown)
├─ Raison sociale : "ENGIE Renouvelables"
├─ SIRET : "123 456 789 00012"
├─ Adresse complète
├─ Contact principal
├─ Email facturation
├─ Conditions paiement : "30 jours fin de mois"
└─ [Enregistrer]

Résultat : 
├─ Client créé → CLI-2026-0001
├─ groupeId automatiquement rempli
└─ groupeNom dénormalisé (copié)
```

```
ÉTAPE 3 : CRÉER SITE
─────────────────────────
Interface : /admin/crm/sites
Action : Clic [+ Nouveau Site]

Formulaire :
├─ Sélection Client : "ENGIE Renouvelables" (dropdown)
├─ Nom site : "Site Lyon Gerland"
├─ Adresse : "123 Rue de Gerland, 69007 Lyon"
├─ GPS : 
│   ├─ Latitude : 45.7276
│   └─ Longitude : 4.8320
├─ Puissance : 5 MWc
├─ Surface panneaux : 1000 m²
├─ Contact site : "Jean Dupont"
├─ Instructions : "Clé au gardien bâtiment B"
└─ [Enregistrer]

Validation :
├─ GPS obligatoire ✓
├─ clientId automatiquement rempli
├─ clientNom dénormalisé
└─ groupeNom dénormalisé

Résultat : Site créé → SITE-2026-0001
```

### Import CSV sites en masse

```
WORKFLOW IMPORT SITES
─────────────────────────

Interface : /admin/crm/sites/import

ÉTAPE 1 : Télécharger template CSV
├─ Colonnes obligatoires :
│   ├─ client_nom
│   ├─ nom_site
│   ├─ adresse
│   ├─ code_postal
│   ├─ ville
│   ├─ gps_lat ⚠️ OBLIGATOIRE
│   ├─ gps_lng ⚠️ OBLIGATOIRE
│   └─ surface_m2
└─ Colonnes optionnelles :
    ├─ puissance_mwc
    ├─ contact_site
    └─ instructions

ÉTAPE 2 : Remplir Excel
Exemple :
client_nom,nom_site,adresse,gps_lat,gps_lng,surface_m2
ENGIE Renouvelables,Site Lyon,123 Rue...,45.7276,4.8320,1000
ENGIE Renouvelables,Site Paris,456 Ave...,48.8398,2.3821,1500

ÉTAPE 3 : Upload CSV
├─ Prévisualisation données
├─ Validation :
│   ├─ GPS présent pour chaque ligne ✓
│   ├─ Client existe dans base ✓
│   └─ Pas de doublons ✓
└─ [Importer]

ÉTAPE 4 : Traitement
├─ Matching automatique client par nom
├─ Création sites avec numérotation auto
└─ Rapport import :
    ├─ 145 sites créés
    ├─ 3 erreurs (GPS manquant)
    └─ Log téléchargeable

Résultat : Sites créés en masse avec hiérarchie préservée
```

---

## 2️⃣ WORKFLOW DEVIS → FACTURE COMPLET

### Création devis multi-sites

```
WORKFLOW DEVIS
─────────────────────────

Interface : /admin/finances/devis
Action : Clic [+ Nouveau Devis]

ÉTAPE 1 : EN-TÊTE DEVIS
├─ Sélection Groupe : "ENGIE"
├─ Sélection Client : "ENGIE Renouvelables"
├─ Date : 02/01/2026
└─ Conditions : "30 jours fin de mois" (auto-rempli depuis client)

ÉTAPE 2 : AJOUTER LIGNES (multi-sites)
Pour chaque site :

Ligne 1 :
├─ Sélection Site : "Lyon Gerland"
├─ Sélection Article : "Nettoyage panneaux PV"
├─ Quantité : 1000 m²
├─ Prix unitaire HT : 0.50€/m² (récupéré automatiquement selon tarification)
├─ Calcul automatique :
│   ├─ Montant HT : 500.00€
│   ├─ TVA 20% : 100.00€
│   └─ Montant TTC : 600.00€
└─ [Ajouter ligne]

Ligne 2 :
├─ Site : "Paris Bercy" → 1500 m² → 750€ HT
└─ [Ajouter ligne]

Ligne 3 :
├─ Site : "Toulouse Blagnac" → 800 m² → 480€ HT
└─ [Ajouter ligne]

ÉTAPE 3 : TOTAUX AUTOMATIQUES
Calcul en temps réel :
├─ Total HT : 1730.00€
├─ Total TVA : 346.00€
└─ Total TTC : 2076.00€

ÉTAPE 4 : ENREGISTRER
└─ Statut : "brouillon"
    Numéro auto : DEV-2026-0001

ÉTAPE 5 : GÉNÉRATION PDF
├─ Clic [Générer PDF]
├─ Composants PDF :
│   ├─ Logo Solaire Nettoyage
│   ├─ Informations entreprise
│   ├─ Informations client
│   ├─ Tableau lignes (1 ligne par site)
│   ├─ Totaux
│   └─ Mentions légales
└─ Téléchargement automatique

ÉTAPE 6 : ENVOI EMAIL
├─ Clic [Envoyer au client]
├─ Modal :
│   ├─ Destinataire : contact.engie@exemple.fr (pré-rempli)
│   ├─ CC : facturation.engie@exemple.fr
│   ├─ Objet : "Devis DEV-2026-0001 - ENGIE Renouvelables"
│   └─ Message personnalisable
├─ [Envoyer]
├─ SMTP IONOS : Envoi depuis jerome@solairenettoyage.fr
└─ Statut passe : "envoyé"
    Historique enregistré : date + destinataires

Résultat : Devis créé, PDF généré, email envoyé ✓
```

### Validation devis → Création interventions ⭐ Session 2

```
WORKFLOW VALIDATION DEVIS → INTERVENTIONS
─────────────────────────────────────────

Interface : /admin/finances/devis/[id]

ÉTAPE 1 : CLIENT ACCEPTE
└─ Clic [✓ Valider en commande]

ÉTAPE 2 : CONFIRMATION
Modal :
├─ "Ce devis contient 3 sites"
├─ "Voulez-vous créer 3 interventions automatiquement ?"
├─ [Oui] [Non]
└─ Sélection [Oui]

ÉTAPE 3 : CRÉATION INTERVENTIONS AUTOMATIQUE
Backend : workflow-devis-intervention.ts

Pour chaque ligne devis :
├─ Récupération données ligne :
│   ├─ siteId, siteNom
│   ├─ surface (SOMME toutes lignes même site) ⭐ Corrigé Session 2
│   └─ clientNom, groupeNom
│
├─ Génération numéro séquentiel : ⭐ Corrigé Session 2
│   ├─ Récupération dernier numéro Firebase
│   ├─ Incrément local : lastNum + 1, lastNum + 2, lastNum + 3
│   └─ Format : INT-2026-0001, INT-2026-0002, INT-2026-0003
│
├─ Création intervention :
│   ├─ numero: "INT-2026-0001"
│   ├─ devisId: "abc123"
│   ├─ devisNumero: "DEV-2026-0001"
│   ├─ siteId: "xyz789"
│   ├─ siteNom: "Lyon Gerland" ⭐ Correct Session 2
│   ├─ surface: 1000 ⭐ Correct Session 2
│   ├─ clientNom: "ENGIE Renouvelables"
│   ├─ groupeNom: "ENGIE"
│   ├─ statut: "planifiee"
│   ├─ datePrevue: date du jour + 7j
│   └─ facturee: false
│
└─ Sauvegarde Firebase

ÉTAPE 4 : CONFIRMATION
Résultat :
├─ 3 interventions créées ✓
├─ Numéros corrects et séquentiels ✓
├─ Données correctes pour chaque site ✓
└─ Redirection automatique : /admin/operations/interventions?devisId=abc123

ÉTAPE 5 : AFFICHAGE LISTE
Liste filtrée automatiquement :
├─ INT-2026-0001 | Lyon Gerland | 1000 m² | Planifiée
├─ INT-2026-0002 | Paris Bercy | 1500 m² | Planifiée
└─ INT-2026-0003 | Toulouse Blagnac | 800 m² | Planifiée

Workflow complet validé ✓
```

### Planification intervention

```
WORKFLOW PLANIFICATION
─────────────────────────

Interface : /admin/operations/interventions/[id]

ÉTAPE 1 : OUVRIR INTERVENTION
└─ Clic sur INT-2026-0001

ÉTAPE 2 : AFFECTER ÉQUIPE & DATE
├─ Équipe : "Équipe 1" (dropdown)
├─ Date prévue : 15/01/2026
├─ Opérateurs :
│   ├─ ☑ Sébastien HENRY
│   ├─ ☑ Joffrey BELVÈZE
│   └─ ☐ Thomas MARTIN
└─ [Enregistrer]

Résultat :
├─ Intervention visible calendrier équipe 1
├─ Couleur équipe appliquée
└─ Opérateurs notifiés (future fonctionnalité)
```

---

## 3️⃣ WORKFLOW NOTES DE FRAIS COMPLET ⭐ Session 2

### Création note de frais

```
WORKFLOW CRÉATION NOTE
─────────────────────────

Interface : /admin/finances/notes-frais
Action : Clic [+ Nouvelle Note]

ÉTAPE 1 : FORMULAIRE SAISIE
├─ Opérateur : "Jerome Gely" (dropdown)
├─ Date : 02/01/2026
├─ Catégorie : "Hébergement" (dropdown)
│   Options : Carburant/Péage/Repas/Hébergement/Fournitures/Entretien/Autre
│
├─ Montant TTC : 125.00€
├─ TVA : 10% (auto ou manuel)
├─ Calcul automatique :
│   ├─ Montant HT : 113.64€
│   └─ Montant TVA : 11.36€
│
├─ TVA récupérable : ☑ Oui
├─ Description : "1 nuits"
├─ Fournisseur : "Hôtel Ibis"
│
├─ SI CATÉGORIE = CARBURANT :
│   ├─ Véhicule : "FOURGON" (dropdown)
│   ├─ Immatriculation : auto-rempli
│   └─ Km parcourus : 150
│
└─ Upload justificatif :
    ├─ Photo ticket (PNG/JPG)
    ├─ ou PDF
    └─ Stockage Firebase Storage

ÉTAPE 2 : ENREGISTRER
└─ [Enregistrer]
    ├─ Numéro auto : NF-2026-001
    └─ Statut : "brouillon"

Résultat : Note créée, visible liste avec badge gris "Brouillon"
```

### Soumission note pour validation ⭐ Session 2

```
WORKFLOW SOUMISSION
─────────────────────────

Interface : /admin/finances/notes-frais/[id]

ÉTAPE 1 : VÉRIFIER NOTE
Page détail affiche :
├─ Numéro : NF-2026-001
├─ Badge statut : "Brouillon" (gris)
├─ Informations complètes
├─ Justificatifs uploadés
└─ Bouton visible : [📤 Soumettre pour validation] (orange)

ÉTAPE 2 : SOUMETTRE
├─ Clic [Soumettre pour validation]
├─ Confirmation : "Soumettre cette note de frais pour validation ?"
├─ [OK]
├─ Backend : soumettreNoteDeFrais(noteId)
│   ├─ Vérification statut = "brouillon" ✓
│   ├─ Update Firebase :
│   │   ├─ statut: "soumise"
│   │   ├─ dateSoumission: timestamp
│   │   └─ updatedAt: timestamp
│   └─ Return success
│
└─ Alert : "✅ Note soumise pour validation"
    Redirection auto : /admin/finances/notes-frais

ÉTAPE 3 : VÉRIFICATION LISTE
Liste mise à jour :
├─ NF-2026-001 maintenant badge "À valider" (orange)
├─ Checkbox apparaît dans colonne sélection ✓
├─ Note comptée dans KPI "À Valider" : 1
└─ Montant ajouté total en attente : 125.00€

Workflow soumission terminé ✓
```

### Validation en masse ⭐ Session 2

```
WORKFLOW VALIDATION MASSE
─────────────────────────

Interface : /admin/finances/notes-frais

ÉTAPE 1 : SÉLECTION NOTES
Liste affiche notes statut "soumise" avec checkboxes :

├─ ☑ NF-2026-001 | Jerome Gely | Hébergement | 125.00€ | À valider
├─ ☑ NF-2026-002 | Axel Gely | Repas | 55.00€ | À valider
└─ ☑ NF-2026-003 | Joffrey | Carburant | 100.00€ | À valider

Actions possibles :
├─ Checkbox individuelle par ligne
└─ Checkbox en-tête : "☑ Tout sélectionner" (toutes notes soumises)

ÉTAPE 2 : SÉLECTION
└─ Clic 3 checkboxes individuelles

ÉTAPE 3 : BARRE ACTIONS APPARAÎT
Barre bleue en haut tableau :
├─ "3 note(s) sélectionnée(s)"
├─ [Tout désélectionner]
├─ [✓ Valider la sélection] (vert)
└─ [✗ Refuser la sélection] (rouge)

ÉTAPE 4 : VALIDATION
├─ Clic [Valider la sélection]
├─ Modal confirmation :
│   ├─ Titre : "Valider 3 note(s)"
│   ├─ Liste notes :
│   │   ├─ NF-2026-001 - Jerome Gely - 125.00€
│   │   ├─ NF-2026-002 - Axel Gely - 55.00€
│   │   └─ NF-2026-003 - Joffrey - 100.00€
│   ├─ Total : 280.00€
│   ├─ Commentaire : [textarea optionnel]
│   └─ Boutons : [Annuler] [Confirmer]
│
└─ Clic [Confirmer]

ÉTAPE 5 : TRAITEMENT BACKEND
Backend : validerNotesEnMasse()

Transaction atomique Firestore :
├─ Pour chaque noteId :
│   ├─ Vérification existence note ✓
│   ├─ Vérification statut = "soumise" ✓
│   ├─ writeBatch.update :
│   │   ├─ statut: "validee"
│   │   ├─ dateValidation: timestamp
│   │   ├─ validateurId: "jerome_id"
│   │   ├─ validateurNom: "Jerome Gely"
│   │   └─ commentaireValidation: "Validé en masse"
│   └─ Ajout à tableau succès
│
├─ commit() transaction
└─ Return :
    ├─ success: true
    ├─ notesValidees: ["id1", "id2", "id3"]
    ├─ notesErreur: []
    └─ totalTraitees: 3

ÉTAPE 6 : CONFIRMATION UI
├─ Alert : "✅ 3 note(s) validée(s) avec succès"
├─ Désélection automatique
├─ Fermeture modal
└─ Rechargement liste

ÉTAPE 7 : LISTE MISE À JOUR
Notes maintenant :
├─ NF-2026-001 | Badge "Validée" (vert) | Pas de checkbox
├─ NF-2026-002 | Badge "Validée" (vert) | Pas de checkbox
└─ NF-2026-003 | Badge "Validée" (vert) | Pas de checkbox

KPIs mis à jour :
├─ À Valider : 0 (0.00€)
└─ À Rembourser : 3 (280.00€)

Workflow validation masse terminé ✓
ROI : 50h/mois validation → 5h/mois (45h économisées)
```

### Refus en masse ⭐ Session 2

```
WORKFLOW REFUS MASSE
─────────────────────────

Similaire à validation mais :

DIFFÉRENCES :
├─ Clic [✗ Refuser la sélection] (rouge)
├─ Modal :
│   ├─ Titre : "Refuser 2 note(s)"
│   ├─ Motif refus : [textarea OBLIGATOIRE]
│   │   Exemple : "Justificatif manquant"
│   └─ [Confirmer refus]
│
├─ Backend : refuserNotesEnMasse()
│   ├─ Vérification motif non vide ✓
│   ├─ Update statut: "refusee"
│   └─ Sauvegarde motifRefus
│
└─ Résultat : Notes badge rouge "Refusée"

Opérateur peut corriger et resoumettre
```

---

## 4️⃣ WORKFLOW TRÉSORERIE PRÉVISIONNEL ⭐ Session 2

### Consultation prévisionnel 90 jours

```
WORKFLOW PRÉVISIONNEL
─────────────────────────

Interface : /admin/finances/tresorerie
Onglets : [Dashboard] [Prévisionnel 90j]

ÉTAPE 1 : CLIC ONGLET PRÉVISIONNEL
└─ Chargement automatique

ÉTAPE 2 : BACKEND CALCUL
Backend : tresorerie-previsionnel.ts

Fonction : genererPrevisionnelTresorerie(90)

CALCUL ENCAISSEMENTS PRÉVISIONNELS :
├─ Query Firestore : factures where statut IN ['envoyee', 'partiellement_payee']
├─ Pour chaque facture :
│   ├─ Montant restant = totalTTC - paiements
│   ├─ Date prévue = dateEcheance
│   └─ Ajout prévision :
│       ├─ date: dateEcheance
│       ├─ type: "encaissement"
│       ├─ montant: resteAPayer
│       └─ reference: factureNumero
│
└─ Total encaissements : +156 000€

CALCUL DÉCAISSEMENTS PRÉVISIONNELS :
├─ Query : factures_fournisseurs where statut = 'en_attente'
├─ Pour chaque facture fournisseur :
│   └─ Ajout prévision :
│       ├─ date: dateEcheance
│       ├─ type: "decaissement"
│       ├─ montant: -totalTTC
│       └─ reference: numero
│
└─ Total décaissements : -45 000€

CALCUL SOLDE JOUR PAR JOUR :
├─ Solde initial : 75 000€ (compte bancaire actuel)
├─ Pour j=1 to j=90 :
│   ├─ Récupérer prévisions date j
│   ├─ Solde[j] = Solde[j-1] + Σ(encaissements) + Σ(décaissements)
│   └─ Si solde < 0 → Alerte
│
└─ Résultat :
    ├─ Solde J+30 : 95 000€
    ├─ Solde J+60 : 135 000€
    └─ Solde J+90 : 186 000€

GÉNÉRATION ALERTES :
├─ Si solde[i] < 0 : "⚠️ Découvert prévu le XX/XX"
├─ Si solde[i] < 10000 : "⚠️ Tension trésorerie le XX/XX"
└─ Si min(solde) < 20000 : "⚠️ Point bas : XX€ le XX/XX"

ÉTAPE 3 : AFFICHAGE INTERFACE
Component : GraphiquePrevisionnel.tsx

KPIs (4 cartes) :
├─ Solde Actuel : 75 000€ (bleu)
├─ Solde J+30 : 95 000€ (vert si positif)
├─ Solde J+60 : 135 000€ (vert)
└─ Solde J+90 : 186 000€ (vert)

Graphique Recharts :
├─ Type : LineChart
├─ Axe X : Dates (J+1 à J+90)
├─ Axe Y : Montants (€)
├─ Courbe bleue : Évolution solde prévisionnel
├─ Ligne rouge pointillée : Seuil alerte 0€
└─ Tooltips : Date + Solde + Détails opérations

Légende :
├─ 📊 Solde prévisionnel (bleu)
├─ 💰 Encaissements attendus : 156 000€
└─ 💸 Décaissements prévus : 45 000€

Filtres :
├─ [30 jours] [60 jours] [90 jours]
└─ Clic filtre → Recharge graphique période sélectionnée

Alertes affichées :
└─ Si alertes détectées → Encart orange avec messages

ÉTAPE 4 : INTERPRÉTATION
Jerome consulte :
├─ Point bas : 85 000€ le 25/01
├─ Période critique : Aucune
├─ Décision : OK pour investissement prévu
└─ Prévisionnel exportable (future fonctionnalité)

Workflow consultation terminé ✓
ROI : Anticipation découverts + Optimisation placements
```

---

## 5️⃣ WORKFLOW RAPPORTS PRAXEDO AUTOMATIQUE

### Synchronisation automatique

```
WORKFLOW SYNC AUTOMATIQUE
─────────────────────────

Backend : CRON quotidien 9h00

ÉTAPE 1 : CONNEXION IMAP
├─ Serveur : imap.ionos.fr
├─ Email : rapports@solairenettoyage.fr
├─ Mot de passe : stocké environnement
└─ Connexion SSL

ÉTAPE 2 : RÉCUPÉRATION EMAILS
├─ Recherche emails non lus
├─ Filtre : from="noreply@praxedo.com"
├─ Période : dernières 24h
└─ Résultat : 5 emails trouvés

ÉTAPE 3 : TRAITEMENT EMAIL PAR EMAIL
Pour chaque email :

├─ Extraction pièce jointe PDF
├─ Upload Firebase Storage :
│   ├─ Path : /rapports-praxedo/2026/01/rapport_xxx.pdf
│   └─ URL : https://storage...
│
├─ Parsing PDF :
│   ├─ Extraction texte complet
│   ├─ Recherche pattern "Site :" ou "Centrale :"
│   ├─ Extraction nom site : "Lyon Gerland"
│   └─ Extraction date : 02/01/2026
│
├─ Matching intervention :
│   ├─ Query Firestore : interventions where siteNom contains "Lyon Gerland"
│   ├─ Filtre date +/- 7 jours
│   ├─ Score matching :
│   │   ├─ Nom exact : 100%
│   │   ├─ Nom similaire : 85%
│   │   └─ Nom partiel : 70%
│   └─ Sélection meilleur match si score > 80%
│
├─ Création document Firebase :
│   Collection : rapports_praxedo
│   {
│     emailId: "email_123"
│     nomSite: "Lyon Gerland"
│     dateIntervention: "2026-01-02"
│     pdfURL: "https://storage..."
│     interventionId: "INT-2026-0001" (si match)
│     interventionNumero: "INT-2026-0001"
│     matchingScore: 100
│     statut: "associe" (ou "nouveau" si pas match)
│   }
│
└─ Marquage email lu

ÉTAPE 4 : NOTIFICATION
Si match trouvé :
├─ Email Jerome : "Rapport Praxedo associé INT-2026-0001"
└─ Badge notification intranet

Si pas de match :
├─ Email Jerome : "Rapport Praxedo non associé - Action requise"
└─ Interface manuelle disponible : /admin/operations/rapports

ÉTAPE 5 : CONSULTATION JEROME
Interface : /admin/operations/interventions/INT-2026-0001

Section Rapport :
├─ Badge "Rapport disponible" (vert)
├─ Clic [Voir rapport]
├─ Ouverture PDF dans nouvel onglet
└─ Option [Télécharger]

Workflow sync terminé ✓
Répétition : Quotidienne automatique
```

---

## 6️⃣ WORKFLOW STOCK & FLOTTE

### Mouvement stock post-intervention

```
WORKFLOW DÉDUCTION STOCK
─────────────────────────

Déclencheur : Intervention clôturée

ÉTAPE 1 : CLÔTURE INTERVENTION
Interface : App mobile opérateur (future)
ou Manuel : /admin/operations/interventions/[id]

Action : [Clôturer intervention]

ÉTAPE 2 : SAISIE ARTICLES UTILISÉS
Liste articles scannés/saisis :
├─ Brosse rotative × 1
├─ Produit nettoyant × 5L
└─ Eau osmosée × 1000L

ÉTAPE 3 : DÉDUCTION AUTOMATIQUE
Backend : Pour chaque article

├─ Récupération stock actuel :
│   Query : stock_equipements where id = articleId
│   Stock actuel : 50 unités
│
├─ Calcul nouveau stock :
│   Nouveau stock = 50 - 1 = 49
│
├─ Création mouvement :
│   Collection : stock_mouvements
│   {
│     equipementId: "xxx"
│     equipementNom: "Brosse rotative"
│     type: "sortie"
│     quantite: -1
│     origine: "stock_central"
│     destination: "intervention"
│     interventionId: "INT-2026-0001"
│     interventionNumero: "INT-2026-0001"
│     motif: "Utilisation intervention"
│     operateurId: "op_123"
│     operateurNom: "Sébastien HENRY"
│     date: "2026-01-02"
│   }
│
├─ Update stock :
│   Update : stock_equipements
│   set quantiteStock = 49
│
└─ Vérification seuil :
    Si 49 < seuilAlerte (50) → Alerte email

ÉTAPE 4 : ALERTES
Email automatique si stock bas :
├─ Destinataire : jerome@solairenettoyage.fr
├─ Objet : "⚠️ Stock bas : Brosse rotative"
├─ Corps : 
│   "Stock actuel : 49 unités
│    Seuil alerte : 50 unités
│    Recommandation : Réapprovisionnement"
└─ Lien : Dashboard stock

ÉTAPE 5 : DASHBOARD TEMPS RÉEL
Interface : /admin/stock-flotte/equipements

Vue actualisée :
├─ Brosse rotative : 49 unités (badge orange "Stock bas")
├─ Produit nettoyant : 245 L (badge vert "OK")
└─ Eau osmosée : 7000 L (badge vert "OK")

Workflow déduction terminé ✓
```

---

## 7️⃣ WORKFLOW FACTURATION GROUPÉE (À DÉVELOPPER)

### Facturation fin de mois

```
WORKFLOW FACTURATION GROUPÉE
─────────────────────────────

Interface : /admin/finances/facturation-groupee

ÉTAPE 1 : FILTRES SÉLECTION
├─ Période : Janvier 2026
├─ Groupe : "ENGIE"
├─ Client : "ENGIE Renouvelables" (optionnel)
├─ Statut interventions : "Terminée non facturée"
└─ [Rechercher]

ÉTAPE 2 : LISTE INTERVENTIONS
Résultat affiche :
├─ ☑ INT-2026-0001 | Lyon Gerland | 1000 m² | 500€ HT
├─ ☑ INT-2026-0002 | Paris Bercy | 1500 m² | 750€ HT
├─ ☑ INT-2026-0003 | Toulouse | 800 m² | 480€ HT
└─ Total sélection : 1730€ HT | 346€ TVA | 2076€ TTC

ÉTAPE 3 : OPTIONS FACTURATION
├─ Type facture :
│   ├─ ○ 1 facture par site
│   └─ ● 1 facture groupée (sélectionné)
│
├─ Date facture : 31/01/2026
├─ Date échéance : 02/03/2026 (auto +30j)
└─ [Générer facture(s)]

ÉTAPE 4 : GÉNÉRATION
Si "1 facture groupée" :

Backend :
├─ Création facture unique :
│   {
│     numero: "FA-2026-0001"
│     clientId: "client_engie_renouvelables"
│     lignes: [
│       { siteId: "site1", siteNom: "Lyon", ... },
│       { siteId: "site2", siteNom: "Paris", ... },
│       { siteId: "site3", siteNom: "Toulouse", ... }
│     ]
│     totalHT: 1730
│     totalTVA: 346
│     totalTTC: 2076
│   }
│
├─ Update interventions :
│   set facturee = true
│   set factureId = "FA-2026-0001"
│
├─ Génération PDF
└─ Envoi email automatique

Résultat :
├─ 1 facture créée FA-2026-0001
├─ 3 interventions marquées facturées
└─ Email envoyé client

Workflow groupé terminé ✓
ROI : 5h/mois économisées
```

---

## 8️⃣ WORKFLOW RELANCES AUTOMATIQUES (À DÉVELOPPER)

### Relances impayés automatiques

```
WORKFLOW RELANCES AUTO
─────────────────────────

Backend : CRON quotidien 9h00

ÉTAPE 1 : SCAN FACTURES IMPAYÉES
Query Firestore :
├─ factures where statut IN ['envoyee', 'partiellement_payee']
├─ AND resteAPayer > 0
└─ Résultat : 12 factures trouvées

ÉTAPE 2 : CALCUL RETARD POUR CHAQUE FACTURE
Facture FA-2026-0045 :
├─ Date échéance : 05/01/2026
├─ Date aujourd'hui : 20/01/2026
├─ Retard : 15 jours
└─ Niveau relance : 1 (courtoise)

Facture FA-2025-0892 :
├─ Date échéance : 15/12/2025
├─ Retard : 36 jours
└─ Niveau relance : 2 (ferme)

ÉTAPE 3 : ENVOI RELANCES SELON NIVEAU

NIVEAU 1 : J+15 (Courtoise)
├─ Template email :
│   Objet : "Relance facture FA-2026-0045"
│   Corps : Ton courtois, rappel montant + échéance
│   PJ : PDF facture
│
├─ Envoi SMTP
└─ Log Firebase :
    Collection : relances
    {
      factureId: "xxx"
      niveau: 1
      dateEnvoi: timestamp
      emailDestinataire: "..."
    }

NIVEAU 2 : J+30 (Ferme)
├─ Template : Ton plus ferme
└─ CC : jerome@solairenettoyage.fr

NIVEAU 3 : J+45 (Dernière + Alerte Jerome)
├─ Template : Ton très ferme + mention pénalités
├─ CC : jerome + comptable
└─ Notification urgente Jerome

NIVEAU 4 : J+60 (Blocage client)
├─ Email final
├─ Update client :
│   set bloque = true
└─ Interdiction nouveau devis/intervention

ÉTAPE 4 : TABLEAU DE BORD RELANCES
Interface : /admin/finances/relances

Vue :
├─ 5 factures niveau 1 (orange)
├─ 4 factures niveau 2 (rouge)
├─ 2 factures niveau 3 (rouge foncé)
├─ 1 facture niveau 4 (bloqué)
└─ Total impayés : 45 890€

Actions manuelles :
├─ [Relancer maintenant]
├─ [Marquer payée]
└─ [Envoyer email personnalisé]

Workflow relances terminé ✓
ROI : 30 000€/an récupérés
```

---

**Date workflows :** 2 Janvier 2026, 15h40  
**Version :** v1.2 (Session 2)
