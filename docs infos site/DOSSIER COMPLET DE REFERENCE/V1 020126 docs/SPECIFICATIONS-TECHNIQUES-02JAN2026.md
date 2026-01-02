# ⚙️ SPÉCIFICATIONS TECHNIQUES COMPLÈTES

**Date :** 2 Janvier 2026, 15h40  
**Version :** v1.2 (Session 2)

---

## 🏗️ STACK TECHNIQUE

### Frontend
```
Framework : Next.js 14.0.4
Language : TypeScript 5.3
Styling : Tailwind CSS 3.4
UI Components : shadcn/ui + Lucide React
Calendar : react-big-calendar
Charts : Recharts
PDF Generation : jsPDF
Forms : React Hook Form + Zod validation
```

### Backend
```
Database : Firebase Firestore (NoSQL)
Storage : Firebase Storage
Authentication : Firebase Auth (à activer)
Functions : Firebase Cloud Functions (futures)
Email : SMTP IONOS (smtp.ionos.fr)
Cron : Firebase Scheduled Functions (futures)
```

### Déploiement
```
Production Vercel : https://erp.solaire-nettoyage.fr
Production VPS : https://intranet.solaire-nettoyage.fr
CDN : Vercel Edge Network
VPS : IONOS + Plesk
Process Manager : PM2 (VPS)
```

### Développement
```
Version Control : Git + GitHub
Package Manager : npm
Dev Server : next dev (localhost:3000)
Build : next build
Linting : ESLint
Formatting : Prettier (à configurer)
```

---

## 🗄️ FIREBASE CONFIGURATION

### Collections Firestore (16 actives)

#### 1. groupes_clients
```typescript
Index composés :
- actif (ASC) + nom (ASC)

Règles sécurité :
allow read: if request.auth != null;
allow write: if request.auth.token.role == 'admin';

Taille moyenne document : 0.5 KB
Volume : 7 documents
```

#### 2. clients
```typescript
Index composés :
- groupeId (ASC) + actif (ASC) + raisonSociale (ASC)
- actif (ASC) + createdAt (DESC)

Règles sécurité :
allow read: if request.auth != null;
allow write: if request.auth.token.role == 'admin';

Taille moyenne document : 2 KB
Volume : 600+ documents
```

#### 3. sites
```typescript
Index composés :
- clientId (ASC) + actif (ASC) + nom (ASC)
- groupeNom (ASC) + actif (ASC)
- actif (ASC) + createdAt (DESC)

Index géospatial :
- coordonneesGPS.lat, coordonneesGPS.lng

Règles sécurité :
allow read: if request.auth != null;
allow write: if request.auth.token.role == 'admin';

Taille moyenne document : 1.5 KB
Volume : 3600+ documents
```

#### 4. devis
```typescript
Index composés :
- clientId (ASC) + statut (ASC) + date (DESC)
- statut (ASC) + date (DESC)
- numero (ASC)

Règles sécurité :
allow read: if request.auth != null;
allow create: if request.auth.token.role in ['admin', 'commercial'];
allow update, delete: if request.auth.token.role == 'admin';

Taille moyenne document : 5 KB
Volume estimé : 500/an
```

#### 5. factures
```typescript
Index composés :
- clientId (ASC) + statut (ASC) + date (DESC)
- statut (ASC) + dateEcheance (ASC)
- numero (ASC)

Règles sécurité :
allow read: if request.auth != null;
allow write: if request.auth.token.role == 'admin';

Taille moyenne document : 6 KB
Volume estimé : 1000/an
```

#### 6. interventions
```typescript
Index composés :
- siteId (ASC) + statut (ASC) + datePrevue (DESC)
- equipeId (ASC) + datePrevue (ASC)
- statut (ASC) + facturee (ASC)
- devisId (ASC)
- numero (ASC)

Règles sécurité :
allow read: if request.auth != null;
allow write: if request.auth.token.role in ['admin', 'operateur'];

Taille moyenne document : 3 KB
Volume estimé : 3000/an
```

#### 7. notes_de_frais ⭐ Session 2
```typescript
Index composés :
- operateurId (ASC) + statut (ASC) + date (DESC)
- statut (ASC) + date (DESC)
- numero (ASC)

Règles sécurité :
allow read: if request.auth != null;
allow create: if request.auth.uid == request.resource.data.operateurId;
allow update: if request.auth.token.role == 'admin' || 
               request.auth.uid == resource.data.operateurId && 
               resource.data.statut == 'brouillon';

Taille moyenne document : 4 KB (avec justificatifs URLs)
Volume estimé : 220/mois = 2640/an
```

#### 8. stock_equipements
```typescript
Index composés :
- actif (ASC) + type (ASC)
- quantiteStock (ASC) - pour alertes stock bas

Règles sécurité :
allow read: if request.auth != null;
allow write: if request.auth.token.role == 'admin';

Taille moyenne document : 2 KB
Volume : 50 équipements
```

#### 9. stock_mouvements
```typescript
Index composés :
- equipementId (ASC) + date (DESC)
- interventionId (ASC)
- type (ASC) + date (DESC)

Règles sécurité :
allow read: if request.auth != null;
allow create: if request.auth != null;

Taille moyenne document : 1 KB
Volume estimé : 5000/an
```

---

## 🔐 AUTHENTIFICATION & SÉCURITÉ

### Firebase Authentication (à activer)

#### Providers configurés
```
- Email/Password (principal)
- Google OAuth (optionnel)
```

#### Rôles utilisateurs
```typescript
interface UserClaims {
  role: 'super_admin' | 'admin' | 'operateur' | 'client'
  societeId?: string // Pour multi-sociétés
  equipeId?: string // Pour opérateurs
}
```

#### Règles par rôle
```
super_admin (Jerome/Axel) :
├─ Accès complet toutes données
├─ Modification configuration système
├─ Gestion utilisateurs
└─ Validation notes de frais

admin :
├─ Accès complet données opérationnelles
├─ Création devis/factures
├─ Gestion planning
└─ Consultation finances

operateur :
├─ Consultation interventions affectées
├─ Création notes de frais personnelles
├─ Upload rapports terrain
└─ Modification stock (mouvements)

client :
├─ Consultation interventions sites liés
├─ Téléchargement rapports
├─ Consultation factures
└─ Messagerie
```

### Règles sécurité Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Fonction helper rôles
    function hasRole(role) {
      return request.auth != null && 
             request.auth.token.role == role;
    }
    
    function isAdmin() {
      return hasRole('admin') || hasRole('super_admin');
    }
    
    // Groupes clients
    match /groupes_clients/{groupeId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Clients
    match /clients/{clientId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Sites
    match /sites/{siteId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Devis
    match /devis/{devisId} {
      allow read: if request.auth != null;
      allow create: if isAdmin();
      allow update, delete: if isAdmin();
    }
    
    // Factures
    match /factures/{factureId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    // Interventions
    match /interventions/{interventionId} {
      allow read: if request.auth != null;
      allow create: if isAdmin();
      allow update: if isAdmin() || 
                      (hasRole('operateur') && 
                       request.auth.uid in resource.data.operateurIds);
    }
    
    // Notes de frais ⭐ Session 2
    match /notes_de_frais/{noteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if isAdmin() || 
                      (request.auth.uid == resource.data.operateurId && 
                       resource.data.statut == 'brouillon');
      allow delete: if isAdmin();
    }
  }
}
```

---

## 📧 CONFIGURATION EMAIL

### SMTP IONOS

```typescript
// Configuration
const smtp = {
  host: 'smtp.ionos.fr',
  port: 587,
  secure: false, // TLS
  auth: {
    user: process.env.SMTP_USER, // jerome@solairenettoyage.fr
    pass: process.env.SMTP_PASS
  }
}

// Envoi email
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter(smtp);

await transporter.sendMail({
  from: '"Solaire Nettoyage" <jerome@solairenettoyage.fr>',
  to: 'client@exemple.fr',
  subject: 'Devis DEV-2026-0001',
  html: htmlContent,
  attachments: [{
    filename: 'devis.pdf',
    content: pdfBuffer
  }]
});
```

### IMAP Rapports Praxedo

```typescript
// Configuration
const imap = {
  user: 'rapports@solairenettoyage.fr',
  password: process.env.IMAP_PASS,
  host: 'imap.ionos.fr',
  port: 993,
  tls: true
}

// Récupération emails
import Imap from 'node-imap';

const connection = new Imap(imap);

connection.once('ready', () => {
  connection.openBox('INBOX', false, (err, box) => {
    connection.search(['UNSEEN', ['FROM', 'noreply@praxedo.com']], (err, results) => {
      // Traitement emails
    });
  });
});
```

---

## 📊 GÉNÉRATION PDF

### Configuration jsPDF

```typescript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Configuration document
const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

// Polices
doc.setFont('helvetica');

// Logo
const logoBase64 = '...'; // Logo Solaire Nettoyage en base64
doc.addImage(logoBase64, 'PNG', 15, 15, 50, 20);

// En-tête entreprise
doc.setFontSize(10);
doc.text('SOLAIRE NETTOYAGE', 15, 45);
doc.text('123 Rue Exemple', 15, 50);
doc.text('31000 Toulouse', 15, 55);
doc.text('SIRET: 123 456 789 00012', 15, 60);

// Tableau lignes (avec autotable)
doc.autoTable({
  startY: 100,
  head: [['Site', 'Désignation', 'Qté', 'PU HT', 'Total HT']],
  body: lignes.map(l => [
    l.siteNom,
    l.designation,
    l.quantite,
    l.prixUnitaireHT.toFixed(2) + ' €',
    l.montantHT.toFixed(2) + ' €'
  ]),
  theme: 'grid',
  headStyles: { fillColor: [0, 51, 102] }
});

// Totaux
const finalY = doc.lastAutoTable.finalY + 10;
doc.text(`Total HT: ${totalHT.toFixed(2)} €`, 140, finalY);
doc.text(`TVA 20%: ${totalTVA.toFixed(2)} €`, 140, finalY + 5);
doc.setFontSize(12);
doc.setFont('helvetica', 'bold');
doc.text(`Total TTC: ${totalTTC.toFixed(2)} €`, 140, finalY + 12);

// Mentions légales
doc.setFontSize(8);
doc.text('TVA non applicable - Article 293B du CGI', 15, 280);

// Sauvegarde
doc.save('devis.pdf');
```

---

## 🎨 COMPOSANTS UI RÉUTILISABLES

### Button Component

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'success'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  onClick?: () => void
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  loading,
  icon,
  onClick,
  children
}) => {
  const baseClass = "flex items-center gap-2 rounded font-medium transition"
  
  const variantClass = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700"
  }
  
  const sizeClass = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  }
  
  return (
    <button
      className={`${baseClass} ${variantClass[variant]} ${sizeClass[size]}`}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <Spinner /> : icon}
      {children}
    </button>
  )
}
```

### Modal Component

```typescript
// components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer
}) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-6 border-t">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 🔄 PATTERNS DE CODE

### Gestion état formulaire

```typescript
// Pattern avec React Hook Form + Zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  raisonSociale: z.string().min(2, 'Minimum 2 caractères'),
  siret: z.string().regex(/^\d{14}$/, 'SIRET invalide'),
  email: z.string().email('Email invalide')
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema)
});

const onSubmit = async (data: FormData) => {
  try {
    await createClient(data);
    toast.success('Client créé');
    router.push('/admin/crm/clients');
  } catch (error) {
    toast.error('Erreur création');
  }
};
```

### Gestion chargement données

```typescript
// Pattern avec state management
const [loading, setLoading] = useState(true);
const [data, setData] = useState<Client[]>([]);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function loadData() {
    try {
      setLoading(true);
      const clients = await getAllClients();
      setData(clients);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  loadData();
}, []);

if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;
if (data.length === 0) return <EmptyState />;

return <ClientsList clients={data} />;
```

### Optimistic Updates

```typescript
// Pattern pour UX réactive
const handleDelete = async (id: string) => {
  // Update UI immédiatement
  setClients(prev => prev.filter(c => c.id !== id));
  
  try {
    // Backend
    await deleteClient(id);
    toast.success('Client supprimé');
  } catch (error) {
    // Rollback si erreur
    setClients(prev => [...prev, deletedClient]);
    toast.error('Erreur suppression');
  }
};
```

---

## ⚡ OPTIMISATIONS PERFORMANCES

### Pagination Firestore

```typescript
// Pattern pagination infinie
const LIMIT = 20;
let lastVisible = null;

async function loadMore() {
  let query = collection(db, 'clients')
    .orderBy('createdAt', 'desc')
    .limit(LIMIT);
  
  if (lastVisible) {
    query = query.startAfter(lastVisible);
  }
  
  const snapshot = await getDocs(query);
  lastVisible = snapshot.docs[snapshot.docs.length - 1];
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

### Debounce recherche

```typescript
// Pattern recherche temps réel
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  async (term: string) => {
    if (term.length < 2) return;
    
    const results = await searchClients(term);
    setResults(results);
  },
  500 // 500ms delay
);

<input 
  type="text"
  onChange={(e) => debouncedSearch(e.target.value)}
  placeholder="Rechercher..."
/>
```

### Lazy loading images

```typescript
// Pattern chargement progressif
<img
  src={imageUrl}
  loading="lazy"
  alt="Description"
  className="w-full h-auto"
/>
```

---

## 🧪 TESTS (À IMPLÉMENTER)

### Tests unitaires

```typescript
// Jest + React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Tests intégration

```typescript
// Tests Firebase
import { createClient, getClientById } from '@/lib/firebase/clients';

describe('Clients API', () => {
  it('creates and retrieves client', async () => {
    const clientData = {
      raisonSociale: 'Test Client',
      siret: '12345678900012',
      // ...
    };
    
    const clientId = await createClient(clientData);
    const client = await getClientById(clientId);
    
    expect(client.raisonSociale).toBe('Test Client');
  });
});
```

---

## 📱 PWA CONFIGURATION (Future App Mobile)

### manifest.json

```json
{
  "name": "Solaire Nettoyage - App Terrain",
  "short_name": "SN Terrain",
  "description": "Application terrain pour opérateurs",
  "start_url": "/operateur",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0033cc",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker

```typescript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('sn-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/operateur',
        '/styles/globals.css',
        '/icon-192.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

**Date spécifications :** 2 Janvier 2026, 15h40  
**Version :** v1.2 (Session 2)
