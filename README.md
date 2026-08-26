# BV Esports - Free Fire Team Management Platform

A professional esports team management web application built for **BV Esports** Free Fire team.

## Features

- **Role-Based Access Control (RBAC)** — Owner, Admin, Manager, Player roles with granular permissions
- **Player Management** — Full player profiles, roster management, role assignment
- **Finance Management** — Income/expense tracking, financial charts, transaction history
- **Announcements** — Team-wide announcements with priority levels
- **Activity Logs** — Audit trail of all team operations
- **Team Settings** — Team profile, logo, social links management
- **Dashboard** — Role-based dashboard with statistics and charts
- **Responsive Design** — Works on desktop, tablet, and mobile

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS v4
- React Router v7
- Recharts (charts)
- Lucide React (icons)
- Axios (HTTP client)
- Firebase Client SDK (authentication)

### Backend
- Node.js + Express.js
- Firebase Admin SDK (Firestore, Auth, Storage)
- Helmet (security headers)
- Morgan (logging)

### Database
- Cloud Firestore (NoSQL)
- Firebase Authentication
- Firebase Storage

## Project Structure

```
Team BV/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── layout/     # Sidebar, Navbar, AppLayout
│   │   │   └── ui/         # Shared UI elements
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── services/       # API services
│   │   ├── utils/          # Utilities, constants, permissions
│   │   └── config/         # Firebase config, team config
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # Firebase & roles config
│   ├── middleware/          # Auth & RBAC middleware
│   ├── routes/             # API routes
│   ├── controllers/        # (Future: business logic)
│   ├── services/           # (Future: services)
│   └── utils/              # Helpers
├── firebase/               # Firebase security rules
│   ├── firestore.rules
│   └── storage.rules
├── .env.example
└── package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Firebase project with Firestore, Auth, and Storage enabled
- npm or yarn

### 1. Clone & Install

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Firestore Database**
4. Enable **Authentication** (Email/Password provider)
5. Enable **Storage**

#### Get Service Account Key (for backend)

1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file
4. Copy the entire JSON content

### 3. Environment Variables

#### Server `.env` (in `/server/.env`)

```bash
# Firebase Admin
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Admin email (for initial setup)
ADMIN_EMAIL=admin@bvesports.com
```

#### Client `.env` (in `/client/.env`)

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Deploy Firebase Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 5. Run the Application

```bash
# From root directory
npm run dev

# Or run separately:
npm run dev:server    # Backend on port 5000
npm run dev:client    # Frontend on port 5173
```

### 6. Initial Owner Setup

1. Register a new user at `/register`
2. In Firebase Console, manually update that user's document in the `users` collection:
   ```json
   {
     "accountRole": "Owner"
   }
   ```
3. Or use Firebase Admin SDK / Cloud Functions to set the first owner securely.

## API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | No | - | Register new player |
| POST | `/api/auth/create-user` | Yes | Admin+ | Create user with role |
| GET | `/api/auth/me` | Yes | Any | Get current user |
| GET | `/api/auth/users` | Yes | Admin+ | List all users |
| PUT | `/api/auth/users/:uid/role` | Yes | Owner | Change user role |
| DELETE | `/api/auth/users/:uid` | Yes | Owner | Delete user |
| GET | `/api/players` | Yes | Any | List players |
| POST | `/api/players` | Yes | Manager+ | Create player |
| PUT | `/api/players/:id` | Yes | Manager+ | Update player |
| DELETE | `/api/players/:id` | Yes | Admin+ | Delete player |
| PUT | `/api/players/:id/role` | Yes | Manager+ | Update player role |
| GET | `/api/transactions` | Yes | Manager+ | List transactions |
| GET | `/api/transactions/summary` | Yes | Manager+ | Finance summary |
| POST | `/api/transactions` | Yes | Manager+ | Create transaction |
| PUT | `/api/transactions/:id` | Yes | Manager+ | Update transaction |
| DELETE | `/api/transactions/:id` | Yes | Manager+ | Delete transaction |
| GET | `/api/announcements` | Yes | Any | List announcements |
| POST | `/api/announcements` | Yes | Manager+ | Create announcement |
| DELETE | `/api/announcements/:id` | Yes | Admin+ | Delete announcement |
| GET | `/api/activity` | Yes | Admin+ | Activity logs |
| GET | `/api/team` | Yes | Any | Team settings |
| PUT | `/api/team` | Yes | Owner | Update team settings |
| GET | `/api/stats` | Yes | Any | Dashboard stats |

## Role Permissions Matrix

| Feature | Owner | Admin | Manager | Player |
|---------|-------|-------|---------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Manage Players | ✅ | ✅ | ✅ | ❌ |
| Delete Players | ✅ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ✅ | ✅ | ❌ |
| Manage Finance | ✅ | ❌ | ✅ | ❌ |
| View Finance | ✅ | ✅ | ✅ | ❌ |
| Manage Announcements | ✅ | ✅ | ✅ | ❌ |
| View Announcements | ✅ | ✅ | ✅ | ✅ |
| View Activity Log | ✅ | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Team Settings | ✅ | ❌ | ❌ | ❌ |

## Player Game Roles

- IGL (In-Game Leader)
- Rusher
- Support
- Sniper
- Assaulter
- Fragger
- Substitute
- Coach
- Analyst

## Player Statuses

- Active
- Inactive
- Substitute
- Trial
- Former Member
- Banned

## Security Notes

- Firebase Security Rules enforce data access at the database level
- Server-side middleware verifies authentication and authorization on every API call
- Client-side permission checks control UI visibility
- Sensitive financial data is restricted to Manager+ roles
- Owner role is protected from self-modification
- User registration only creates Player accounts; higher roles require admin assignment
- All passwords are hashed by Firebase Authentication
- Service account credentials are stored in environment variables

## Future Features

This architecture supports adding:

- Tournament management
- Match results & scrim tracking
- Player statistics (K/D, headshot rate, etc.)
- Salary management
- Sponsorship tracking
- Team calendar
- Discord/Telegram integrations
- Player contracts
- Merchandise management
- Performance analytics

## Currency

Default currency is Bangladeshi Taka (৳). Update in `utils/constants.js` as needed.

---

Built for **BV Esports** — Professional Free Fire Esports Team
