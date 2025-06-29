# Excalidraw Cloud Save

Self-hosted Excalidraw with files saved to your own server for better management

<img width="1551" alt="image" src="https://github.com/user-attachments/assets/395d66f8-b88b-47d8-880b-c48f8e3f3a94" />

A full-featured self-hosted Excalidraw cloud save application with 
- Better Auth authentication,
- SQLite database storage, and
- modern sidebar interface.
- Users can create, edit, save, and share drawings with all data stored on your own server.

## ✨ Core Features

### 🎨 Excalidraw Integration
- **Complete Excalidraw Functionality** - Supports all native drawing tools and gestures
- **Real-time Auto-save** - 2-second delay auto-save to prevent data loss
- **Manual Save Support** - Ctrl/Cmd+S keyboard shortcut for manual save
- **Theme Synchronization** - Light/dark theme support with system settings sync
- **Conflict Detection** - Multi-session editing conflict detection and alerts

### 🔐 Complete Authentication System
- **Email/Password Authentication** - Email registration and login support
- **Phone Verification** - OTP verification code login support
- **Remember Me Functionality** - Persistent login sessions (configurable 30 days)
- **Session Management** - Secure token storage and cross-tab synchronization

### 📁 Drawing Management Features
- **Category Management** - Recent, pinned, public, archived, trash categories
- **Search Functionality** - Quick search drawings by title
- **Permission Control** - Private/public drawing access permission management
- **Soft Delete** - Trash recovery functionality
- **Batch Operations** - Pin, archive, delete and other batch operations

### 🎯 Modern Interface
- **Unified Sidebar Layout** - Drawing list and canvas in the same interface
- **Responsive Design** - Mobile-friendly interface adaptation
- **Editable Title and Description** - Click to edit drawing metadata directly
- **Save Status Indicator** - Real-time display of save status and unsaved changes
- **shadcn/ui Components** - Modern UI component library

## 🏗️ Technical Architecture

### Backend (`/backend`)

**Tech Stack:**
- **Runtime**: Node.js 18+ 
- **Framework**: Hono (lightweight web framework)
- **Authentication**: Better Auth (modern auth library)
- **Database**: Drizzle ORM + SQLite
- **Logging**: Consola (beautiful console logger)
- **Build**: tsup (ESM format build)

**Core Features:**
- RESTful API design with complete CRUD operations
- Role-based access control system
- Separate storage for drawing metadata and content
- Optimistic locking to prevent edit conflicts
- Automatic database migration and schema management

### Frontend (`/frontend`)

**Tech Stack:**
- **Build Tool**: Vite 6.x
- **Framework**: React 19+ with TypeScript
- **Routing**: React Router 7.x
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 4.x
- **State Management**: Zustand + React Hooks
- **Drawing Engine**: @excalidraw/excalidraw

**Core Features:**
- Single-page application architecture with unified sidebar layout
- Performance-optimized component rendering (React.memo)
- Client-side data filtering and categorization
- Responsive interface design
- Dark/light theme support

## 📁 Project Structure

```
excalidraw-cloud-save/
├── backend/                    # Backend API service
│   ├── src/
│   │   ├── db/                # Database schema and connections
│   │   │   ├── auth.schema.ts # Better Auth tables
│   │   │   ├── drawing.schema.ts # Drawing tables
│   │   │   └── index.ts       # Database connection config
│   │   ├── lib/               # Utilities and middleware
│   │   │   ├── auth.ts        # Better Auth configuration
│   │   │   ├── drawings.ts    # Drawing business logic
│   │   │   └── env.ts         # Environment variable validation
│   │   ├── routes/            # API route definitions
│   │   │   ├── drawings.ts    # Drawing metadata API
│   │   │   └── drawing-content.ts # Drawing content API
│   │   ├── types/             # TypeScript type definitions
│   │   └── index.ts           # Server entry point
│   ├── drizzle/               # Database migration files
│   ├── drizzle.config.ts      # Database configuration
│   └── package.json
│
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # shadcn/ui base components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── sidebar/      # Sidebar components
│   │   │   └── sidebar-inset/ # Main content area components
│   │   ├── pages/            # Page route components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions and configs
│   │   ├── store/            # Zustand state management
│   │   └── types/            # TypeScript type definitions
│   └── package.json
│
├── docker-compose.yml          # Docker deployment config
├── CLAUDE.md                   # AI assistant project guide
└── README.md                   # Project documentation
```

## 🚀 Development Guide

### Prerequisites

- Node.js (v18 or higher)
- npm package manager
- SQLite (automatically created in development)

### 1. Clone Project

```bash
git clone <repository-url>
cd excalidraw-cloud-save
```

### 2. Backend Setup

```bash
cd backend
npm install

# Initialize database
npm run db:push

# Start development server
npm run dev
```

**Backend Development Commands:**
```bash
npm run dev              # Start development server (hot reload)
npm run build           # Build for production
npm run start           # Start production server
npm run db:generate     # Generate database migration files
npm run db:migrate      # Run database migrations
npm run auth:generate   # Generate Better Auth tables
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

**Frontend Development Commands:**
```bash
npm run dev             # Start development server
npm run build           # Build for production (includes TypeScript compilation)
npm run lint            # Run ESLint code checking
npm run preview         # Preview production build
```

### 4. Access Application

- **Frontend Interface**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 🐳 Docker Production Deployment

### 1. Clone Project

```bash
git clone <repository-url>
cd excalidraw-cloud-save
```

### 2. Configure Environment Variables

```bash
cp .env.production.example .env.production
```

Edit the `.env.production` file and adjust all variable values according to your actual deployment requirements:

```env
# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=https://yourdomain.com
BETTER_AUTH_TRUSTED_ORIGINS=https://yourdomain.com

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Frontend API Configuration
VITE_API_BASE_URL=https://yourdomain.com

# Port Configuration
FRONTEND_HOST_PORT=80
BACKEND_HOST_PORT=3001

# Other Configuration
DISABLE_EMAIL_REGISTRATION=false
VITE_PREVIEW_ALLOWED_HOSTS=yourdomain.com
```

### 3. Start Application

```bash
# Create data directory
mkdir data

# Start services
docker compose --env-file .env.production up -d
```

### 4. Complete Rebuild (if needed)

```bash
# Stop and remove all containers and volumes
docker compose down -v

# Force rebuild and start
docker compose --env-file .env.production up -d --build --force-recreate
```

## 🔌 API Documentation

### Drawing Management API

#### `GET /api/drawings`
Get user's drawing list with category filtering and pagination support.

**Query Parameters:**
- `category`: `"recent"` | `"pinned"` | `"public"` | `"archived"` | `"trash"` (default: `"recent"`)
- `page`: Page number, minimum 1 (default: `1`)
- `pageSize`: Items per page, 1-100 (default: `50`)
- `search`: Title search keyword

#### `POST /api/drawings/:id`
Create new drawing using frontend-generated UUID.

#### `GET /api/drawings/:id`
Get drawing metadata with smart access control.

#### `PATCH /api/drawings/:id`
Update drawing metadata (requires ownership).

#### `DELETE /api/drawings/:id`
Permanently delete drawing (requires ownership).

### Drawing Content API

#### `GET /api/drawings/:id/content`
Get drawing canvas data.

#### `PUT /api/drawings/:id/content`
Save/update drawing canvas data with optimistic locking support.

### Authentication API

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login  
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session

For complete API documentation, please refer to the `CLAUDE.md` file.

## 🔒 Security Features

- **Password Requirements**: Minimum 8 characters with strength validation
- **Session Security**: Secure token generation and validation
- **Access Control**: Role-based permission management
- **Input Validation**: Client and server-side dual validation
- **CSRF Protection**: Built into Better Auth
- **Security Headers**: Configured in Hono middleware

## 🎨 UI Component Library

The application uses a complete set of shadcn/ui components:

- **Form Components**: Input, email input, phone input, password strength display
- **Layout Components**: Sidebar, cards, tabs, separators
- **Feedback Components**: Toast notifications, loading states, validation messages
- **Interactive Components**: Buttons, checkboxes, dropdown menus
- **Navigation Components**: Breadcrumbs, menu items, user avatar

## 🔧 Configuration and Environment Variables

### Backend Environment Variables
- `BETTER_AUTH_SECRET`: Authentication secret key
- `BETTER_AUTH_URL`: Application URL
- `BETTER_AUTH_TRUSTED_ORIGINS`: Trusted origins
- `CORS_ALLOWED_ORIGINS`: CORS allowed origins
- `DB_FILE_NAME`: SQLite database file path
- `DISABLE_EMAIL_REGISTRATION`: Disable email registration

### Frontend Environment Variables
- `VITE_API_BASE_URL`: Backend API base URL

## 📱 Device Support

- **Desktop**: Full feature support, optimal user experience
- **Mobile**: Responsive interface, auto-collapse sidebar
- **Tablet**: Adaptive layout, touch-friendly

Note: Due to Excalidraw limitations, mobile drawing experience may not be as smooth as desktop.

## 🚦 Performance Optimization

- **Component Lazy Loading**: React.memo and key remounting strategy
- **Data Separation**: Metadata and content loaded separately
- **Client-side Caching**: Zustand state management caching
- **Auto-save**: Debounced delayed save, reducing server requests
- **Optimistic Updates**: Immediate UI feedback, background sync

## 📋 Todo

- **Refactor Frontend Architecture** - Current implementation uses quick patches and needs proper architectural refactoring for maintainability and scalability
- **Image Support in Excalidraw Canvas** - Implement persistent image storage and retrieval to ensure images don't get lost when drawings are saved/loaded

## 🤝 Contributing

1. Fork this project
2. Create feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Excalidraw](https://excalidraw.com) - Excellent online drawing tool
- [Better Auth](https://better-auth.com) - Modern authentication library
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI component library
- [Hono](https://hono.dev) - Lightweight web framework
- [Drizzle ORM](https://drizzle.team) - TypeScript ORM
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

---

**Built with ❤️ using modern web technologies**
