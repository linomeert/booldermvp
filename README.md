# 🧗 Climbing Log MVP

A full-stack climbing logging application built with Express + TypeScript backend and React + TypeScript frontend.

## Features

- **Authentication**: JWT-based user registration and login
- **Climb Logging**: Log tops and projects with grades, location, style, and notes
- **Sessions**: Create climbing sessions and track multiple climbs
- **Profile**: View personal stats, tops, projects, and session history
- **Feed**: See recent climbs from all users
- **Gyms & Crags**: Support for both indoor and outdoor climbing locations

## Tech Stack

### Backend

- Node.js + Express
- TypeScript
- PostgreSQL with Prisma ORM
- JWT Authentication
- bcrypt for password hashing

### Frontend

- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- TanStack Query (React Query) for data fetching
- Tailwind CSS for styling

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration (database, env)
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth & error handling
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   ├── index.ts         # Express app entry
│   │   └── seed.ts          # Database seeding
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # API client & endpoints
    │   ├── components/      # Reusable UI components
    │   ├── context/         # Auth context
    │   ├── pages/           # Page components
    │   ├── types/           # TypeScript types
    │   ├── App.tsx          # Root component
    │   └── main.tsx         # Entry point
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file with your database credentials:**

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/climbing_log?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3001
   NODE_ENV=development
   ```

5. **Run Prisma migrations:**

   ```bash
   npm run prisma:migrate
   ```

6. **Generate Prisma client:**

   ```bash
   npm run prisma:generate
   ```

7. **Seed the database (optional - adds sample gyms and crags):**

   ```bash
   npm run seed
   ```

8. **Start the development server:**

   ```bash
   npm run dev
   ```

   The backend API will be running at `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The frontend will be running at `http://localhost:3000`

### First Time Setup - Quick Start

If you want to run both backend and frontend:

```bash
# Terminal 1 - Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URL
npm run seed
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users

- `GET /users/me` - Get current user profile
- `GET /users/:username` - Get user by username

### Climbs

- `POST /climbs` - Create new climb
- `GET /climbs/me` - Get my climbs (supports ?status=top/project filters)
- `GET /climbs/:id` - Get climb by ID

### Sessions

- `POST /sessions` - Create new session
- `PATCH /sessions/:id/end` - End a session
- `GET /sessions/me` - Get my sessions
- `GET /sessions/:id` - Get session by ID

### Feed

- `GET /feed` - Get recent climbs feed

### Locations

- `GET /locations/gyms` - Get all gyms
- `GET /locations/crags` - Get all crags

## Database Schema

### User

- id, email, password, name, username, avatarUrl

### Climb

- id, userId, sessionId, status (top/project), locationType (indoor/outdoor)
- gymId, cragId, grade, style, attempts, mediaUrl, notes

### Session

- id, userId, locationType, gymId, cragId
- startedAt, endedAt, durationSeconds
- climbCount, topsCount, projectsCount, hardestGrade, syncedToStrava

### Gym

- id, name, city, country

### Crag

- id, name, area, country

## Development Commands

### Backend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run seed         # Seed database with sample data
```

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Future Enhancements

- Image upload for climb media
- Follow/unfollow users
- Comments on climbs
- Strava integration
- Statistics and analytics
- Route/problem database
- Ticklist functionality
- Training plans
- Search and filters

## License

MIT
