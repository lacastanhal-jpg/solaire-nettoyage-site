# ⚡ AIDE-MÉMOIRE RAPIDE - Solaire Nettoyage

**Pour démarrer rapidement une conversation**

---

## 🎯 L'ESSENTIEL EN 30 SECONDES

**Qui** : Jerome + Axel (co-gérants Solaire Nettoyage)
**Quoi** : ERP complet Next.js + Firebase
**Pourquoi** : Remplacer Everwin + Praxedo + Expensya
**Où** : `/Users/jeromegely/solaire-nettoyage-site`
**État** : **Phase 2/10 à 80%**

---

## 📊 ÉTAT ACTUEL

```
VAGUE 1 - 10 PHASES

✅ Phase 1 : Multi-Sociétés (100%)
⏳ Phase 2 : Stock & Flotte (80%) ← ON EST LÀ
❌ Phase 3 : Liens Finances ↔ Stock (0%)
❌ Phase 4 : Trésorerie (0%)
❌ Phase 5 : Notes Frais PRO (0%)
❌ Phase 6-10 : Reste (0%)

PROGRESSION GLOBALE : 50%
```

---

## 🔥 CE QUI VIENT D'ÊTRE FAIT (31/12)

✅ Affectations stock embarqué (tags article → équipement)
✅ Filtre articles affectés dans interventions
✅ Corrections bugs export/index Firebase
✅ Navigation complète (5 pages ajoutées menu)
✅ Phase 2 : 60% → 80%

---

## ⚠️ RÈGLES CRITIQUES

### **Stock**
```typescript
// ✅ TOUJOURS
stockParDepot: {
  'Atelier': number,
  'Porteur 26T': number,
  'Porteur 32T': number,
  'Semi Remorque': number
}

// ❌ JAMAIS
stock: number  // ← OBSOLÈTE
```

### **4 Dépôts Fixes**
- Atelier (principal)
- Porteur 26T (camion)
- Porteur 32T (camion)
- Semi Remorque

**= Zones de stockage physique**
**≠ Véhicules individuels**

### **Affectations = Tags**
```
"Affecter HVB 46 → FOURGON" = 
  Tag favori (pas mouvement physique)

Stock reste : Atelier 19L
```

---

## 🔗 WORKFLOW PRINCIPAL

### **Intervention → Stock**
```
1. Intervention créée
   ↓
2. Articles sélectionnés
   ☑️ Filtre "affectés uniquement"
   ↓
3. Finalisation
   → Stock déduit AUTO ✅
   → Mouvement créé ✅
   ↓
4. Modification
   → Annule ancien ✅
   → Crée nouveau ✅
   ↓
5. Suppression
   → Restaure stock ✅
```

---

## 📂 COLLECTIONS FIREBASE (15)

**CRM** : groupes, clients, sites
**Finances** : societes, devis, factures, avoirs
**Stock** : articles_stock, mouvements_stock, equipements, affectations_accessoires, affectations_articles_embarques, interventions_equipement, factures_fournisseurs, bons_commande_fournisseurs
**Opérations** : interventions, rapports_praxedo

---

## 🛠️ FICHIERS CLÉS

```
lib/firebase/
├─ stock-articles.ts          ← CRUD + stock
├─ stock-mouvements.ts         ← Historique
├─ stock-interventions.ts      ← Finalisation
├─ interventions-gestion-stock.ts ← Annulation
└─ stock-affectations.ts       ← Affectations ✅ 31/12

app/admin/stock-flotte/
├─ interventions/nouveau/      ← Filtre ✅ 31/12
└─ interventions/[id]/modifier/ ← Filtre ✅ 31/12
```

---

## 🎯 PROCHAINES ÉTAPES

### **Option A : Finir Phase 2 (2-3 jours)**
- Améliorer alertes CT/VGP
- Dashboard graphiques
- Stats consommation

### **Option B : Phase 3 (1-2 sem)**
- Facture fournisseur → Stock AUTO
- Intervention → Facturation AUTO
- Liens automatiques

---

## 💬 PHRASES TYPES

**"Tout est interconnecté"**
→ Facture → Stock → Trésorerie → TVA (automatique)

**"4 dépôts fixes"**
→ Atelier, Porteur 26T, Porteur 32T, Semi

**"Affectations = Tags"**
→ Pas de mouvements physiques

**"stockParDepot"**
→ Jamais "stock" seul

---

## 🚀 COMMANDES

```bash
cd /Users/jeromegely/solaire-nettoyage-site
npm run dev
npm run build  # Test avant push
```

---

## 📝 POUR NOUVELLE CONVERSATION

**Dire à Claude** :
```
Lis REFERENCE-COMPLETE-PROJET.md
puis AIDE-MEMOIRE-RAPIDE.md

On est Phase 2 à 80%.
Prochaine étape ?
```

---

**Dernière session** : 31/12/2025 - 20h30  
**Tokens utilisés** : 107k/190k (56%)  
**Prêt pour nouvelle conversation** ✅
