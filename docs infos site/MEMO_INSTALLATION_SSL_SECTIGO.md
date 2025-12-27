# MÉMO : Installation Certificat SSL Sectigo sur solairenettoyage.com

**Date :** 26 décembre 2025  
**Domaine :** solairenettoyage.com  
**Serveur :** IONOS VPS avec Plesk Obsidian 18.0.74  
**Certificat :** Sectigo (valide jusqu'au 26 décembre 2026)  
**Note SSL Labs :** A (Excellent)

---

## 📋 RÉSUMÉ DE L'INSTALLATION

Le certificat SSL Sectigo a été installé avec succès sur le domaine solairenettoyage.com. Le site est maintenant accessible en HTTPS sécurisé avec un cadenas vert 🔒 sur tous les navigateurs.

---

## 🔧 ÉTAPES RÉALISÉES

### 1. PRÉPARATION DES FICHIERS CERTIFICAT

Trois fichiers fournis par Sectigo ont été utilisés :
- **CLE-PRIVEE.txt** : Clé privée du certificat
- **CERTIFICAT.txt** : Certificat SSL
- **CA-BUNDLE.txt** : Chaîne de certification (autorités intermédiaires)

### 2. UPLOAD DU CERTIFICAT DANS PLESK

**Navigation :** Outils & Paramètres → Certificats SSL/TLS → Ajouter un certificat SSL/TLS

**Champs remplis :**
- Nom du certificat : `solairenettoyage-2025`
- Pays : France
- État/Province/Région : Occitanie
- Emplacement (ville) : Toulouse
- Raison sociale : Solaire Nettoyage
- Nom de domaine : solairenettoyage.com
- Adresse mail : Contact@solairenettoyage.fr

**Section "Envoyer le certificat en mode texte" :**
- Clé privée (*.key) : Contenu de CLE-PRIVEE.txt
- Certificat (*.crt) : Contenu de CERTIFICAT.txt
- Certificat CA (*-ca.crt) : Contenu de CA-BUNDLE.txt

**Résultat :** Certificat chargé avec succès dans le pool de certificats Plesk

### 3. ACTIVATION SSL/TLS SUR LE DOMAINE

**Navigation :** Domaines → solairenettoyage.com → Hébergement et DNS → Paramètres d'hébergement

**Configuration :**
- ✅ **Prise en charge SSL/TLS** : Activé
- ✅ **Rediriger HTTP vers HTTPS** : Activé (redirection 301)
- ✅ **Certificat** : solairenettoyage-sectigo-2025 sélectionné
- ✅ **Domaine préféré** : solairenettoyage.com (sans www)

### 4. ASSIGNATION DU CERTIFICAT (LIGNE DE COMMANDE)

Problème initial : Plesk avait assigné un mauvais certificat après réactivation SSL.

**Commandes SSH exécutées :**
```bash
# Vérification des certificats disponibles
plesk bin certificate -l -domain solairenettoyage.com

# Assignation du bon certificat au domaine
plesk bin site -u solairenettoyage.com -certificate-name "solairenettoyage-sectigo-2025"

# Redémarrage de nginx
systemctl restart nginx
```

**Vérification :**
```bash
cat /var/www/vhosts/system/solairenettoyage.com/conf/nginx.conf | grep ssl_certificate
```

**Résultat :** Certificat Sectigo correctement assigné (fichier scfjidt2kqc76gacCwu31b)

### 5. VALIDATION FINALE

**Tests effectués :**
- ✅ Site accessible en HTTPS : https://solairenettoyage.com
- ✅ Certificat valide et reconnu par les navigateurs
- ✅ Redirection HTTP → HTTPS fonctionnelle
- ✅ Note SSL Labs : A
- ✅ Cadenas vert 🔒 sur Chrome, Firefox, Edge, Safari

---

## 📊 RÉSULTATS SSL LABS

**URL de test :** https://www.ssllabs.com/ssltest/analyze.html?d=solairenettoyage.com

**Note globale : A**

**Certificat :**
- Sujet : *.solairenettoyage.com
- Émetteur : Sectigo Public Server Authentication CA DV R36
- Valide du : 26 décembre 2025
- Valide jusqu'au : 26 décembre 2026 (1 an)
- Type : RSA 2048 bits
- Wildcard : Oui (*.solairenettoyage.com + solairenettoyage.com)

**Sécurité :**
- ✅ TLS 1.3 : Activé
- ✅ TLS 1.2 : Activé
- ✅ Forward Secrecy : ROBUST
- ✅ Aucune vulnérabilité détectée
- ✅ Compatible tous navigateurs modernes

**Chaîne de certification :**
1. *.solairenettoyage.com (RSA 2048)
2. Sectigo Public Server Authentication CA DV R36 (RSA 3072)
3. Sectigo Public Server Authentication Root R46 (RSA 4096)
4. USERTrust RSA Certification Authority

---

## ⚙️ CONFIGURATION TECHNIQUE

### Configuration Nginx (Reverse Proxy)

**Fichier :** `/var/www/vhosts/system/solairenettoyage.com/conf/nginx.conf`

**Port d'écoute :**
- HTTP : 217.154.170.227:80
- HTTPS : 217.154.170.227:443

**Certificats utilisés :**
```nginx
ssl_certificate     /opt/psa/var/certificates/scfjidt2kqc76gacCwu31b;
ssl_certificate_key /opt/psa/var/certificates/scfjidt2kqc76gacCwu31b;
```

**Redirection HTTP → HTTPS :**
```nginx
server {
    listen 217.154.170.227:80;
    server_name solairenettoyage.com;
    
    location / {
        return 301 https://$host$request_uri;
    }
}
```

**Redirection www → non-www :**
```nginx
server {
    listen 217.154.170.227:443 ssl;
    server_name www.solairenettoyage.com;
    
    location / {
        return 301 https://solairenettoyage.com$request_uri;
    }
}
```

**Proxy vers Apache :**
```nginx
location / {
    proxy_pass https://127.0.0.1:7081;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### Configuration Apache (Backend)

**Fichier :** Configuration via Plesk (Apache & nginx → Directives supplémentaires)

**Proxy vers Node.js (port 3000) :**
```apache
ProxyPreserveHost On
ProxyPass /.well-known !
ProxyPass / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
```

**Identique pour HTTP et HTTPS.**

---

## 🔄 ARCHITECTURE DE CONNEXION

```
Visiteur (navigateur)
    ↓
    ↓ HTTPS (port 443)
    ↓ Certificat Sectigo
    ↓
Nginx (Reverse Proxy)
    ↓
    ↓ HTTPS (port 7081)
    ↓
Apache
    ↓
    ↓ HTTP (port 3000)
    ↓
Application Next.js
```

**Services actifs :**
- Nginx : Gère HTTPS, certificat SSL, redirection HTTP→HTTPS
- Apache : Gère le proxy vers l'application Node.js
- PM2 : Gère le processus Next.js (port 3000)

---

## 📝 INFORMATIONS IMPORTANTES

### Renouvellement du Certificat

**Date d'expiration :** 26 décembre 2026

**Procédure de renouvellement (dans 1 an) :**
1. Obtenir les nouveaux fichiers de Sectigo (clé privée, certificat, CA bundle)
2. Dans Plesk : Outils & Paramètres → Certificats SSL/TLS
3. Uploader le nouveau certificat (même procédure que l'installation initiale)
4. Assigner le nouveau certificat au domaine
5. Redémarrer nginx : `systemctl restart nginx`

### Commandes Utiles

**Lister les certificats du domaine :**
```bash
plesk bin certificate -l -domain solairenettoyage.com
```

**Vérifier quel certificat est utilisé :**
```bash
cat /var/www/vhosts/system/solairenettoyage.com/conf/nginx.conf | grep ssl_certificate
```

**Assigner un certificat à un domaine :**
```bash
plesk bin site -u solairenettoyage.com -certificate-name "NOM_DU_CERTIFICAT"
```

**Redémarrer les services :**
```bash
systemctl restart nginx
systemctl restart apache2
```

**Tester le certificat en ligne de commande :**
```bash
openssl s_client -connect solairenettoyage.com:443 -servername solairenettoyage.com
```

### Accès Plesk

**URL :** https://217.154.170.227:8443  
**Domaine géré :** solairenettoyage.com  
**Certificat actif :** solairenettoyage-sectigo-2025

---

## ⚠️ PROBLÈMES RENCONTRÉS ET SOLUTIONS

### Problème 1 : Certificat chargé mais HTTPS ne fonctionne pas

**Cause :** Le certificat était dans le pool Plesk mais pas assigné au domaine.

**Solution :**
```bash
plesk bin site -u solairenettoyage.com -certificate-name "solairenettoyage-sectigo-2025"
systemctl restart nginx
```

### Problème 2 : Erreur "NET::ERR_CERT_AUTHORITY_INVALID"

**Cause :** Plesk avait assigné un mauvais certificat (certRMWKjPC au lieu de scfjidt2kqc76gacCwu31b).

**Solution :** Réassigner le bon certificat avec la commande ci-dessus.

### Problème 3 : Site affiche "Non sécurisé" malgré certificat valide

**Cause :** Cache du navigateur conservant l'ancien certificat invalide.

**Solution :** Fermer complètement le navigateur et le rouvrir, ou tester en navigation privée.

---

## ✅ CHECKLIST DE VÉRIFICATION

- [x] Certificat SSL installé dans Plesk
- [x] Certificat assigné au domaine solairenettoyage.com
- [x] SSL/TLS activé dans les paramètres d'hébergement
- [x] Redirection HTTP → HTTPS activée
- [x] Redirection www → non-www configurée
- [x] Nginx redémarré
- [x] Apache redémarré
- [x] Site accessible en HTTPS avec cadenas vert
- [x] Test SSL Labs réussi (note A)
- [x] Compatible tous navigateurs (Chrome, Firefox, Edge, Safari)
- [x] Certificat wildcard couvrant *.solairenettoyage.com et solairenettoyage.com

---

## 🎯 RÉSULTAT FINAL

**Site accessible en HTTPS sécurisé :**
- URL principale : https://solairenettoyage.com
- Toutes les pages en HTTPS automatiquement
- Cadenas vert 🔒 sur tous les navigateurs
- Certificat reconnu par toutes les autorités
- Note SSL Labs : A (excellent)
- Validité : 1 an (jusqu'au 26 décembre 2026)

**Avantages pour l'entreprise :**
- ✅ Confiance clients (EDF, ENGIE, TotalEnergies, etc.)
- ✅ SEO amélioré (Google favorise les sites HTTPS)
- ✅ Sécurité des données (mots de passe, formulaires)
- ✅ Conformité RGPD
- ✅ Image professionnelle renforcée

---

## 📞 CONTACT SUPPORT

**En cas de problème avec le certificat SSL :**

**Support Sectigo :** https://sectigo.com/support  
**Support IONOS :** https://www.ionos.fr/assistance  
**Documentation Plesk SSL :** https://docs.plesk.com/en-US/obsidian/administrator-guide/website-management/ssl-tls-certificates.74383/

---

**Document créé le :** 26 décembre 2025  
**Dernière mise à jour :** 26 décembre 2025  
**Version :** 1.0

---

## 🔐 SÉCURITÉ

**Les fichiers suivants contiennent des informations sensibles et doivent être conservés en lieu sûr :**
- CLE-PRIVEE.txt (clé privée du certificat)
- CERTIFICAT.txt (certificat SSL)
- CA-BUNDLE.txt (chaîne de certification)

**Ne JAMAIS partager la clé privée avec qui que ce soit.**
