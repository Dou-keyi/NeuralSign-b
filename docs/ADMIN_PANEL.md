# NeuralSign Admin Panel

Complete admin panel for managing NeuralSign platform content, users, and settings.

## Quick Start

### 1. Admin Credentials

The platform is configured to recognize a single admin account.

**Credentials:**
- **Email:** `admin@neuralsign.com`
- **Password:** `Admin@1234` (To be set in Firebase Console)

### 2. Set Up Your Admin in Firestore

After logging into the app with the credentials above, run this in your browser console to grant Super Admin permissions in the database:

```javascript
// Replace with the UID found in Firebase Console > Authentication for admin@neuralsign.com
setupSuperAdmin('ADMIN_UID', 'admin@neuralsign.com');
```

### 3. Access the Admin Panel

Navigate to `/admin` — you'll see the admin dashboard if you have the correct permissions.

---

## Features

| Feature | Route | Description |
|---------|-------|-------------|
| Dashboard | `/admin` | Stats overview & quick actions |
| Words CRUD | `/admin/words` | Create, edit, delete word signs |
| Word Editor | `/admin/words/new` | Comprehensive word creation form |
| Categories | `/admin/categories` | Manage & reorder categories |
| Bulk Upload | `/admin/upload` | Upload multiple videos at once |
| Users | `/admin/users` | View user accounts & progress |
| Analytics | `/admin/analytics` | Charts & data export |
| Settings | `/admin/settings` | System configuration |

---

## Roles & Permissions

| Permission | Super Admin | Content Admin | Moderator | Viewer |
|-----------|:-----------:|:-------------:|:---------:|:------:|
| Create Words | ✅ | ✅ | ❌ | ❌ |
| Edit Words | ✅ | ✅ | ✅ | ❌ |
| Delete Words | ✅ | ❌ | ❌ | ❌ |
| Publish Words | ✅ | ✅ | ❌ | ❌ |
| Create Categories | ✅ | ✅ | ❌ | ❌ |
| Edit Categories | ✅ | ✅ | ❌ | ❌ |
| Delete Categories | ✅ | ❌ | ❌ | ❌ |
| Upload Videos | ✅ | ✅ | ❌ | ❌ |
| View Users | ✅ | ✅ | ✅ | ✅ |
| Edit Users | ✅ | ❌ | ✅ | ❌ |
| Manage Admins | ✅ | ❌ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ✅ |
| Export Data | ✅ | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

---

## Architecture

```
src/
├── config/adminConfig.js          # Roles, permissions, helpers
├── context/AdminContext.jsx        # Admin auth state & permission checking
├── components/admin/
│   ├── ProtectedAdminRoute.jsx    # Route guard for admin pages
│   └── VideoUploader.jsx          # Single video upload component
├── pages/admin/
│   ├── AdminDashboard.jsx         # Layout with sidebar + stats overview
│   ├── WordsManagement.jsx        # Words list, search, filter, delete
│   ├── WordEditor.jsx             # Create/edit word form
│   ├── CategoriesManagement.jsx   # Category CRUD with reordering
│   ├── BulkUpload.jsx             # Multi-video upload system
│   ├── UsersManagement.jsx        # User list & activity monitoring
│   ├── Analytics.jsx              # Charts & data visualization
│   └── SystemSettings.jsx         # Platform configuration
└── scripts/setupAdmin.js          # Initial admin user setup
```

### Key Design Decisions

- **Admin routes render without Navbar/Footer** — the admin panel has its own sidebar layout
- **AdminProvider wraps the entire app** — admin state is checked once at the top level
- **Permission checks are granular** — each action checks the specific permission, not just the role
- **Firestore `admins` collection** — admin roles are stored as documents keyed by Firebase UID
- **Settings saved to localStorage** — for demo purposes; migrate to Firestore for production

---

## Granting Admin Roles

From the browser console (as a super admin):

```javascript
// Grant content admin role
grantAdminRole('USER_UID', 'content_admin');

// Grant moderator role
grantAdminRole('USER_UID', 'moderator');

// Grant viewer role
grantAdminRole('USER_UID', 'viewer');
```

---

## Firestore Collections

### `admins` collection
```json
{
  "role": "super_admin",
  "email": "admin@neuralsign.com",
  "grantedBy": "system",
  "grantedAt": "timestamp",
  "active": true
}
```

### `signs` collection (words)
```json
{
  "englishText": "Please",
  "aslGloss": "PLEASE",
  "category": "polite-expressions",
  "difficulty": 1,
  "status": "published",
  "videoUrl": "https://...",
  "thumbnailUrl": "https://...",
  "description": "...",
  "tags": ["basic", "polite"]
}
```

### `categories` collection
```json
{
  "name": "Polite Expressions",
  "icon": "👋",
  "description": "Common courtesy phrases",
  "color": "#6366F1",
  "order": 0
}
```
