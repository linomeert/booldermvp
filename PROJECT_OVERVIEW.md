# 🧗 Climbing Log MVP - Project Overview

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│                    (React + TypeScript)                     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │    Pages     │  │  Components  │  │   Context    │    │
│  │              │  │              │  │              │    │
│  │ • Feed       │  │ • ClimbCard  │  │ • Auth       │    │
│  │ • Profile    │  │ • Session    │  │              │    │
│  │ • Login      │  │ • Navbar     │  │              │    │
│  │ • LogClimb   │  │ • Tabs       │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐                       │
│  │  API Client  │  │ React Query  │                       │
│  │              │  │              │                       │
│  │ • apiGet()   │  │ • Caching    │                       │
│  │ • apiPost()  │  │ • State Mgmt │                       │
│  └──────────────┘  └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JSON
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│                 (Express + TypeScript)                      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Routes     │  │ Controllers  │  │  Middleware  │    │
│  │              │  │              │  │              │    │
│  │ • /auth      │  │ • auth       │  │ • JWT Auth   │    │
│  │ • /users     │  │ • users      │  │ • Error      │    │
│  │ • /climbs    │  │ • climbs     │  │              │    │
│  │ • /sessions  │  │ • sessions   │  │              │    │
│  │ • /feed      │  │ • feed       │  │              │    │
│  │ • /locations │  │ • locations  │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────┐         │
│  │            Prisma ORM                        │         │
│  └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                        │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Users   │  │  Climbs  │  │ Sessions │  │   Gyms   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐                                              │
│  │  Crags   │                                              │
│  └──────────┘                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### User Registration/Login

```
User → LoginPage → AuthContext → API Client → /auth/register → AuthController
  → Prisma → PostgreSQL → JWT Token → Store in localStorage → Redirect to Feed
```

### Logging a Climb

```
User → LogClimbPage → Form Submit → API Client → /climbs (POST)
  → ClimbController → Prisma → PostgreSQL → Update Session Stats
  → React Query Invalidation → Feed Refresh
```

### Viewing Profile

```
User → ProfilePage → useQuery → API Client → /users/:username (GET)
  → UserController → Prisma → PostgreSQL → Calculate Stats
  → Display with ProfileHeader + Tabs (Tops/Projects/Sessions)
```

## Key Features Implementation

### 1. Authentication Flow

- **Registration**: Email, password, name, username → bcrypt hash → Store in DB
- **Login**: Credentials → Verify with bcrypt → Generate JWT → Return token
- **Protected Routes**: JWT middleware validates token on every request

### 2. Climb Logging

- Status: Top or Project
- Location: Indoor (Gym) or Outdoor (Crag)
- Grade, Style, Attempts, Notes, Media URL
- Optional: Link to active Session

### 3. Sessions

- Start session → Log multiple climbs → End session
- Auto-calculate: Total climbs, Tops count, Projects count, Duration
- Display in profile and detail page

### 4. Profile System

- User stats: Total tops, total projects, sessions count, hardest grade
- Tabs: Tops (grid), Projects (list), Sessions (cards)
- View own profile or other users' profiles

### 5. Feed

- Recent tops from all users
- Displays: User info, Climb grade, Location, Media, Notes
- Time-ago formatting for recent activity

## Component Hierarchy

```
App
├── BrowserRouter
│   ├── AuthProvider
│   │   ├── QueryClientProvider
│   │   │   ├── Navbar
│   │   │   └── Routes
│   │   │       ├── LoginPage
│   │   │       ├── RegisterPage
│   │   │       ├── FeedPage
│   │   │       │   ├── FeedItemCard (multiple)
│   │   │       │   └── FloatingActionButton
│   │   │       ├── ProfilePage
│   │   │       │   ├── ProfileHeader
│   │   │       │   └── Tabs
│   │   │       │       ├── ClimbCard (grid)
│   │   │       │       ├── ProjectCard (list)
│   │   │       │       └── SessionCard (grid)
│   │   │       ├── SessionDetailPage
│   │   │       │   └── ClimbCard (multiple)
│   │   │       └── LogClimbPage
│   │   │           └── Form
```

## Tech Decisions

### Backend

- **Express**: Simple, widely-used Node.js framework
- **Prisma**: Type-safe ORM with great TypeScript support
- **PostgreSQL**: Robust relational database for structured data
- **JWT**: Stateless authentication, easy to scale

### Frontend

- **React**: Component-based, great ecosystem
- **Vite**: Fast build tool, better DX than CRA
- **React Query**: Automatic caching, background refetching
- **Tailwind CSS**: Utility-first, rapid styling

## API Endpoints Summary

| Method | Endpoint          | Auth | Description        |
| ------ | ----------------- | ---- | ------------------ |
| POST   | /auth/register    | ❌   | Register new user  |
| POST   | /auth/login       | ❌   | Login user         |
| GET    | /users/me         | ✅   | Get current user   |
| GET    | /users/:username  | ❌   | Get user profile   |
| POST   | /climbs           | ✅   | Create climb       |
| GET    | /climbs/me        | ✅   | Get my climbs      |
| GET    | /climbs/:id       | ❌   | Get climb detail   |
| POST   | /sessions         | ✅   | Create session     |
| PATCH  | /sessions/:id/end | ✅   | End session        |
| GET    | /sessions/me      | ✅   | Get my sessions    |
| GET    | /sessions/:id     | ❌   | Get session detail |
| GET    | /feed             | ❌   | Get recent tops    |
| GET    | /locations/gyms   | ❌   | Get all gyms       |
| GET    | /locations/crags  | ❌   | Get all crags      |

## Database Schema Relationships

```
User (1) ──────< (many) Climb
User (1) ──────< (many) Session

Session (1) ────< (many) Climb

Gym (1) ────────< (many) Climb
Gym (1) ────────< (many) Session

Crag (1) ───────< (many) Climb
Crag (1) ───────< (many) Session
```

## State Management

- **Global State**: Auth context (user, token, login/logout methods)
- **Server State**: React Query (automatic caching, refetching)
- **Local State**: React useState for forms and UI state
- **Storage**: localStorage for JWT token persistence

## Styling Approach

- **Tailwind CSS** utility classes for rapid development
- **Color scheme**: Primary blue (climbing-related), green (tops), amber (projects)
- **Responsive**: Mobile-first with responsive breakpoints
- **Components**: Cards, badges, grids for visual hierarchy
- **Icons**: Emoji for quick visual recognition (🧗, 🏢, ⛰️)
