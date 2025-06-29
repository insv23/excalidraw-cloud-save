# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Excalidraw Cloud Save is a full-stack application that combines Better Auth authentication with Excalidraw canvas functionality. The project implements a unified sidebar layout for managing and editing drawings with comprehensive user authentication and cloud storage capabilities.

## Architecture

### Full-Stack Structure
- **Backend** (`/backend`): Hono web framework with Better Auth, Drizzle ORM, and SQLite database
- **Frontend** (`/frontend`): React 19 + Vite application with shadcn/ui components and Tailwind CSS
- **Database**: SQLite with Drizzle ORM for schema management
- **Authentication**: Better Auth for session management and user authentication

### Key Technologies
- **Frontend**: React 19, React Router, Vite, shadcn/ui, Tailwind CSS, Zustand, Excalidraw
- **Backend**: Hono, Better Auth, Drizzle ORM, SQLite, Consola logging
- **Build Tools**: TypeScript, ESLint, tsup (backend bundling)

## Development Commands

### Backend Development
```bash
cd backend
npm install
npm run dev              # Start development server with hot reload
npm run build           # Build for production
npm run start           # Start production server
npm run db:push         # Push schema changes to database
npm run db:generate     # Generate migration files
npm run db:migrate      # Run database migrations
npm run auth:generate   # Generate Better Auth schema
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev             # Start development server
npm run build           # Build for production (includes TypeScript compilation)
npm run lint            # Run ESLint
npm run preview         # Preview production build
```

### Docker Deployment
```bash
# Production deployment
mkdir data
docker compose --env-file .env.production up -d

# Rebuild from scratch
docker compose down -v && docker compose --env-file .env.production up -d --build --force-recreate
```

## Architecture Patterns

### Unified Sidebar Layout
The application uses a single `SidebarLayout` component that handles both drawing list view (`/`) and individual drawing view (`/:id`). This creates a consistent interface where users can always see their drawings list while working on a canvas.

### State Management Strategy
- **Authentication**: Better Auth with `useSession()` hook for user state
- **URL-driven State**: Drawing selection via URL params (`useParams`)
- **Reactive Data Flow**: `useMemo` for expensive calculations, `useEffect` for navigation side effects
- **Performance**: `React.memo` on `ExcalidrawCanvas`, intentional remounting via `key` prop

### Data Loading Pattern
The application separates metadata from content:
- **Metadata**: All drawing metadata loaded once (IDs, titles, states, permissions)
- **Content**: Drawing content (elements, appState, files) loaded on-demand
- **Local Filtering**: Client-side filtering for different drawing categories (recent, pinned, public, archived, trash)

### Access Control System
Implements a comprehensive permission matrix:
- **Public drawings**: Accessible to all users
- **Private drawings**: Only accessible to owners
- **Deleted drawings**: Only accessible to owners in trash view
- **Authentication states**: Different UIs for logged-in vs anonymous users

## Database Schema

### Core Tables
- `drawings`: Metadata (id, title, owner_id, is_pinned, is_public, is_archived, is_deleted, timestamps)
- `drawing_content`: Canvas data (drawing_id, elements, app_state, files as JSONB)
- Better Auth tables: Users, sessions, accounts, etc.

### Drawing State Logic
- **Soft deletion**: `is_deleted` flag with `deleted_at` timestamp
- **State combinations**: Drawings can be pinned AND public AND archived simultaneously
- **Exclusive deleted state**: Deleted drawings don't appear in other categories

## Component Organization

### Key Components
- `pages/sidebar-layout.tsx`: Main orchestrator for layout, data fetching, and access control
- `components/sidebar/app-sidebar.tsx`: Interactive sidebar with search and category switching
- `components/sidebar-inset/excalidraw-canvas.tsx`: Memoized Excalidraw wrapper
- `components/auth/`: Authentication forms (login, register)
- `components/theme/`: Dark mode support components

### UI Component Library
Uses shadcn/ui with comprehensive form components:
- Input variants: email, phone, password (with strength), OTP verification
- Layout: sidebar, cards, tabs, separators, breadcrumbs
- Interactive: buttons, checkboxes, dropdowns, switches

## Environment and Configuration

### Environment Variables
- **Backend**: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DB_FILE_NAME`, `CORS_ALLOWED_ORIGINS`
- **Frontend**: `VITE_API_BASE_URL`
- **Production**: Uses `.env.production` file for Docker deployment

### Build Configuration
- **Frontend**: Vite with React plugin, TypeScript strict mode
- **Backend**: tsup bundling to ESM format targeting Node 18
- **Database**: Drizzle migrations in `/backend/drizzle/` directory

## Special Considerations

### Excalidraw Integration
- Canvas component uses `key={drawingId}` for intentional remounting between drawings
- Prevents state leakage between different drawing sessions
- Drawing content loaded separately from metadata for performance

### Mobile Responsiveness
- `useIsMobile` hook for responsive behavior
- Sidebar auto-closes on mobile navigation
- Currently desktop-focused due to Excalidraw limitations

### Security Features
- Better Auth handles CSRF protection and secure headers
- Session management with configurable expiration
- Input validation on both client and server side
- No sensitive data in client-side code

## Common Development Patterns

### Testing
Check package.json scripts for available test commands. No test framework currently configured.

### Linting and Type Checking
- Frontend: `npm run lint` (ESLint)
- Build process includes TypeScript compilation: `tsc -b && vite build`
- Always run build command to verify TypeScript correctness

### Database Operations
- Use `npm run db:push` for schema changes during development
- Use `npm run db:generate` followed by `npm run db:migrate` for production
- Database file stored in `/backend/local.db` for development