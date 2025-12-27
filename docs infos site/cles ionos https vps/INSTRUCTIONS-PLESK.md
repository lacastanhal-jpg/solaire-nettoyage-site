# 🔐 INSTALLER LE CERTIFICAT SECTIGO DANS PLESK

## 📋 ÉTAPES

### **1. VA DANS PLESK**

**Outils & Paramètres** → **Certificats SSL/TLS**

---

### **2. CLIQUE SUR "Ajouter"**

En haut à gauche de la liste des certificats.

---

### **3. REMPLIS LE FORMULAIRE**

**Nom du certificat :**
```
solairenettoyage-sectigo-2025
```

**Puis scroll en bas et cherche la section "Envoyer en mode texte"**

---

### **4. COPIE-COLLE LES CONTENUS**

**Clé privée (*.key) :**
- Ouvre le fichier **`CLE-PRIVEE.txt`**
- Copie TOUT le contenu
- Colle dans le champ "Clé privée"

**Certificat (*.crt) :**
- Ouvre le fichier **`CERTIFICAT.txt`**
- Copie TOUT le contenu
- Colle dans le champ "Certificat"

**Certificat CA (*-ca.crt) :**
- Ouvre le fichier **`CA-BUNDLE.txt`**
- Copie TOUT le contenu
- Colle dans le champ "Certificat CA"

---

### **5. CLIQUE SUR "Charger le certificat" ou "Ajouter"**

---

### **6. ASSIGNER LE CERTIFICAT AU DOMAINE**

1. **Va dans** Domaines → solairenettoyage.com
2. **Clique sur** "Hébergement" ou "Paramètres d'hébergement"
3. **Dans la section "Prise en charge SSL/TLS"**, coche "Activé"
4. **Dans "Certificat"**, sélectionne **"solairenettoyage-sectigo-2025"**
5. **Coche** "Redirection permanente SEO de HTTP vers HTTPS"
6. **Clique sur** "OK" ou "Appliquer"

---

## ✅ VÉRIFICATION

**Teste le site :**
```
https://solairenettoyage.com
```

**Tu devrais voir :**
- 🔒 Cadenas vert
- Certificat Sectigo valide jusqu'à 2026

---

**C'EST PARTI ! 🚀**
