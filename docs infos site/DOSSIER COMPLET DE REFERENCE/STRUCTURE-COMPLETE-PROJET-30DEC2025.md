# STRUCTURE COMPLÈTE DU PROJET - ÉTAT FINAL
## Solaire Nettoyage - Système Complet Multi-Sociétés

**Date** : 30 décembre 2025  
**Dernière mise à jour** : Phase 3 Jour 2 - Module Maintenance Avancée terminé

**🎉 MISE À JOUR 30 DÉCEMBRE 2025 - PHASE 3 JOUR 2 TERMINÉ**
```
✅ Vérification Stock Temps Réel avec alertes visuelles
✅ Modal Bon de Commande automatique
✅ Page Liste Bons de Commande + Envoi Email
✅ Finalisation Intervention → Stock déduit automatiquement  
✅ Annulation Finalisation → Stock restauré
✅ Suppression Intervention → Stock géré
✅ Synchronisation stock automatique complète

Code créé aujourd'hui : ~2,860 lignes
Total Phase 3 : ~6,360 lignes
```

---

**Légende** :
**Légende** :
- ✅ **EXISTE DÉJÀ** (ne pas toucher)
- 🔧 **À MODIFIER LÉGÈREMENT** (ajouter 1-2 champs)
- 🆕 **À CRÉER** (nouveau)

---

## 📁 ARBORESCENCE COMPLÈTE

```
solaire-nettoyage/
│
├── app/
│   ├── page.tsx                           ✅ Page accueil public
│   ├── layout.tsx                         ✅ Layout principal
│   │
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts               ✅ API tRPC
│   │
│   ├── portail/                           ✅ ESPACE PORTAIL CLIENT
│   │   ├── layout.tsx                     ✅ Layout portail
│   │   ├── page.tsx                       ✅ Dashboard client
│   │   ├── mes-sites/
│   │   │   ├── page.tsx                   ✅ Liste sites client
│   │   │   └── [id]/
│   │   │       └── page.tsx               ✅ Détail site
│   │   ├── mes-factures/
│   │   │   ├── page.tsx                   ✅ Liste factures
│   │   │   └── [id]/
│   │   │       └── page.tsx               ✅ Détail facture
│   │   ├── mes-interventions/
│   │   │   ├── page.tsx                   ✅ Liste interventions
│   │   │   └── [id]/
│   │   │       └── page.tsx               ✅ Détail intervention
│   │   └── mes-documents/
│   │       └── page.tsx                   ✅ Documents client
│   │
│   └── admin/                             ✅ ESPACE ADMIN
│       ├── layout.tsx                     🔧 À modifier (navigation)
│       ├── page.tsx                       🔧 À modifier (dashboard accueil)
│       │
│       ├── dashboard-groupe/              🆕 NOUVEAU - Dashboard Patrimoine
│       │   └── page.tsx                   🆕 Vue consolidée groupe
│       │
│       ├── documents/                     🆕 NOUVEAU - GED (PRIORITÉ 0)
│       │   ├── page.tsx                   🆕 Vue d'ensemble documents
│       │   ├── par-client/
│       │   │   └── [clientId]/
│       │   │       └── page.tsx           🆕 Documents client
│       │   ├── par-site/
│       │   │   └── [siteId]/
│       │   │       └── page.tsx           🆕 Documents site
│       │   ├── par-equipement/
│       │   │   └── [equipementId]/
│       │   │       └── page.tsx           🆕 Documents véhicule
│       │   └── par-employe/
│       │       └── [employeId]/
│       │           └── page.tsx           🆕 Documents employé
│       │
│       ├── analyses/                      🆕 NOUVEAU - BI/Rentabilité (PRIORITÉ 1)
│       │   ├── page.tsx                   🆕 Dashboard analyses
│       │   ├── rentabilite-clients/
│       │   │   └── page.tsx               🆕 Analyses clients
│       │   ├── rentabilite-sites/
│       │   │   └── page.tsx               🆕 Analyses sites
│       │   ├── performance-flotte/
│       │   │   └── page.tsx               🆕 Analyses véhicules
│       │   ├── performance-equipes/
│       │   │   └── page.tsx               🆕 Analyses employés
│       │   └── previsions/
│       │       └── page.tsx               🆕 Prévisions CA/Trésorerie
│       │
│       ├── crm/                           ✅ MODULE CRM COMPLET
│       │   ├── page.tsx                   ✅ Dashboard CRM
│       │   │
│       │   ├── groupes/
│       │   │   ├── page.tsx               ✅ Liste groupes
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           ✅ Créer groupe
│       │   │   └── [id]/
│       │   │       ├── page.tsx           ✅ Détail groupe
│       │   │       └── modifier/
│       │   │           └── page.tsx       ✅ Modifier groupe
│       │   │
│       │   ├── clients/
│       │   │   ├── page.tsx               ✅ Liste clients
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           ✅ Créer client
│       │   │   └── [id]/
│       │   │       ├── page.tsx           ✅ Détail client
│       │   │       └── modifier/
│       │   │           └── page.tsx       ✅ Modifier client
│       │   │
│       │   ├── sites/
│       │   │   ├── page.tsx               ✅ Liste sites
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           ✅ Créer site
│       │   │   ├── import/
│       │   │   │   └── page.tsx           ✅ Import Excel sites
│       │   │   └── [id]/
│       │   │       ├── page.tsx           ✅ Détail site
│       │   │       └── modifier/
│       │   │           └── page.tsx       ✅ Modifier site
│       │   │
│       │   └── contrats/                  🆕 NOUVEAU - Contrats récurrents (PRIORITÉ 1)
│       │       ├── page.tsx               🆕 Liste contrats
│       │       ├── nouveau/
│       │       │   └── page.tsx           🆕 Créer contrat
│       │       └── [id]/
│       │           ├── page.tsx           🆕 Détail contrat + facturation
│       │           ├── modifier/
│       │           │   └── page.tsx       🆕 Modifier contrat
│       │           └── renouvellement/
│       │               └── page.tsx       🆕 Renouveler contrat
│       │
│       ├── finances/                      🔧 MODULE FINANCES (à étendre)
│       │   ├── page.tsx                   🔧 Dashboard finances (à enrichir)
│       │   │
│       │   ├── devis/
│       │   │   ├── page.tsx               🔧 Liste devis (+ select société)
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           🔧 Créer devis (+ select société)
│       │   │   └── [id]/
│       │   │       ├── page.tsx           🔧 Détail devis (+ société)
│       │   │       └── modifier/
│       │   │           └── page.tsx       🔧 Modifier devis (+ société)
│       │   │
│       │   ├── factures/
│       │   │   ├── page.tsx               🔧 Liste factures (+ filtre société + TVA)
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           🔧 Créer facture (+ société + TVA détaillée)
│       │   │   └── [id]/
│       │   │       ├── page.tsx           🔧 Détail facture (+ TVA détaillée)
│       │   │       └── modifier/
│       │   │           └── page.tsx       🔧 Modifier facture (+ société)
│       │   │
│       │   ├── avoirs/
│       │   │   ├── page.tsx               🔧 Liste avoirs (+ filtre société + TVA)
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           🔧 Créer avoir (+ société + TVA)
│       │   │   └── [id]/
│       │   │       ├── page.tsx           🔧 Détail avoir (+ TVA)
│       │   │       └── modifier/
│       │   │           └── page.tsx       🔧 Modifier avoir
│       │   │
│       │   ├── tresorerie/                🆕 NOUVEAU MODULE
│       │   │   ├── page.tsx               🆕 Vue d'ensemble trésorerie
│       │   │   ├── comptes/               🆕 Gestion comptes bancaires
│       │   │   │   ├── page.tsx           🆕 Liste comptes
│       │   │   │   └── nouveau/
│       │   │   │       └── page.tsx       🆕 Créer compte
│       │   │   ├── import-releve/         🆕 Import relevés bancaires
│       │   │   │   └── page.tsx           🆕 Import CSV
│       │   │   ├── rapprochement/         🆕 Rapprochement bancaire
│       │   │   │   └── page.tsx           🆕 Interface rapprochement
│       │   │   └── previsionnel/          🆕 Prévisionnel trésorerie
│       │   │       └── page.tsx           🆕 Prévisions 90j
│       │   │
│       │   ├── notes-frais/               🆕 NOUVEAU MODULE (refaire complet)
│       │   │   ├── page.tsx               🆕 Liste notes frais + stats
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           🆕 Créer note frais (niveau Expensya)
│       │   │   └── [id]/
│       │   │       ├── page.tsx           🆕 Détail + workflow validation
│       │   │       └── modifier/
│       │   │           └── page.tsx       🆕 Modifier note frais
│       │   │
│       │   ├── fournisseurs/              🆕 NOUVEAU MODULE
│       │   │   ├── page.tsx               🆕 Liste factures fournisseurs
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           🆕 Créer facture fournisseur
│       │   │   └── [id]/
│       │   │       ├── page.tsx           🆕 Détail facture
│       │   │       └── modifier/
│       │   │           └── page.tsx       🆕 Modifier facture
│       │   │
│       │   ├── charges-fixes/             🆕 NOUVEAU MODULE
│       │   │   ├── page.tsx               🆕 Liste charges fixes
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           🆕 Créer charge fixe
│       │   │   └── [id]/
│       │   │       └── page.tsx           🆕 Détail + historique
│       │   │
│       │   ├── comptes-courants/          🆕 NOUVEAU MODULE
│       │   │   ├── page.tsx               🆕 Liste CC par société
│       │   │   └── [societeId]/
│       │   │       ├── page.tsx           🆕 Détail CC + mouvements
│       │   │       └── nouveau-mouvement/
│       │   │           └── page.tsx       🆕 Apport/Retrait
│       │   │
│       │   ├── flux-inter-societes/       🆕 NOUVEAU MODULE
│       │   │   ├── page.tsx               🆕 Liste flux inter-groupe
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           🆕 Créer flux
│       │   │   └── [id]/
│       │   │       └── page.tsx           🆕 Détail flux
│       │   │
│       │   ├── tva/                       🆕 NOUVEAU MODULE
│       │   │   ├── page.tsx               🆕 Liste déclarations TVA
│       │   │   ├── nouvelle-declaration/
│       │   │   │   └── page.tsx           🆕 Créer déclaration
│       │   │   └── [periode]/
│       │   │       └── page.tsx           🆕 Détail déclaration + sources
│       │   │
│       │   └── exports/                   🆕 NOUVEAU MODULE
│       │       ├── page.tsx               🆕 Liste exports comptables
│       │       └── generer/
│       │           └── page.tsx           🆕 Générer FEC/Excel
│       │
│       ├── relances/                      🆕 NOUVEAU - Relances auto (PRIORITÉ 1)
│       │   ├── page.tsx                   🆕 Dashboard relances
│       │   ├── en-cours/
│       │   │   └── page.tsx               🆕 Relances en cours
│       │   ├── templates/
│       │   │   ├── page.tsx               🆕 Gestion templates
│       │   │   └── nouveau/
│       │   │       └── page.tsx           🆕 Créer template
│       │   └── historique/
│       │       └── page.tsx               🆕 Historique envois
│       │
│       ├── stock-flotte/                  🆕 NOUVEAU MEGA-MODULE (Migration React)
│       │   ├── page.tsx                   🆕 Dashboard stock & flotte
│       │   │
│       │   ├── articles/
│       │   │   ├── page.tsx               🆕 Liste articles (migré React)
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           🆕 Créer article
│       │   │   └── [id]/
│       │   │       ├── page.tsx           🆕 Détail article + QR code
│       │   │       └── modifier/
│       │   │           └── page.tsx       🆕 Modifier article
│       │   │
│       │   ├── stock/
│       │   │   ├── page.tsx               🆕 Mouvements stock (migré)
│       │   │   ├── entree/
│       │   │   │   └── page.tsx           🆕 Entrée stock
│       │   │   ├── sortie/
│       │   │   │   └── page.tsx           🆕 Sortie stock
│       │   │   ├── transfert/
│       │   │   │   └── page.tsx           🆕 Transfert entre dépôts
│       │   │   └── inventaire/
│       │   │       └── page.tsx           🆕 Inventaire stock
│       │   │
│       │   ├── equipements/
│       │   │   ├── page.tsx               🆕 Liste véhicules/matériel (migré)
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           🆕 Créer équipement
│       │   │   └── [id]/
│       │   │       ├── page.tsx           🆕 Fiche équipement
│       │   │       └── modifier/
│       │   │           └── page.tsx       🆕 Modifier équipement
│       │   │
│       │   ├── maintenance/
│       │   │   ├── page.tsx               🆕 Liste maintenances (migré)
│       │   │   ├── nouvelle/
│       │   │   │   └── page.tsx           🆕 Créer maintenance
│       │   │   └── [id]/
│       │   │       └── page.tsx           🆕 Détail maintenance
│       │   │
│       │   ├── affectations/
│       │   │   └── page.tsx               🆕 Affectations articles → véhicules (migré)
│       │   │
│       │   ├── alertes/
│       │   │   └── page.tsx               🆕 Alertes VGP/CT/Stock (migré)
│       │   │
│       │   ├── achats/                    🆕 NOUVEAU - Approvisionnement (PRIORITÉ 2)
│       │   │   ├── page.tsx               🆕 Dashboard achats
│       │   │   ├── bons-commande/
│       │   │   │   ├── page.tsx           🆕 Liste bons commande
│       │   │   │   ├── nouveau/
│       │   │   │   │   └── page.tsx       🆕 Créer bon commande
│       │   │   │   └── [id]/
│       │   │   │       └── page.tsx       🆕 Détail BC + suivi
│       │   │   ├── livraisons/
│       │   │   │   └── page.tsx           🆕 Suivi livraisons
│       │   │   └── fournisseurs/
│       │   │       └── page.tsx           🆕 Comparaison prix
│       │   │
│       │   └── statistiques/
│       │       └── page.tsx               🆕 Stats consommation (migré)
│       │
│       ├── operations/                    ✅ MODULE OPÉRATIONS COMPLET
│       │   ├── page.tsx                   ✅ Dashboard opérations
│       │   │
│       │   ├── planning/
│       │   │   └── page.tsx               ✅ Planning interventions
│       │   │
│       │   ├── interventions/
│       │   │   ├── page.tsx               ✅ Liste interventions
│       │   │   ├── nouvelle/
│       │   │   │   └── page.tsx           ✅ Créer intervention
│       │   │   └── [id]/
│       │   │       ├── page.tsx           ✅ Détail intervention
│       │   │       └── modifier/
│       │   │           └── page.tsx       ✅ Modifier intervention
│       │   │
│       │   └── rapports/
│       │       ├── page.tsx               ✅ Liste rapports Praxedo
│       │       └── [id]/
│       │           └── page.tsx           ✅ Détail rapport
│       │
│       ├── conformite/                    ✅ MODULE CONFORMITÉ COMPLET
│       │   ├── page.tsx                   ✅ Dashboard conformité
│       │   │
│       │   ├── certifications/
│       │   │   ├── page.tsx               ✅ Certifications CACES
│       │   │   ├── nouvelle/
│       │   │   │   └── page.tsx           ✅ Créer certification
│       │   │   └── [id]/
│       │   │       └── page.tsx           ✅ Détail certification
│       │   │
│       │   ├── visites-medicales/
│       │   │   ├── page.tsx               ✅ Visites médicales
│       │   │   └── nouvelle/
│       │   │       └── page.tsx           ✅ Créer visite
│       │   │
│       │   └── vgp/
│       │       ├── page.tsx               ✅ VGP équipements
│       │       └── nouvelle/
│       │           └── page.tsx           ✅ Créer VGP
│       │
│       └── administration/                🔧 MODULE ADMIN (à étendre)
│           ├── page.tsx                   ✅ Dashboard admin
│           │
│           ├── societes/                  🆕 NOUVEAU
│           │   ├── page.tsx               🆕 Liste sociétés groupe
│           │   ├── nouvelle/
│           │   │   └── page.tsx           🆕 Créer société
│           │   └── [id]/
│           │       ├── page.tsx           🆕 Détail société
│           │       └── modifier/
│           │           └── page.tsx       🆕 Modifier société
│           │
│           ├── utilisateurs/              🆕 NOUVEAU (si besoin)
│           │   ├── page.tsx               🆕 Liste utilisateurs
│           │   ├── nouveau/
│           │   │   └── page.tsx           🆕 Créer utilisateur
│           │   └── [id]/
│           │       └── page.tsx           🆕 Détail + permissions
│           │
│           ├── gely/                      ✅ MODULE GELY EXISTANT
│           │   └── page.tsx               ✅ Gestion GELY
│           │
│           └── parametres/
│               └── page.tsx               ✅ Paramètres généraux
│
│       ├── communication/                 🆕 NOUVEAU - Communication auto (PRIORITÉ 2)
│       │   ├── page.tsx                   🆕 Dashboard communication
│       │   ├── templates-sms/
│       │   │   ├── page.tsx               🆕 Templates SMS
│       │   │   └── nouveau/
│       │   │       └── page.tsx           🆕 Créer template SMS
│       │   ├── templates-email/
│       │   │   ├── page.tsx               🆕 Templates Email
│       │   │   └── nouveau/
│       │   │       └── page.tsx           🆕 Créer template Email
│       │   ├── historique/
│       │   │   └── page.tsx               🆕 Historique envois
│       │   └── configuration/
│       │       └── page.tsx               🆕 Config API SMS/Email
│       │
│       ├── rh/                            🆕 NOUVEAU - RH léger (OPTIONNEL)
│       │   ├── page.tsx                   🆕 Dashboard RH
│       │   ├── employes/
│       │   │   ├── page.tsx               🆕 Liste employés
│       │   │   ├── nouveau/
│       │   │   │   └── page.tsx           🆕 Créer employé
│       │   │   └── [id]/
│       │   │       └── page.tsx           🆕 Fiche employé
│       │   ├── conges/
│       │   │   ├── page.tsx               🆕 Gestion congés
│       │   │   └── demande/
│       │   │       └── page.tsx           🆕 Nouvelle demande
│       │   └── absences/
│       │       └── page.tsx               🆕 Planning absences
│       │
│       ├── sous-traitance/                🆕 NOUVEAU - Sous-traitance (OPTIONNEL)
│       │   ├── page.tsx                   🆕 Dashboard sous-traitance
│       │   ├── sous-traitants/
│       │   │   ├── page.tsx               🆕 Liste sous-traitants
│       │   │   └── nouveau/
│       │   │       └── page.tsx           🆕 Créer sous-traitant
│       │   └── missions/
│       │       ├── page.tsx               🆕 Liste missions
│       │       ├── nouvelle/
│       │       │   └── page.tsx           🆕 Créer mission
│       │       └── [id]/
│       │           └── page.tsx           🆕 Détail mission
│       │
│       └── qualite/                       🆕 NOUVEAU - Qualité (OPTIONNEL SI ISO)
│           ├── page.tsx                   🆕 Dashboard qualité
│           ├── reclamations/
│           │   ├── page.tsx               🆕 Liste réclamations
│           │   ├── nouvelle/
│           │   │   └── page.tsx           🆕 Créer réclamation
│           │   └── [id]/
│           │       └── page.tsx           🆕 Détail + actions
│           └── statistiques/
│               └── page.tsx               🆕 Stats qualité
│
├── lib/                                   ✅🔧🆕 BIBLIOTHÈQUES
│   ├── firebase/
│   │   ├── config.ts                      ✅ Config Firebase
│   │   ├── auth.ts                        ✅ Authentication
│   │   │
│   │   ├── groupes.ts                     ✅ CRUD groupes
│   │   ├── clients.ts                     ✅ CRUD clients
│   │   ├── sites.ts                       ✅ CRUD sites
│   │   ├── devis.ts                       🔧 À modifier (+ societeId)
│   │   ├── factures.ts                    🔧 À modifier (+ societeId + TVA)
│   │   ├── avoirs.ts                      🔧 À modifier (+ societeId + TVA)
│   │   ├── interventions.ts               ✅ CRUD interventions
│   │   ├── rapports.ts                    ✅ CRUD rapports
│   │   ├── certifications.ts              ✅ CRUD certifications
│   │   ├── visites-medicales.ts           ✅ CRUD visites
│   │   ├── vgp.ts                         ✅ CRUD VGP
│   │   │
│   │   ├── societes.ts                    🆕 NOUVEAU - CRUD sociétés
│   │   ├── comptes-bancaires.ts           🆕 NOUVEAU - CRUD comptes
│   │   ├── lignes-bancaires.ts            🆕 NOUVEAU - Import relevés
│   │   ├── notes-frais.ts                 🆕 NOUVEAU - CRUD notes frais
│   │   ├── factures-fournisseurs.ts       🆕 NOUVEAU - CRUD fournisseurs
│   │   ├── charges-fixes.ts               🆕 NOUVEAU - CRUD charges
│   │   ├── comptes-courants.ts            🆕 NOUVEAU - CRUD CC associés
│   │   ├── flux-inter-societes.ts         🆕 NOUVEAU - CRUD flux
│   │   ├── tva-declarations.ts            🆕 NOUVEAU - CRUD TVA
│   │   ├── exports-comptables.ts          🆕 NOUVEAU - Génération exports
│   │   │
│   │   ├── articles.ts                    🆕 NOUVEAU - CRUD articles (migration)
│   │   ├── mouvements-stock.ts            🆕 NOUVEAU - CRUD stock
│   │   ├── equipements.ts                 🆕 NOUVEAU - CRUD équipements
│   │   ├── maintenance.ts                 🆕 NOUVEAU - CRUD maintenance
│   │   ├── accessoires-equipement.ts      🆕 NOUVEAU - Affectations
│   │   ├── alertes-equipements.ts         🆕 NOUVEAU - Alertes
│   │   │
│   │   ├── documents.ts                   🆕 NOUVEAU - GED documents
│   │   ├── contrats-clients.ts            🆕 NOUVEAU - Contrats récurrents
│   │   ├── relances-clients.ts            🆕 NOUVEAU - Relances auto
│   │   ├── templates-relances.ts          🆕 NOUVEAU - Templates relances
│   │   ├── analyses-rentabilite.ts        🆕 NOUVEAU - Analyses BI
│   │   ├── bons-commande.ts               🆕 NOUVEAU - Bons commande
│   │   ├── messages-automatiques.ts       🆕 NOUVEAU - SMS/Email auto
│   │   ├── templates-communication.ts     🆕 NOUVEAU - Templates comm
│   │   ├── employes.ts                    🆕 NOUVEAU - CRUD employés (optionnel)
│   │   ├── conges-absences.ts             🆕 NOUVEAU - Congés (optionnel)
│   │   ├── sous-traitants.ts              🆕 NOUVEAU - Sous-traitants (optionnel)
│   │   ├── missions-sous-traitance.ts     🆕 NOUVEAU - Missions ST (optionnel)
│   │   └── reclamations.ts                🆕 NOUVEAU - Qualité (optionnel)
│   │
│   ├── utils/
│   │   ├── helpers.ts                     ✅ Fonctions utilitaires
│   │   ├── dates.ts                       ✅ Gestion dates
│   │   ├── numbers.ts                     ✅ Formats nombres
│   │   ├── tva.ts                         🆕 NOUVEAU - Calculs TVA
│   │   ├── rapprochement.ts               🆕 NOUVEAU - Matching bancaire
│   │   └── exports.ts                     🆕 NOUVEAU - Génération FEC
│   │
│   └── types/
│       ├── index.ts                       🔧 À enrichir
│       ├── groupes.ts                     ✅ Types groupes
│       ├── clients.ts                     ✅ Types clients
│       ├── sites.ts                       ✅ Types sites
│       ├── devis.ts                       🔧 À enrichir (societeId)
│       ├── factures.ts                    🔧 À enrichir (societeId + TVA)
│       ├── avoirs.ts                      🔧 À enrichir (societeId + TVA)
│       ├── interventions.ts               ✅ Types interventions
│       ├── societes.ts                    🆕 NOUVEAU - Types sociétés
│       ├── finances.ts                    🆕 NOUVEAU - Types finances
│       ├── stock.ts                       🆕 NOUVEAU - Types stock
│       ├── flotte.ts                      🆕 NOUVEAU - Types flotte
│       ├── documents.ts                   🆕 NOUVEAU - Types GED
│       ├── contrats.ts                    🆕 NOUVEAU - Types contrats
│       ├── relances.ts                    🆕 NOUVEAU - Types relances
│       ├── analyses.ts                    🆕 NOUVEAU - Types analyses
│       ├── achats.ts                      🆕 NOUVEAU - Types achats
│       ├── communication.ts               🆕 NOUVEAU - Types communication
│       ├── rh.ts                          🆕 NOUVEAU - Types RH (optionnel)
│       ├── sous-traitance.ts              🆕 NOUVEAU - Types ST (optionnel)
│       └── qualite.ts                     🆕 NOUVEAU - Types qualité (optionnel)
│
├── components/                            ✅🔧🆕 COMPOSANTS
│   ├── ui/                                ✅ shadcn/ui components
│   │   ├── button.tsx                     ✅
│   │   ├── input.tsx                      ✅
│   │   ├── select.tsx                     ✅
│   │   ├── dialog.tsx                     ✅
│   │   ├── table.tsx                      ✅
│   │   ├── badge.tsx                      ✅
│   │   ├── card.tsx                       ✅
│   │   └── ...                            ✅
│   │
│   ├── layout/
│   │   ├── Navbar.tsx                     🔧 À modifier (nouveaux menus)
│   │   ├── Sidebar.tsx                    🔧 À modifier (nouveaux liens)
│   │   └── Footer.tsx                     ✅
│   │
│   ├── dashboard/
│   │   ├── StatsCard.tsx                  ✅ Cartes KPI
│   │   ├── ChartCA.tsx                    ✅ Graphique CA
│   │   └── AlertesList.tsx                ✅ Liste alertes
│   │
│   ├── crm/
│   │   ├── GroupeCard.tsx                 ✅ Carte groupe
│   │   ├── ClientCard.tsx                 ✅ Carte client
│   │   └── SiteCard.tsx                   ✅ Carte site
│   │
│   ├── finances/
│   │   ├── DevisForm.tsx                  🔧 À modifier (+ select société)
│   │   ├── FactureForm.tsx                🔧 À modifier (+ société + TVA)
│   │   ├── AvoirForm.tsx                  🔧 À modifier (+ société + TVA)
│   │   ├── LigneFacture.tsx               ✅
│   │   ├── SelectSociete.tsx              🆕 NOUVEAU - Sélecteur société
│   │   ├── NoteFraisForm.tsx              🆕 NOUVEAU - Form note frais
│   │   ├── RapprochementLigne.tsx         🆕 NOUVEAU - Rapprochement bancaire
│   │   └── TVADetail.tsx                  🆕 NOUVEAU - Détail TVA
│   │
│   ├── stock-flotte/                      🆕 NOUVEAU - Composants migration
│   │   ├── ArticleCard.tsx                🆕 Card article
│   │   ├── QRCodeScanner.tsx              🆕 Scanner QR
│   │   ├── MouvementStockForm.tsx         🆕 Form mouvement
│   │   ├── EquipementCard.tsx             🆕 Card équipement
│   │   ├── MaintenanceForm.tsx            🆕 Form maintenance
│   │   ├── AlerteVGP.tsx                  🆕 Alerte VGP
│   │   └── BonCommandeForm.tsx            🆕 Form bon commande
│   │
│   ├── documents/                         🆕 NOUVEAU - Composants GED
│   │   ├── DocumentUpload.tsx             🆕 Upload documents
│   │   ├── DocumentViewer.tsx             🆕 Visualisation PDF/images
│   │   └── DocumentCard.tsx               🆕 Card document
│   │
│   ├── analyses/                          🆕 NOUVEAU - Composants BI
│   │   ├── RentabiliteChart.tsx           🆕 Graphiques rentabilité
│   │   ├── PerformanceKPI.tsx             🆕 KPIs performance
│   │   └── PrevisionChart.tsx             🆕 Graphiques prévisions
│   │
│   ├── contrats/                          🆕 NOUVEAU - Composants contrats
│   │   ├── ContratForm.tsx                🆕 Form contrat
│   │   ├── ContratCard.tsx                🆕 Card contrat
│   │   └── AlerteRenouvellement.tsx       🆕 Alerte renouvellement
│   │
│   ├── relances/                          🆕 NOUVEAU - Composants relances
│   │   ├── RelanceCard.tsx                🆕 Card relance
│   │   ├── TemplateRelanceForm.tsx        🆕 Form template
│   │   └── TimelineRelances.tsx           🆕 Timeline relances
│   │
│   ├── communication/                     🆕 NOUVEAU - Composants comm
│   │   ├── TemplateSMSForm.tsx            🆕 Form template SMS
│   │   ├── TemplateEmailForm.tsx          🆕 Form template Email
│   │   └── HistoriqueMessages.tsx         🆕 Historique
│   │
│   ├── rh/                                🆕 NOUVEAU - Composants RH (optionnel)
│   │   ├── EmployeCard.tsx                🆕 Card employé
│   │   ├── CongeForm.tsx                  🆕 Form congé
│   │   └── PlanningAbsences.tsx           🆕 Planning absences
│   │
│   ├── sous-traitance/                    🆕 NOUVEAU - Composants ST (optionnel)
│   │   ├── SousTraitantCard.tsx           🆕 Card sous-traitant
│   │   └── MissionForm.tsx                🆕 Form mission
│   │
│   ├── qualite/                           🆕 NOUVEAU - Composants qualité (optionnel)
│   │   ├── ReclamationForm.tsx            🆕 Form réclamation
│   │   └── ActionCorrectiveCard.tsx       🆕 Card action corrective
│   │
│   ├── operations/
│   │   ├── PlanningView.tsx               ✅ Vue planning
│   │   ├── InterventionCard.tsx           ✅ Carte intervention
│   │   └── RapportPDF.tsx                 ✅ Affichage PDF
│   │
│   └── conformite/
│       ├── CertificationCard.tsx          ✅ Carte certification
│       ├── VisiteCard.tsx                 ✅ Carte visite
│       └── VGPCard.tsx                    ✅ Carte VGP
│
├── public/                                ✅ Assets statiques
│   ├── images/                            ✅
│   ├── icons/                             ✅
│   └── fonts/                             ✅
│
├── styles/
│   └── globals.css                        ✅ Styles globaux
│
├── .env.local                             🔧 Variables d'environnement
├── next.config.js                         ✅ Config Next.js
├── tailwind.config.ts                     ✅ Config Tailwind
├── tsconfig.json                          ✅ Config TypeScript
├── package.json                           🔧 À mettre à jour
└── README.md                              🔧 Documentation
```

---

## 📊 STATISTIQUES FINALES COMPLÈTES

### Pages par statut
```
✅ EXISTE DÉJÀ (ne pas toucher)     : ~50 pages (CRM + Opérations + Conformité + Portail)
🔧 À MODIFIER LÉGÈREMENT            : ~10 pages (Devis/Factures/Avoirs + Navigation)
🆕 À CRÉER - VAGUE 1                : ~60 pages (Finances multi-sociétés + Stock & Flotte)
🆕 À CRÉER - VAGUE 2                : ~40 pages (GED + Contrats + Relances + Analyses)
🆕 À CRÉER - VAGUE 3                : ~20 pages (Achats + Communication)
🆕 À CRÉER - VAGUE 4                : ~30 pages (RH + Sous-traitance + Qualité - optionnels)

TOTAL PROJET COMPLET                : ~210 pages
```

### Fichiers lib/ par statut
```
✅ EXISTE DÉJÀ                      : ~15 fichiers
🔧 À MODIFIER                       : ~5 fichiers
🆕 À CRÉER - VAGUE 1                : ~20 fichiers (Finances + Stock)
🆕 À CRÉER - VAGUE 2                : ~10 fichiers (GED + Contrats + Relances + Analyses)
🆕 À CRÉER - VAGUE 3                : ~5 fichiers (Achats + Communication)
🆕 À CRÉER - VAGUE 4                : ~5 fichiers (RH + ST + Qualité - optionnels)

TOTAL                                : ~60 fichiers
```

### Composants par statut
```
✅ EXISTE DÉJÀ                      : ~30 composants
🔧 À MODIFIER                       : ~5 composants
🆕 À CRÉER - VAGUE 1                : ~25 composants (Finances + Stock)
🆕 À CRÉER - VAGUE 2                : ~15 composants (GED + Contrats + Relances + Analyses)
🆕 À CRÉER - VAGUE 3                : ~10 composants (Achats + Communication)
🆕 À CRÉER - VAGUE 4                : ~10 composants (RH + ST + Qualité - optionnels)

TOTAL                                : ~95 composants
```

### Collections Firebase Totales
```
TOTAL : 40 collections

Multi-sociétés (5)         : societes, comptes_bancaires, lignes_bancaires, 
                             comptes_courants_associes, flux_inter_societes

Finances (10)              : factures, avoirs, devis, notes_frais, 
                             factures_fournisseurs, charges_fixes, 
                             tva_declarations, exports_comptables, 
                             categories_depenses, contrats_clients

Relances & Comm (5)        : relances_clients, templates_relances, 
                             messages_automatiques, templates_communication, 
                             bons_commande

Stock & Flotte (6)         : articles, mouvements_stock, equipements, 
                             maintenance, accessoires_equipement, 
                             alertes_equipements

CRM (3)                    : groupes, clients, sites

Opérations (2)             : interventions, rapports

Conformité (3)             : certifications, visites_medicales, vgp

Analyses (1)               : analyses_rentabilite

Documents (1)              : documents

RH (2 - optionnel)         : employes, conges_absences

Sous-traitance (2 - opt)   : sous_traitants, missions_sous_traitance

Qualité (1 - optionnel)    : reclamations
```

---

## 🎯 PRIORISATION PAR VAGUES DE DÉVELOPPEMENT

### ⚡ VAGUE 1 : Système Financier Multi-Sociétés + Stock & Flotte (16-20 semaines)
**Objectif :** Infrastructure de base + migration app React

```
Phase 1  : Fondations multi-sociétés (2 sem)
           - /admin/administration/societes/
           - Modifier devis/factures/avoirs (+ societeId)
           - SelectSociete component
           - ~25 fichiers créés/modifiés

Phase 2  : Intégration Stock & Flotte (2-3 sem)
           - /admin/stock-flotte/ complet
           - Migration appli React → Next.js
           - Firebase Realtime → Firestore
           - ~45 fichiers créés

Phase 3  : Liens Finances ↔ Stock (1-2 sem)
           - Facture fournisseur → Entrée stock
           - Intervention → Sortie stock
           - Note frais → Véhicule
           - Maintenance → Stock + Fournisseur

Phase 4  : Trésorerie & Banque (2 sem)
           - /admin/finances/tresorerie/
           - Import CSV relevés
           - Rapprochement bancaire auto
           - Prévisionnel 90j

Phase 5  : Notes Frais PRO (2 sem)
           - /admin/finances/notes-frais/
           - TVA HT/TVA/TTC
           - Workflow validation 2 niveaux
           - Upload justificatifs

Phase 6  : Fournisseurs & Charges (1-2 sem)
           - /admin/finances/fournisseurs/
           - /admin/finances/charges-fixes/
           - Auto-génération charges

Phase 7  : Comptes Courants & Flux (1-2 sem)
           - /admin/finances/comptes-courants/
           - /admin/finances/flux-inter-societes/
           - Dashboard CC Jerome+Axel

Phase 8  : TVA & Comptabilité (2 sem)
           - /admin/finances/tva/
           - /admin/finances/exports/
           - Export FEC légal

Phase 9  : Dashboards Groupe (2 sem)
           - /admin/dashboard-groupe/
           - Graphiques évolution
           - Alertes automatiques

Phase 10 : Utilisateurs & Sécurité (1 sem)
           - Rôles & permissions
           - Logs actions
```

### 🔥 VAGUE 2 : Modules Business Critiques (4-6 semaines)
**Objectif :** Optimisation opérationnelle + intelligence business

```
Phase 11 : GED - Documents (1-2 sem) ⭐ PRIORITÉ 0
           - /admin/documents/
           - Upload/Download multi-formats
           - Catégorisation automatique
           - Alertes expiration
           - ~12 fichiers créés

Phase 12 : Contrats Récurrents (1 sem) ⭐ PRIORITÉ 1
           - /admin/crm/contrats/
           - Facturation mensuelle auto
           - Alertes renouvellement
           - ~8 fichiers créés

Phase 13 : Relances Automatiques (1 sem) ⭐ PRIORITÉ 1
           - /admin/relances/
           - Workflow J+15/30/45
           - Templates personnalisables
           - Blocage client auto
           - ~8 fichiers créés

Phase 14 : Analyses Rentabilité (1-2 sem) ⭐ PRIORITÉ 1
           - /admin/analyses/
           - Rentabilité clients/sites
           - Performance flotte/équipes
           - Prévisions CA
           - Graphiques BI avancés
           - ~12 fichiers créés
```

### 💡 VAGUE 3 : Optimisation & Confort (2-4 semaines)
**Objectif :** Gains de temps + satisfaction client

```
Phase 15 : Achats/Approvisionnement (1-2 sem)
           - /admin/stock-flotte/achats/
           - Bons de commande
           - Suivi livraisons
           - Comparaison fournisseurs
           - ~10 fichiers créés

Phase 16 : Communication Auto SMS/Email (1-2 sem)
           - /admin/communication/
           - Templates SMS/Email
           - Déclencheurs automatiques
           - API Twilio/SendGrid
           - Historique envois
           - ~10 fichiers créés
```

### ❓ VAGUE 4 : Modules Optionnels (selon besoins - 4-6 semaines)
**Objectif :** Fonctionnalités spécifiques selon activité

```
Phase 17 : RH Léger (1 sem) - SI PAS LOGICIEL EXTERNE
           - /admin/rh/
           - Congés/Absences
           - Soldes congés
           - Impact planning
           - ~8 fichiers créés

Phase 18 : Sous-traitance (1 sem) - SI APPLICABLE
           - /admin/sous-traitance/
           - Gestion sous-traitants
           - Missions
           - Refacturation
           - ~6 fichiers créés

Phase 19 : Projets PV (1-2 sem) - À CLARIFIER ACTIVITÉ
           - Module spécifique selon activité réelle
           - Installation OU Production

Phase 20 : Qualité (1 sem) - SI CERTIFICATION ISO
           - /admin/qualite/
           - Réclamations
           - Actions correctives
           - Statistiques
           - ~6 fichiers créés
```

**⏱️ ESTIMATION TOTALE : 26-36 semaines pour système ULTRA-COMPLET**

**💰 RETOUR SUR INVESTISSEMENT PAR VAGUE :**
```
VAGUE 1 : Infrastructure complète + Migration stock
          → Gain immédiat : Vision patrimoine groupe
          → Gain: Trésorerie pilotée
          
VAGUE 2 : Business intelligence + Automatisation
          → Gain: ~10h/mois (relances auto + facturation contrats)
          → Gain: Décisions basées données réelles

VAGUE 3 : Efficacité opérationnelle
          → Gain: ~5h/mois (approvisionnement + comm auto)
          → Gain: Satisfaction client

VAGUE 4 : Selon besoins spécifiques
          → ROI variable selon modules choisis
```

---

## 🎯 ANCIENNES PHASES DÉTAILLÉES (RÉFÉRENCE)

### PHASE 1 - Fondations Multi-Sociétés
```
🆕 /admin/administration/societes/     (4 pages)
🆕 lib/firebase/societes.ts
🆕 lib/types/societes.ts
🆕 components/finances/SelectSociete.tsx

🔧 /admin/finances/devis/               (5 pages - ajouter select)
🔧 /admin/finances/factures/            (5 pages - ajouter select)
🔧 /admin/finances/avoirs/              (5 pages - ajouter select)

🔧 lib/firebase/devis.ts                (ajouter societeId)
🔧 lib/firebase/factures.ts             (ajouter societeId + TVA)
🔧 lib/firebase/avoirs.ts               (ajouter societeId + TVA)

TOTAL : ~25 fichiers à créer/modifier
```

### PHASE 2 - Intégration Stock & Flotte
```
🆕 /admin/stock-flotte/                 (tout le dossier - ~25 pages)
🆕 lib/firebase/articles.ts
🆕 lib/firebase/mouvements-stock.ts
🆕 lib/firebase/equipements.ts
🆕 lib/firebase/maintenance.ts
🆕 lib/firebase/accessoires-equipement.ts
🆕 lib/firebase/alertes-equipements.ts
🆕 components/stock-flotte/             (~10 composants)

TOTAL : ~45 fichiers à créer
```

### PHASE 3-8 - Modules Finances
```
🆕 /admin/finances/tresorerie/          (~8 pages)
🆕 /admin/finances/notes-frais/         (~4 pages)
🆕 /admin/finances/fournisseurs/        (~4 pages)
🆕 /admin/finances/charges-fixes/       (~3 pages)
🆕 /admin/finances/comptes-courants/    (~3 pages)
🆕 /admin/finances/flux-inter-societes/ (~3 pages)
🆕 /admin/finances/tva/                 (~3 pages)
🆕 /admin/finances/exports/             (~2 pages)

+ Libs associées
+ Composants associés

TOTAL : ~80 fichiers à créer
```

### PHASE 9 - Dashboards
```
🆕 /admin/dashboard-groupe/             (1 page)
🔧 /admin/page.tsx                      (modifier dashboard)
🔧 /admin/finances/page.tsx             (enrichir dashboard)

+ Composants graphiques
+ Calculs KPI

TOTAL : ~15 fichiers à créer/modifier
```

---

## 📝 NOTES IMPORTANTES

### Navigation à modifier
```typescript
// components/layout/Sidebar.tsx

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Dashboard Groupe', href: '/admin/dashboard-groupe', icon: Building }, // 🆕
  
  // Documents (nouveau)
  { name: 'Documents', href: '/admin/documents', icon: FileText }, // 🆕 PRIORITÉ 0
  
  // Analyses (nouveau)
  { name: 'Analyses', href: '/admin/analyses', icon: TrendingUp }, // 🆕 PRIORITÉ 1
  
  // CRM (étendu)
  { name: 'CRM', icon: Users, submenu: [
    { name: 'Groupes', href: '/admin/crm/groupes' },
    { name: 'Clients', href: '/admin/crm/clients' },
    { name: 'Sites', href: '/admin/crm/sites' },
    { name: 'Contrats', href: '/admin/crm/contrats' }, // 🆕 PRIORITÉ 1
  ]},
  
  // Finances (menu étendu)
  { name: 'Finances', icon: Euro, submenu: [
    { name: 'Dashboard', href: '/admin/finances' },
    { name: 'Trésorerie', href: '/admin/finances/tresorerie' }, // 🆕
    { name: 'Devis', href: '/admin/finances/devis' },
    { name: 'Factures', href: '/admin/finances/factures' },
    { name: 'Avoirs', href: '/admin/finances/avoirs' },
    { name: 'Notes de Frais', href: '/admin/finances/notes-frais' }, // 🆕
    { name: 'Fournisseurs', href: '/admin/finances/fournisseurs' }, // 🆕
    { name: 'Charges Fixes', href: '/admin/finances/charges-fixes' }, // 🆕
    { name: 'Comptes Courants', href: '/admin/finances/comptes-courants' }, // 🆕
    { name: 'Flux Inter-Sociétés', href: '/admin/finances/flux-inter-societes' }, // 🆕
    { name: 'TVA', href: '/admin/finances/tva' }, // 🆕
    { name: 'Exports', href: '/admin/finances/exports' }, // 🆕
  ]},
  
  // Relances (nouveau)
  { name: 'Relances', href: '/admin/relances', icon: AlertCircle }, // 🆕 PRIORITÉ 1
  
  // Stock & Flotte (nouveau mega-menu)
  { name: 'Stock & Flotte', icon: Package, submenu: [ // 🆕
    { name: 'Dashboard', href: '/admin/stock-flotte' },
    { name: 'Articles', href: '/admin/stock-flotte/articles' },
    { name: 'Mouvements Stock', href: '/admin/stock-flotte/stock' },
    { name: 'Achats', href: '/admin/stock-flotte/achats' }, // 🆕 PRIORITÉ 2
    { name: 'Équipements', href: '/admin/stock-flotte/equipements' },
    { name: 'Maintenance', href: '/admin/stock-flotte/maintenance' },
    { name: 'Affectations', href: '/admin/stock-flotte/affectations' },
    { name: 'Alertes', href: '/admin/stock-flotte/alertes' },
  ]},
  
  // Opérations (ne change pas)
  { name: 'Planning', href: '/admin/operations/planning', icon: Calendar },
  { name: 'Interventions', href: '/admin/operations/interventions', icon: Wrench },
  { name: 'Rapports', href: '/admin/operations/rapports', icon: FileText },
  
  // Conformité (ne change pas)
  { name: 'Conformité', icon: Shield, submenu: [
    { name: 'Certifications', href: '/admin/conformite/certifications' },
    { name: 'Visites Médicales', href: '/admin/conformite/visites-medicales' },
    { name: 'VGP', href: '/admin/conformite/vgp' },
  ]},
  
  // Communication (nouveau)
  { name: 'Communication', href: '/admin/communication', icon: MessageSquare }, // 🆕 PRIORITÉ 2
  
  // RH (nouveau - optionnel)
  { name: 'RH', href: '/admin/rh', icon: Users }, // 🆕 OPTIONNEL
  
  // Sous-traitance (nouveau - optionnel)
  { name: 'Sous-traitance', href: '/admin/sous-traitance', icon: Briefcase }, // 🆕 OPTIONNEL
  
  // Qualité (nouveau - optionnel)
  { name: 'Qualité', href: '/admin/qualite', icon: CheckCircle }, // 🆕 OPTIONNEL
  
  // Administration (menu étendu)
  { name: 'Administration', icon: Settings, submenu: [
    { name: 'Sociétés', href: '/admin/administration/societes' }, // 🆕
    { name: 'Utilisateurs', href: '/admin/administration/utilisateurs' }, // 🆕
    { name: 'GELY', href: '/admin/administration/gely' },
    { name: 'Paramètres', href: '/admin/administration/parametres' },
  ]},
];
```

---

## ✅ RÉCAPITULATIF FINAL ULTRA-COMPLET

```
PAGES EXISTANTES (gardées tel quel)      : ~50 pages (70% du site actuel)
PAGES MODIFIÉES LÉGÈREMENT               : ~10 pages (ajouter 1-2 champs)
PAGES NOUVELLES - VAGUE 1                : ~60 pages (Finances + Stock)
PAGES NOUVELLES - VAGUE 2                : ~40 pages (GED + Contrats + Relances + Analyses)
PAGES NOUVELLES - VAGUE 3                : ~20 pages (Achats + Communication)
PAGES NOUVELLES - VAGUE 4 (optionnel)   : ~30 pages (RH + ST + Qualité)

TOTAL PROJET COMPLET                      : ~210 pages

FICHIERS LIB EXISTANTS                    : ~15 fichiers
FICHIERS LIB NOUVEAUX                     : ~45 fichiers

COMPOSANTS EXISTANTS                      : ~30 composants  
COMPOSANTS NOUVEAUX                       : ~65 composants

COLLECTIONS FIREBASE TOTALES              : 40 collections
```

**⏱️ DURÉE ESTIMÉE DÉVELOPPEMENT :**
```
VAGUE 1 (Essentiel)               : 16-20 semaines
VAGUE 2 (Business Critique)       : 4-6 semaines
VAGUE 3 (Optimisation)            : 2-4 semaines
VAGUE 4 (Optionnel)               : 4-6 semaines

TOTAL SYSTÈME COMPLET             : 26-36 semaines (~6-9 mois)
```

**💡 RECOMMANDATION :**
```
DÉMARRER avec VAGUE 1 uniquement (16-20 semaines)
→ Système financier complet + Stock migré
→ Infrastructure solide
→ ROI immédiat

Puis décider si VAGUE 2 pertinente
→ Selon utilisation VAGUE 1
→ Selon besoins business réels observés
```

**🎯 FLEXIBILITÉ :**
```
Chaque vague = autonome
→ Peut être démarrée indépendamment
→ Pas d'obligation de tout faire
→ Priorisation selon besoins réels terrain
```

---

**Date** : 30 décembre 2025  
**Version** : 2.0 FINALE ULTRA-COMPLÈTE AVEC TOUS LES MODULES

**Ce document inclut :**
✅ Système financier multi-sociétés complet  
✅ Migration Stock & Flotte React → Next.js
✅ GED - Gestion documentaire
✅ Contrats clients récurrents
✅ Relances automatiques
✅ Analyses rentabilité & BI
✅ Achats & Approvisionnement
✅ Communication automatique SMS/Email
✅ Modules optionnels (RH, Sous-traitance, Qualité)

**Ce document est LA RÉFÉRENCE DÉFINITIVE - Plus besoin de refaire !**

