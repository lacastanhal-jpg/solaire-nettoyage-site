# 📅 PLAN DÉVELOPPEMENT PAR VAGUES & SESSIONS

**Date :** 2 Janvier 2026, 15h40  
**Méthode :** Progressive & Itérative  
**Principe :** 1 session = 1 fonctionnalité complète testée

---

## 🎯 MÉTHODOLOGIE

### Approche par sessions
```
CHAQUE SESSION :
├─ Développement fonctionnalité complète
├─ Tests immédiats
├─ Corrections bugs
├─ Validation Jerome
├─ Documentation mise à jour
└─ Mise en production

→ Qualité maximale
→ Validation continue
→ Bénéfices immédiats
→ Pas de dette technique
```

### Organisation par vagues
```
VAGUE = Ensemble cohérent de modules
Chaque vague = Objectif business clair
Chaque vague = ROI mesurable
```

---

## 🔥 VAGUE 1 - MODULES CRITIQUES & ÉCONOMIES

**Objectif :** Automatisation maximum + Remplacement logiciels externes  
**ROI visé :** 82 000€/an  
**Statut actuel :** 58% terminé

### ✅ Sessions terminées (Vague 1)

#### Session 0 - Fondations (Avant suivi)
**Contenu :**
- Infrastructure Next.js + Firebase
- Collections Firebase (16)
- Navigation & authentification basique
- Composants UI de base

**Livrables :**
- ✅ Architecture complète
- ✅ 16 collections Firestore
- ✅ Déploiement Vercel + IONOS

---

#### Session 1 - Modules Opérationnels (29 Décembre 2025)
**Contenu :**
- CRM hiérarchique (Groupes/Clients/Sites)
- Tarification 4 niveaux
- Devis/Factures/Avoirs complets
- Planning interventions
- Rapports Praxedo sync auto
- Stock & Flotte basique

**Livrables :**
- ✅ 600 clients gérés
- ✅ 3600 sites avec GPS
- ✅ Génération PDF professionnelle
- ✅ Envoi emails SMTP IONOS
- ✅ Workflow production opérationnel

**ROI Session 1 :** Base solide pour suite projet

---

#### Session 2 - Corrections & Automatisations (2 Janvier 2026, 5h)
**Contenu :**
1. **Workflow Devis→Intervention** (Corrections 3 bugs)
   - ✅ Bug numéros identiques corrigé
   - ✅ Bug surface = 0 corrigé
   - ✅ Bug mauvais nom site corrigé
   - ✅ Tests complets validés

2. **Trésorerie Prévisionnel 90j** (Développement complet)
   - ✅ Backend tresorerie-previsionnel.ts (420 lignes)
   - ✅ Calcul encaissements prévisionnels
   - ✅ Calcul décaissements prévisionnels
   - ✅ Solde jour par jour
   - ✅ Alertes automatiques
   - ✅ Interface GraphiquePrevisionnel.tsx (340 lignes)
   - ✅ 4 KPIs + Graphique + Filtres
   - ✅ Installation onglet dashboard

3. **Notes de Frais - Validation Masse** (Développement complet)
   - ✅ Backend notes-frais-validation-masse.ts (230 lignes)
   - ✅ Fonction validerNotesEnMasse() transaction atomique
   - ✅ Fonction refuserNotesEnMasse()
   - ✅ Fonction rembourserNotesEnMasse()
   - ✅ Interface checkboxes sélection multiple
   - ✅ Barre actions avec compteur
   - ✅ Modal confirmation détaillée
   - ✅ Tests validation masse réels

4. **Notes de Frais - Bouton Soumettre** (Développement)
   - ✅ Fonction soumettreNoteDeFrais() backend
   - ✅ Bouton orange page détail
   - ✅ Redirection automatique
   - ✅ Workflow complet testé

**Livrables Session 2 :**
- 3 fichiers backend (420 + 230 + fonctions lignes)
- 3 fichiers frontend (340 + 696 + 417 lignes)
- 15 fichiers documentation
- Tests validés tous modules

**ROI Session 2 :** 27 500€/an
- Workflow Devis→Intervention : 12 500€/an
- Trésorerie prévisionnel : 1 500€/an
- Validation masse notes : 13 500€/an

**Avancement Vague 1 après Session 2 :** 58%

---

### 🔄 Sessions planifiées (Vague 1)

#### Session 3 - Notes de Frais : OCR Photo Ticket
**Objectif :** Détection automatique montant/date/fournisseur

**Contenu :**
- Intégration Google Vision API
- Upload photo → Analyse automatique
- Extraction données structurées
- Pré-remplissage formulaire
- Badge confiance détection
- Fallback saisie manuelle

**Livrables attendus :**
- Backend OCR avec Google Vision
- Interface upload photo
- Parsing intelligent tickets
- Tests tickets réels multiples formats

**ROI Session 3 :** 1 650€/an (5.5h/mois économisées)

---

#### Session 4 - Notes de Frais : Export & Dashboard
**Objectif :** Export comptable + Synthèse opérateurs

**Contenu :**
- Export Excel mensuel par opérateur
- Format compatible comptable
- Dashboard graphiques notes de frais
- Camembert par catégorie
- Courbe évolution mensuelle
- Tableau synthèse par opérateur
- Intégration trésorerie (décaissements prévisionnels)

**Livrables attendus :**
- Fonction export Excel
- Dashboard visualisations
- Lien trésorerie opérationnel

**ROI Session 4 :** 600€/an + Visibilité

---

#### Session 5 - Facturation Groupée
**Objectif :** Facturation mensuelle automatisée

**Contenu :**
- Interface facturation groupée
- Filtres : période/groupe/client/statut
- Sélection multiple interventions
- Options : 1 facture par site OU 1 facture globale
- Génération automatique factures
- Update interventions → facturée
- Envoi emails automatiques
- Rapport facturation mensuel

**Livrables attendus :**
- Interface complète
- Algorithme groupement intelligent
- Tests facturation réelle

**ROI Session 5 :** 5 400€/an (9h/mois économisées)

---

#### Session 6 - Relances Automatiques Impayés
**Objectif :** Zéro intervention manuelle relances

**Contenu :**
- CRON quotidien scan factures
- Calcul retard par facture
- 4 niveaux relances :
  - J+15 : Email courtois
  - J+30 : Email ferme + CC Jerome
  - J+45 : Email dernier + Alerte urgente
  - J+60 : Blocage client + Notification
- Templates emails professionnels
- Dashboard relances
- Historique toutes relances
- Actions manuelles disponibles

**Livrables attendus :**
- Backend CRON
- 4 templates emails
- Dashboard suivi
- Tests scénarios complets

**ROI Session 6 :** 30 000€/an (récupération impayés)

---

#### Session 7 - Stock : Automatisation Complète
**Objectif :** Zéro saisie manuelle stock

**Contenu :**
- Finalisation déduction automatique post-intervention
- Scan QR codes équipements
- Génération QR codes équipements
- Alertes stock bas automatiques
- Email automatique réapprovisionnement
- Dashboard temps réel synchronisé
- Historique mouvements filtrable

**Livrables attendus :**
- Système QR codes complet
- Déduction automatique validée
- Tests interventions réelles

**ROI Session 7 :** Fiabilité stock + Prévention ruptures

---

#### Session 8-12 - App Mobile Opérateurs PWA
**Objectif :** Remplacer Praxedo (300€/mois)

**Session 8 : Infrastructure PWA**
- Configuration Progressive Web App
- Mode hors-ligne (Service Worker)
- Installation device
- Authentification opérateurs
- Dashboard interventions du jour

**Session 9 : Workflow Terrain - Démarrage**
- Arrivée site → GPS automatique
- Upload photos AVANT (minimum 3)
- Validation photos avant suite
- Chronomètre intervention

**Session 10 : Workflow Terrain - Travaux**
- Scan QR codes articles
- Saisie quantités
- Liste articles utilisés
- Validation stock suffisant

**Session 11 : Workflow Terrain - Clôture**
- Upload photos APRÈS (minimum 3)
- Commentaires
- Signatures tactiles (client + opérateur)
- GPS fin automatique

**Session 12 : Automatisations Post-Clôture**
- Calcul durée automatique
- Déduction stock automatique
- Génération PDF rapport automatique
- Envoi email client automatique
- Update statut intervention
- Tests complets terrain

**Livrables attendus :**
- PWA installable
- Mode hors-ligne fonctionnel
- Workflow complet opérationnel
- Tests terrain avec équipes

**ROI Sessions 8-12 :** 3 600€/an + Qualité données

---

## ⏰ VAGUE 2 - GESTION & CONFORMITÉ

**Objectif :** Conformité légale + Pilotage entreprise  
**ROI visé :** 15 000€/an  
**Statut actuel :** 0% (non démarré)

### Sessions planifiées (Vague 2)

#### Session 13 - Dématérialisation Factures
**Objectif :** Conformité 2026 clients >5000 salariés

**Contenu :**
- Intégration API Pennylane ou Tiime
- Routage automatique portails clients
- Chorus Pro pour secteur public
- Portail ENGIE, EDF, TotalEnergies
- Retour statuts temps réel
- Webhook notifications
- Archivage 10 ans conforme

**Livrables attendus :**
- API intégrée
- Routage automatique
- Tests dépôts réels

**ROI Session 13 :** Obligatoire légal

---

#### Session 14 - Dashboard Dirigeant
**Objectif :** Vision 360° entreprise

**Contenu :**
- KPIs principaux :
  - CA mensuel/annuel
  - Marge brute %
  - Trésorerie actuelle
  - Factures impayées
  - DSO moyen
- Graphiques :
  - Évolution CA 12 mois
  - Répartition CA par groupe
  - Top 10 clients
  - Évolution marge
- Tableau de bord personnalisable
- Export PDF mensuel

**Livrables attendus :**
- Dashboard complet
- Graphiques interactifs
- Export automatique

**ROI Session 14 :** Pilotage efficace

---

#### Session 15 - Analyse Rentabilité
**Objectif :** Rentabilité par client/site/intervention

**Contenu :**
- Calcul coûts réels intervention :
  - Main d'œuvre (heures × taux horaire)
  - Carburant (distance × tarif)
  - Matériel (amortissement)
  - Consommables utilisés
- Calcul marge par intervention
- Analyse rentabilité client
- Analyse rentabilité site
- Recommandations prix
- Alertes interventions non rentables

**Livrables attendus :**
- Algorithme calcul coûts
- Dashboard rentabilité
- Tests analyses

**ROI Session 15 :** Négociations prix optimisées

---

#### Session 16 - Contrats Récurrents
**Objectif :** Automatisation contrats annuels

**Contenu :**
- Module contrats :
  - Client + Sites inclus
  - Montant annuel
  - Fréquence (mensuel/trimestriel)
  - Reconduction tacite
- Génération devis automatique
- Génération factures automatiques
- Suivi consommation contrat
- Alertes 90% consommé
- Alertes renouvellement

**Livrables attendus :**
- Module contrats complet
- Automatisations factures
- Tests contrats ENGIE

**ROI Session 16 :** Régularité CA

---

#### Session 17 - Alertes Intelligentes
**Objectif :** Prévention proactive problèmes

**Contenu :**
- Système alertes :
  - Stock bas
  - Certifications expirées J-30/J-7
  - Factures impayées J+15/30/45
  - Tension trésorerie
  - Maintenance équipement due
  - Contrat à renouveler
- Notifications :
  - Email
  - SMS (Twilio)
  - Push notification (future)
- Dashboard centralisation alertes
- Historique alertes
- Actions rapides depuis alertes

**Livrables attendus :**
- Système alertes complet
- Notifications multi-canal
- Tests tous scénarios

**ROI Session 17 :** Prévention + Réactivité

---

#### Session 18 - Maintenance Préventive
**Objectif :** Zéro panne équipement

**Contenu :**
- Planning maintenance par équipement
- Fréquence maintenance selon type
- Alertes maintenance due
- Historique interventions maintenance
- Coûts maintenance
- Suivi garanties
- Planification automatique interventions

**Livrables attendus :**
- Module maintenance
- Planning automatique
- Tests NM04/NM05

**ROI Session 18 :** Durée vie équipements

---

#### Session 19 - Certifications : Module Complet
**Objectif :** Conformité 100% sites SEVESO

**Contenu :**
- CRUD certifications ergonomique
- Upload documents PDF
- Alertes expiration J-30/J-7
- Email/SMS automatiques
- Dashboard conformité
- Export état conformité PDF
- Historique renouvellements
- Blocage opérateur si certification expirée

**Livrables attendus :**
- Interface complète
- Alertes automatiques
- Blocages sécurité

**ROI Session 19 :** Conformité garantie

---

## 💡 VAGUE 3 - OPTIMISATION & HOLDING

**Objectif :** Gestion groupe GELY + Optimisations avancées  
**ROI visé :** Variable  
**Statut actuel :** 0% (non démarré)

### Sessions planifiées (Vague 3)

#### Session 20-23 - Multi-Sociétés GELY

**Session 20 : Architecture Multi-Sociétés**
- Structure données multi-sociétés
- Sélecteur société global
- Isolation données par société
- Utilisateurs multi-sociétés

**Session 21 : Consolidation Financière**
- Agrégation CA toutes sociétés
- Consolidation trésorerie
- Flux inter-sociétés
- Reporting consolidé

**Session 22 : Gestion Photovoltaïque**
- Module projets PV
- Prévisionnel 20 ans
- Suivi production
- Suivi revenus

**Session 23 : Tests & Validation**
- Tests toutes sociétés
- Migration données
- Formation Jerome
- Documentation complète

**Livrables attendus :**
- 5 sociétés gérées
- Consolidation automatique
- Prévisionnel PV 20 ans

**ROI Sessions 20-23 :** Gestion groupe simplifiée

---

#### Session 24 - Planification Zones Géographiques
**Objectif :** Optimisation tournées

**Contenu :**
- Clustering sites par zone
- Optimisation trajets
- Calcul distances
- Estimation carburant
- Proposition planning optimisé

**Livrables attendus :**
- Algorithme optimisation
- Interface planification
- Tests tournées réelles

**ROI Session 24 :** Économie carburant

---

#### Session 25 - Export Comptable FEC
**Objectif :** Conformité export comptable

**Contenu :**
- Format FEC légal
- Export journaux achats/ventes
- Export grand livre
- TVA collectée/déductible
- Validation format
- Tests Compta

**Livrables attendus :**
- Export FEC conforme
- Validation comptable
- Documentation

**ROI Session 25 :** Conformité légale

---

#### Session 26 - Certifications Qualité
**Objectif :** Valorisation commerciale

**Contenu :**
- ISO 9001 documentation
- Audit qualité
- Non-conformités
- Actions correctives
- Tableau de bord qualité

**Livrables attendus :**
- Module qualité
- Documentation ISO
- Suivi audits

**ROI Session 26 :** Nouveaux contrats

---

#### Session 27 - Sous-Traitance
**Objectif :** Gestion sous-traitants (si applicable)

**Contenu :**
- Annuaire sous-traitants
- Affectation interventions
- Suivi facturation
- Évaluation prestations
- Conformité documents

**Livrables attendus :**
- Module sous-traitance
- Workflow complet
- Tests réels

**ROI Session 27 :** Flexibilité capacité

---

#### Session 28 - Réclamations Client
**Objectif :** Suivi qualité

**Contenu :**
- Tickets réclamation
- Photos problème
- Intervention corrective
- Avoir si nécessaire
- Statistiques réclamations
- Actions préventives

**Livrables attendus :**
- Module réclamations
- Workflow SAV
- Dashboard qualité

**ROI Session 28 :** Satisfaction client

---

#### Session 29 - Météo Planning
**Objectif :** Optimisation météo

**Contenu :**
- API météo
- Prévisions 7 jours
- Alertes pluie/vent
- Suggestions report
- Historique météo

**Livrables attendus :**
- Intégration API météo
- Alertes automatiques
- Tests réels

**ROI Session 29 :** Optimisation interventions

---

## 📊 RÉCAPITULATIF GLOBAL

### Avancement par vague

**VAGUE 1 - Critique & Économies**
```
Sessions terminées : 2 / 12
Avancement : 58%
ROI actuel : 27 500€/an
ROI projeté : 82 250€/an
```

**VAGUE 2 - Gestion & Conformité**
```
Sessions terminées : 0 / 7
Avancement : 0%
ROI projeté : 15 000€/an
```

**VAGUE 3 - Optimisation & Holding**
```
Sessions terminées : 0 / 10
Avancement : 0%
ROI projeté : Variable
```

### Calendrier estimé

**2 sessions/semaine** (10h total/semaine)

**VAGUE 1 :** 10 sessions restantes = 5 semaines = **Fin Février 2026**

**VAGUE 2 :** 7 sessions = 3.5 semaines = **Mi-Mars 2026**

**VAGUE 3 :** 10 sessions = 5 semaines = **Mi-Avril 2026**

**→ FIN PROJET COMPLET : Mi-Avril 2026**

---

## 🎯 PROCHAINE SESSION

**Session 3 - Notes de Frais : OCR Photo Ticket**

Prêt à démarrer dès validation Jerome.

---

**Date plan :** 2 Janvier 2026, 15h40  
**Version :** v1.0 (Session 2)
