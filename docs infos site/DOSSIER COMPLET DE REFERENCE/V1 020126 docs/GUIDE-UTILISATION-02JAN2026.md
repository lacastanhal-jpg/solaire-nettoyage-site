# 📖 GUIDE D'UTILISATION QUOTIDIEN - ERP SOLAIRE NETTOYAGE

**Date :** 2 Janvier 2026, 15h40  
**Version :** v1.2 (Session 2)  
**Public :** Jerome, Axel, Équipes

---

## 🎯 ACCÈS À L'INTRANET

### Connexion

```
URL Production : https://erp.solaire-nettoyage.fr
ou : https://intranet.solaire-nettoyage.fr

Identifiants :
└─ À configurer après activation Firebase Auth
```

### Navigation principale

```
MENU PRINCIPAL (barre latérale) :

📊 Accueil
   └─ Dashboard principal

👥 CRM & Clients
   ├─ Groupes clients
   ├─ Clients
   └─ Sites

💰 Finances
   ├─ Devis
   ├─ Factures
   ├─ Avoirs
   ├─ Notes de frais ⭐ Session 2
   └─ Trésorerie ⭐ Session 2

🚀 Opérations
   ├─ Planning interventions
   ├─ Équipes
   ├─ Opérateurs
   └─ Rapports Praxedo

📦 Stock & Flotte
   ├─ Équipements
   ├─ Mouvements
   └─ Maintenance

✓ Conformité
   └─ Certifications

🏢 Site public
   └─ Retour site vitrine
```

---

## 1️⃣ GESTION QUOTIDIENNE CRM

### Créer un nouveau client

```
ÉTAPES :

1. Menu : CRM & Clients → Clients

2. Clic bouton [+ Nouveau Client] (haut droite)

3. Remplir formulaire :
   
   GROUPE :
   └─ Sélection dropdown : "ENGIE"
   
   INFORMATIONS LÉGALES :
   ├─ Raison sociale : "ENGIE Renouvelables"
   ├─ SIRET : "123 456 789 00012"
   └─ TVA Intracommunautaire : (optionnel)
   
   ADRESSE :
   ├─ Adresse : "123 Avenue..."
   ├─ Code postal : "75001"
   └─ Ville : "Paris"
   
   CONTACTS :
   ├─ Téléphone : "01 23 45 67 89"
   ├─ Email : "contact@engie.fr"
   ├─ Contact principal : "Jean Dupont"
   └─ Email facturation : "facturation@engie.fr"
   
   FACTURATION :
   ├─ Conditions paiement : "30 jours fin de mois"
   └─ Délai (jours) : 30

4. Clic [Enregistrer]

RÉSULTAT :
├─ Client créé → Numéro auto CLI-2026-XXXX
├─ Message confirmation "✅ Client créé"
└─ Redirection liste clients
```

### Créer un site pour ce client

```
ÉTAPES :

1. Menu : CRM & Clients → Sites

2. Clic [+ Nouveau Site]

3. Remplir formulaire :
   
   CLIENT :
   └─ Sélection : "ENGIE Renouvelables"
   
   IDENTITÉ :
   ├─ Nom site : "Site Lyon Gerland"
   ├─ Adresse : "123 Rue de Gerland"
   ├─ Code postal : "69007"
   └─ Ville : "Lyon"
   
   GPS (⚠️ OBLIGATOIRE) :
   ├─ Latitude : 45.7276
   └─ Longitude : 4.8320
   
   TECHNIQUE :
   ├─ Puissance (MWc) : 5
   └─ Surface panneaux (m²) : 1000
   
   CONTACT :
   ├─ Contact site : "Gardien Bâtiment B"
   ├─ Téléphone : (optionnel)
   └─ Instructions : "Clé au gardien"

4. Clic [Enregistrer]

RÉSULTAT :
├─ Site créé → SITE-2026-XXXX
├─ Lien hiérarchique : Groupe ENGIE → Client ENGIE Renouvelables → Site Lyon
└─ Visible immédiatement dans sélecteurs devis/interventions
```

### Rechercher un client/site

```
RECHERCHE RAPIDE :

1. Barre recherche en haut page

2. Taper début nom :
   └─ "ENGIE" → Affiche tous clients/sites ENGIE

3. Filtres disponibles :
   ├─ Par groupe
   ├─ Par ville
   └─ Statut actif/inactif

4. Tri colonnes :
   └─ Clic en-tête colonne (Nom, Ville, Date création...)
```

---

## 2️⃣ CRÉATION DEVIS & FACTURATION

### Créer un devis multi-sites

```
WORKFLOW COMPLET :

1. Menu : Finances → Devis

2. Clic [+ Nouveau Devis]

3. EN-TÊTE :
   ├─ Sélection Groupe : "ENGIE"
   ├─ Sélection Client : "ENGIE Renouvelables"
   ├─ Date : 02/01/2026 (pré-remplie)
   └─ Conditions : "30 jours fin de mois" (auto depuis client)

4. AJOUTER LIGNES :
   
   Pour chaque site à inclure :
   
   a) Clic [+ Ajouter ligne]
   
   b) Sélection Site : "Lyon Gerland" (dropdown)
      → Surface auto-remplie : 1000 m²
   
   c) Sélection Article : "Nettoyage panneaux PV"
   
   d) Quantité : 1000 (pré-remplie depuis surface)
   
   e) Prix unitaire HT : 0.50€/m²
      → Auto-récupéré selon tarification hiérarchique
      → Modifiable manuellement si besoin
   
   f) Calculs automatiques affichés :
      ├─ Montant HT : 500.00€
      ├─ TVA 20% : 100.00€
      └─ Montant TTC : 600.00€
   
   g) Clic [Ajouter]
   
   Répéter pour sites Paris (1500 m²) et Toulouse (800 m²)

5. VÉRIFICATION TOTAUX :
   └─ Affichés en temps réel bas écran :
       ├─ Total HT : 1730.00€
       ├─ Total TVA : 346.00€
       └─ Total TTC : 2076.00€

6. ENREGISTRER BROUILLON :
   └─ Clic [Enregistrer] → Statut "brouillon"
       Numéro généré : DEV-2026-0001

7. GÉNÉRATION PDF :
   
   a) Ouvrir devis : Clic sur DEV-2026-0001 dans liste
   
   b) Clic [Générer PDF]
   
   c) PDF téléchargé automatiquement contenant :
      ├─ Logo Solaire Nettoyage
      ├─ Informations entreprise
      ├─ Informations client
      ├─ Tableau 3 lignes (1 par site)
      ├─ Totaux
      └─ Mentions légales

8. ENVOI EMAIL CLIENT :
   
   a) Clic [Envoyer au client]
   
   b) Modal envoi :
      ├─ Destinataire : contact@engie.fr (pré-rempli)
      ├─ CC : facturation@engie.fr
      ├─ Objet : "Devis DEV-2026-0001..."
      ├─ Message : (personnalisable)
      └─ PJ : devis.pdf (automatique)
   
   c) Clic [Envoyer]
   
   d) Confirmation : "✅ Email envoyé"
   
   e) Statut passe : "envoyé"
      Historique enregistré avec date + destinataires

ASTUCE :
Si client refuse → Statut "refusé"
Si client accepte → Voir section suivante "Valider devis"
```

### Valider devis → Créer interventions ⭐ Session 2

```
APRÈS ACCEPTATION CLIENT :

1. Ouvrir devis : DEV-2026-0001

2. Clic [✓ Valider en commande]

3. Confirmation automatique :
   ├─ "Ce devis contient 3 sites"
   ├─ "Voulez-vous créer 3 interventions automatiquement ?"
   └─ [Oui] [Non]

4. Clic [Oui]

5. TRAITEMENT AUTOMATIQUE :
   └─ 3 interventions créées en 2 secondes :
       ├─ INT-2026-0001 | Lyon Gerland | 1000 m²
       ├─ INT-2026-0002 | Paris Bercy | 1500 m²
       └─ INT-2026-0003 | Toulouse Blagnac | 800 m²

6. REDIRECTION AUTO :
   └─ Page : Opérations → Interventions
       Filtre automatique sur devis validé
       Liste affiche les 3 interventions créées

7. PLANIFICATION :
   Pour chaque intervention :
   
   a) Clic sur INT-2026-0001
   
   b) Affecter équipe :
      └─ Sélection : "Équipe 1"
   
   c) Affecter opérateurs :
      ├─ ☑ Sébastien HENRY
      └─ ☑ Joffrey BELVÈZE
   
   d) Choisir date :
      └─ 15/01/2026
   
   e) Clic [Enregistrer]
   
   f) Statut passe : "planifiée"

8. VISIBILITÉ :
   └─ Interventions apparaissent :
       ├─ Calendrier planning (vue mois/semaine)
       ├─ Couleur Équipe 1
       └─ App mobile opérateurs (future)

NOTES :
- Corrections Session 2 garantissent :
  ✓ Numéros séquentiels corrects
  ✓ Surface totale correcte par site
  ✓ Nom site correct dans intervention
```

---

## 3️⃣ NOTES DE FRAIS ⭐ Session 2

### Créer une note de frais

```
POUR JEROME/AXEL :

1. Menu : Finances → Notes de frais

2. Clic [+ Nouvelle Note]

3. FORMULAIRE :
   
   OPÉRATEUR :
   └─ Sélection : "Jerome Gely" ou "Axel Gely"
   
   DATE & CATÉGORIE :
   ├─ Date : 02/01/2026
   └─ Catégorie : (dropdown)
       Options :
       ├─ Carburant
       ├─ Péage
       ├─ Repas
       ├─ Hébergement ← Exemple
       ├─ Fournitures
       ├─ Entretien
       └─ Autre
   
   MONTANTS :
   ├─ Montant TTC : 125.00€
   ├─ TVA : 10% (modifiable)
   ├─ Calcul auto affiché :
   │   ├─ Montant HT : 113.64€
   │   └─ Montant TVA : 11.36€
   └─ ☑ TVA récupérable
   
   DÉTAILS :
   ├─ Description : "1 nuit"
   └─ Fournisseur : "Hôtel Ibis"
   
   SI CATÉGORIE CARBURANT :
   ├─ Véhicule : "FOURGON" (dropdown)
   ├─ Immatriculation : (auto-rempli)
   └─ Km parcourus : 150
   
   JUSTIFICATIF :
   └─ [Upload fichier]
       ├─ Types : PNG, JPG, PDF
       ├─ Taille max : 10 MB
       └─ Stockage : Firebase Storage auto

4. Clic [Enregistrer]

RÉSULTAT :
├─ Note créée : NF-2026-001
├─ Statut : "brouillon" (badge gris)
└─ Visible liste notes avec justificatif uploadé
```

### Soumettre note pour validation ⭐ Session 2

```
SOUMISSION :

1. Liste notes de frais
   └─ Voir note NF-2026-001 | Badge "Brouillon"

2. Clic icône œil 👁️ → Page détail

3. PAGE DÉTAIL AFFICHE :
   ├─ Numéro : NF-2026-001
   ├─ Badge statut : "Brouillon" (gris)
   ├─ Toutes informations
   ├─ Justificatif téléchargeable
   └─ Bouton : [📤 Soumettre pour validation] (orange)

4. Clic [Soumettre pour validation]

5. Confirmation :
   └─ "Soumettre cette note de frais pour validation ?"
       [Annuler] [OK]

6. Clic [OK]

7. TRAITEMENT :
   ├─ Statut passe : "soumise"
   ├─ Date soumission enregistrée
   └─ Message : "✅ Note soumise pour validation"

8. REDIRECTION AUTO :
   └─ Retour liste notes de frais

9. VÉRIFICATION :
   └─ Note NF-2026-001 maintenant :
       ├─ Badge : "À valider" (orange)
       ├─ Checkbox visible ✓
       └─ Comptée dans KPI "À Valider"
```

### Valider notes en masse ⭐ Session 2

```
VALIDATION PAR JEROME/AXEL :

SCÉNARIO : 3 notes soumises à valider

1. Menu : Finances → Notes de frais

2. AFFICHAGE LISTE :
   KPIs en haut :
   ├─ À Valider : 3 (280.00€)
   ├─ À Rembourser : 0
   ├─ Total Mois : 3
   └─ Total : 280.00€
   
   Liste avec checkboxes :
   ├─ ☐ NF-2026-001 | Jerome | Hébergement | 125€ | Badge orange
   ├─ ☐ NF-2026-002 | Axel | Repas | 55€ | Badge orange
   └─ ☐ NF-2026-003 | Joffrey | Carburant | 100€ | Badge orange

3. SÉLECTION MULTIPLE :
   
   Option A : Tout sélectionner
   └─ Clic checkbox en-tête tableau ☑
       → Toutes notes "À valider" cochées
   
   Option B : Sélection individuelle
   └─ Clic checkbox de chaque ligne souhaitée

4. BARRE ACTIONS APPARAÎT :
   Barre bleue au-dessus tableau :
   ├─ "3 note(s) sélectionnée(s)"
   ├─ [Tout désélectionner]
   ├─ [✓ Valider la sélection] (vert)
   └─ [✗ Refuser la sélection] (rouge)

5. VALIDATION :
   
   a) Clic [✓ Valider la sélection]
   
   b) Modal confirmation :
      ┌─────────────────────────────────┐
      │ Valider 3 note(s)               │
      ├─────────────────────────────────┤
      │ NF-2026-001 - Jerome - 125.00€  │
      │ NF-2026-002 - Axel - 55.00€     │
      │ NF-2026-003 - Joffrey - 100.00€ │
      ├─────────────────────────────────┤
      │ Total : 280.00€                 │
      ├─────────────────────────────────┤
      │ Commentaire (optionnel) :       │
      │ [_________________________]     │
      ├─────────────────────────────────┤
      │       [Annuler] [Confirmer]     │
      └─────────────────────────────────┘
   
   c) Clic [Confirmer]
   
   d) Traitement batch Firebase :
      ├─ Transaction atomique
      ├─ Validation 3 notes simultanée
      └─ 2 secondes maximum

6. CONFIRMATION :
   ├─ Message : "✅ 3 note(s) validée(s) avec succès"
   ├─ Modal se ferme
   ├─ Sélections réinitialisées
   └─ Liste rechargée

7. RÉSULTAT :
   Notes maintenant :
   ├─ Badge : "Validée" (vert)
   ├─ Pas de checkbox
   └─ Actions disponibles : [👁️ Voir] [💰 Rembourser]
   
   KPIs mis à jour :
   ├─ À Valider : 0 (0.00€)
   ├─ À Rembourser : 3 (280.00€) ← Nouveau
   └─ Total Mois : 3 (280.00€)

NOTES :
- Validation masse = 1 clic pour 50 notes
- Économie : 50h/mois → 5h/mois
- ROI : 13 500€/an
```

### Refuser notes ⭐ Session 2

```
SI PROBLÈME DÉTECTÉ :

1. Sélection notes (même principe)

2. Clic [✗ Refuser la sélection]

3. Modal différent :
   ┌─────────────────────────────────┐
   │ Refuser 2 note(s)               │
   ├─────────────────────────────────┤
   │ NF-2026-001 - Jerome - 125.00€  │
   │ NF-2026-002 - Axel - 55.00€     │
   ├─────────────────────────────────┤
   │ Motif refus (OBLIGATOIRE) :     │
   │ [Justificatif manquant ou      ]│
   │ [illisible - Merci de          ]│
   │ [resoumettre                   ]│
   ├─────────────────────────────────┤
   │       [Annuler] [Confirmer]     │
   └─────────────────────────────────┘

4. Saisie motif obligatoire

5. Clic [Confirmer]

6. RÉSULTAT :
   ├─ Notes badge : "Refusée" (rouge)
   ├─ Motif visible opérateur
   └─ Opérateur peut corriger et resoumettre
```

---

## 4️⃣ TRÉSORERIE & PRÉVISIONNEL ⭐ Session 2

### Consulter tableau de bord trésorerie

```
DASHBOARD PRINCIPAL :

1. Menu : Finances → Trésorerie

2. ONGLET : Dashboard

3. AFFICHAGE 4 KPIs :
   
   ┌──────────────────┐
   │ Solde Total      │
   │ 75 000€          │
   │ (vert si > 0)    │
   └──────────────────┘
   
   ┌──────────────────┐
   │ À Rapprocher     │
   │ 15 lignes        │
   │ 12 500€          │
   └──────────────────┘
   
   ┌──────────────────┐
   │ Encaissements    │
   │ Ce mois          │
   │ 45 000€          │
   └──────────────────┘
   
   ┌──────────────────┐
   │ Décaissements    │
   │ Ce mois          │
   │ 23 000€          │
   └──────────────────┘

4. GRAPHIQUE ÉVOLUTION 30J :
   └─ Courbe bleue solde quotidien
       Visualisation tendance

5. LISTE TRANSACTIONS :
   └─ Dernières opérations
       Actions rapides disponibles
```

### Consulter prévisionnel 90 jours ⭐ Session 2

```
NOUVEAU MODULE SESSION 2 :

1. Menu : Finances → Trésorerie

2. ONGLET : Prévisionnel 90j

3. CHARGEMENT AUTOMATIQUE :
   └─ Calcul backend en 2-3 secondes
       ├─ Analyse factures clients en attente
       ├─ Analyse factures fournisseurs
       └─ Projection jour par jour

4. AFFICHAGE 4 KPIs :
   
   ┌──────────────────┐
   │ Solde Actuel     │
   │ 75 000€          │
   │ Aujourd'hui      │
   └──────────────────┘
   
   ┌──────────────────┐
   │ Solde J+30       │
   │ 95 000€          │
   │ 02/02/2026       │
   │ (vert)           │
   └──────────────────┘
   
   ┌──────────────────┐
   │ Solde J+60       │
   │ 135 000€         │
   │ 04/03/2026       │
   │ (vert)           │
   └──────────────────┘
   
   ┌──────────────────┐
   │ Solde J+90       │
   │ 186 000€         │
   │ 03/04/2026       │
   │ (vert)           │
   └──────────────────┘

5. GRAPHIQUE ÉVOLUTION :
   └─ Courbe bleue : Solde prévisionnel
       ├─ Axe X : Dates (J+1 à J+90)
       ├─ Axe Y : Montants €
       ├─ Ligne rouge pointillée : Seuil 0€
       └─ Tooltip : Détails au survol

6. LÉGENDE :
   ├─ 📊 Solde prévisionnel
   ├─ 💰 Encaissements attendus : 156 000€
   └─ 💸 Décaissements prévus : 45 000€

7. FILTRES PÉRIODE :
   └─ Boutons : [30 jours] [60 jours] [90 jours]
       Clic → Recharge graphique période

8. ALERTES (si détectées) :
   ┌────────────────────────────────────┐
   │ ⚠️ ALERTES TRÉSORERIE              │
   ├────────────────────────────────────┤
   │ • Point bas : 85 000€ le 25/01     │
   │ • Aucune tension critique détectée │
   └────────────────────────────────────┘

UTILISATION :
├─ Anticiper tensions
├─ Planifier investissements
├─ Optimiser placements
└─ Éviter découverts

ROI : 1 500€/an (éviter frais + optimisation)
```

---

## 5️⃣ PLANNING & INTERVENTIONS

### Consulter planning mensuel

```
VUE CALENDRIER :

1. Menu : Opérations → Planning interventions

2. SÉLECTION VUE :
   └─ Boutons : [Mois] [Semaine] [Jour]

3. VUE MOIS AFFICHE :
   └─ Calendrier avec interventions :
       ├─ Couleur par équipe
       ├─ Nom site visible
       └─ Clic case → Détails

4. FILTRES DISPONIBLES :
   ├─ Par équipe
   ├─ Par opérateur
   ├─ Par statut
   └─ Par client

5. ACTIONS RAPIDES :
   ├─ Drag & drop pour déplacer
   ├─ Clic intervention → Modal détails
   └─ Double-clic → Édition complète
```

### Gérer une intervention

```
SUIVI COMPLET :

1. Ouvrir intervention : INT-2026-0001

2. INFORMATIONS VISIBLES :
   SITE :
   ├─ Nom : Lyon Gerland
   ├─ Client : ENGIE Renouvelables
   ├─ Groupe : ENGIE
   ├─ Surface : 1000 m²
   └─ GPS : 45.7276, 4.8320
   
   PLANNING :
   ├─ Date prévue : 15/01/2026
   ├─ Équipe : Équipe 1
   ├─ Opérateurs : Sébastien, Joffrey
   └─ Statut : Planifiée
   
   ORIGINE :
   ├─ Devis : DEV-2026-0001
   └─ Facturation : Non facturée

3. RAPPORT PRAXEDO :
   SI rapport reçu et associé :
   ├─ Badge vert : "Rapport disponible"
   ├─ Clic [Voir rapport]
   └─ Ouverture PDF nouvel onglet

4. ACTIONS DISPONIBLES :
   ├─ [Modifier] → Édition détails
   ├─ [Clôturer] → Marquer terminée
   ├─ [Annuler] → Annulation avec motif
   └─ [Dupliquer] → Copie nouvelle intervention
```

---

## 6️⃣ STOCK & FLOTTE

### Consulter stock équipements

```
DASHBOARD STOCK :

1. Menu : Stock & Flotte → Équipements

2. LISTE ÉQUIPEMENTS :
   Tableau avec colonnes :
   ├─ Référence (NM04, BROSSE-001...)
   ├─ Désignation
   ├─ Type (Matériel mobile, Consommable...)
   ├─ Stock actuel
   ├─ Seuil alerte
   ├─ Badge statut :
   │   ├─ Vert : Stock OK
   │   ├─ Orange : Stock bas
   │   └─ Rouge : Rupture
   └─ Actions

3. ALERTES STOCK BAS :
   └─ Encart haut page si alertes :
       "⚠️ 2 équipements en stock bas"

4. ACTIONS RAPIDES :
   ├─ [Ajouter stock] → Mouvement entrée
   ├─ [Retirer stock] → Mouvement sortie
   └─ [Voir historique] → Tous mouvements
```

### Consulter historique mouvements

```
TRAÇABILITÉ COMPLÈTE :

1. Clic équipement : NM04

2. Onglet : Historique

3. LISTE MOUVEMENTS :
   Tableau chronologique :
   ├─ Date
   ├─ Type (Entrée/Sortie/Transfert/Inventaire)
   ├─ Quantité (+/-)
   ├─ Origine/Destination
   ├─ Intervention liée (si applicable)
   ├─ Opérateur
   └─ Motif

4. FILTRES :
   ├─ Par période
   ├─ Par type
   └─ Par intervention

5. EXPORT :
   └─ [Export Excel] → Téléchargement fichier
```

---

## 7️⃣ RAPPORTS PRAXEDO

### Vérifier synchronisation automatique

```
SUIVI AUTO :

1. Menu : Opérations → Rapports Praxedo

2. LISTE RAPPORTS :
   └─ Tous rapports reçus par email
       ├─ Date réception
       ├─ Nom site détecté
       ├─ Intervention associée (si match)
       ├─ Score matching (%)
       └─ Statut : Associé / Nouveau / Manuel

3. RAPPORTS NON ASSOCIÉS :
   Si badge "Nouveau" :
   ├─ Pas de match automatique trouvé
   └─ Action manuelle requise :
       a) Clic [Associer manuellement]
       b) Sélection intervention dropdown
       c) [Confirmer]

4. VÉRIFICATION QUOTIDIENNE :
   └─ Email automatique si rapports non associés
       "⚠️ X rapport(s) Praxedo nécessitent attention"
```

---

## 🆘 PROBLÈMES FRÉQUENTS & SOLUTIONS

### "Mes checkboxes notes de frais n'apparaissent pas"

```
CAUSE : Notes en statut "brouillon"

SOLUTION :
1. Ouvrir détail note (icône œil 👁️)
2. Clic [📤 Soumettre pour validation]
3. Statut passe "soumise"
4. Checkbox apparaît ✓
```

### "Interventions créées avec surface = 0"

```
CAUSE : Bug corrigé Session 2

SI ENCORE PRÉSENT :
└─ Contacter développeur
    Bug normalement résolu
```

### "Email devis/facture non reçu"

```
VÉRIFICATIONS :
1. Email destinataire correct ?
2. Vérifier dossier spam client
3. Historique envois :
   └─ Voir détail devis/facture
       Section "Historique" affiche :
       ├─ Date envoi
       ├─ Destinataires
       └─ Statut envoi

SI PROBLÈME SMTP :
└─ Vérifier variables environnement serveur
    SMTP_USER / SMTP_PASS
```

### "PDF devis/facture sans logo"

```
CAUSE : Logo manquant base64

SOLUTION :
└─ Régénérer PDF
    Logo devrait apparaître
    Si persistent → Vérifier fichier logo.png
```

---

## 📱 RACCOURCIS CLAVIER (À IMPLÉMENTER)

```
NAVIGATION :
Ctrl + K : Recherche rapide
Ctrl + N : Nouveau (selon page)
Ctrl + S : Enregistrer
Échap : Fermer modal

ÉDITION :
Ctrl + Z : Annuler
Ctrl + Y : Refaire
Ctrl + C/V : Copier/Coller
```

---

## 📞 SUPPORT

```
BESOIN D'AIDE :

Email : support@solairenettoyage.fr
Téléphone : (à définir)
Documentation : /aide (future section)

SIGNALER BUG :
└─ Bouton feedback bas droite toutes pages
    ou Email avec captures écran
```

---

**Date guide :** 2 Janvier 2026, 15h40  
**Version :** v1.2 (Session 2)  
**Prochaine mise à jour :** Après Session 3 (OCR tickets)
