# Better Auth + shadcn Sidebar

A modern full-stack authentication application built with Better Auth and shadcn/ui components, featuring a clean sidebar interface and comprehensive user authentication flow.

## 🚀 Features

- **Complete Authentication System** - Email/password and phone number authentication
- **Modern UI Components** - Built with shadcn/ui and Tailwind CSS
- **Responsive Sidebar Layout** - Collapsible sidebar with mobile support
- **Remember Me Functionality** - Persistent login sessions
- **Phone Number Verification** - OTP-based phone authentication
- **Real-time Validation** - Form validation with instant feedback
- **Dark Mode Support** - Light/Dark/System theme switching
- **Type Safety** - Full TypeScript support throughout the stack

## 🏗️ Architecture

This project consists of two main parts:

### Backend (`/backend`)

**Tech Stack:**
- **Runtime**: Node.js with npm
- **Framework**: Hono (lightweight web framework)
- **Authentication**: Better Auth (modern auth library)
- **Database**: Drizzle ORM + SQLite
- **Logging**: Consola (beautiful console logger)

**Key Features:**
- RESTful API endpoints for authentication
- Session management with configurable expiration
- Phone number OTP verification
- Database schema management with Drizzle
- Request/response logging and monitoring

### Frontend (`/frontend`)

**Tech Stack:**
- **Build Tool**: Vite
- **Framework**: React 19+
- **Routing**: React Router
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Package Manager**: npm

**Key Features:**
- Responsive sidebar layout with collapsible navigation
- Email and phone number authentication forms
- Real-time form validation and password strength checking
- Toast notifications for user feedback
- Mobile-optimized interface
- Dark/light/system theme support with persistent preferences

## 📁 Project Structure

```
better-auth-shadcn-sidebar/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── db/             # Database schema and connection
│   │   ├── lib/            # Authentication config and utilities
│   │   └── index.ts        # Server entry point
│   ├── drizzle.config.ts   # Database configuration
│   └── package.json
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/        # shadcn/ui components
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   └── app-sidebar.tsx
│   │   ├── pages/         # Route components
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
│   └── package.json
│
└── README.md              # This file
```

## 🛠️ Development

### Prerequisites

- Node.js (v18 or higher)
- npm

### 1. Clone the Repository

```bash
git clone <repository-url>
cd better-auth-shadcn-sidebar
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

### 3. Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📦 Docker Production Deploy

### 1. Clone the Repository

```bash
git clone <repository-url>
cd better-auth-shadcn-sidebar
```

### 2. Setup Environment Variables

```bash
cp .env.production.example .env.production
```

Edit the `.env.production` file and adjust all variable values according to your actual deployment requirements.

### 3. Start the Application

```bash
mkdir data
docker compose --env-file .env.production up -d
```

### 4. Rebuild from Scratch (if needed)

```bash
docker compose down -v && \
docker compose --env-file .env.production up -d --build --force-recreate
```

- First command removes containers and volumes completely
- Second command rebuilds everything from scratch without using cache


## 📱 Authentication Features

### Email Authentication
- Email validation with real-time feedback
- Password strength indicator
- Remember me functionality
- Forgot password support (UI ready)

### Phone Number Authentication
- Chinese mobile number validation
- OTP verification with countdown timer
- SMS integration ready (development logs to console)
- Automatic formatting and validation

### Session Management
- Configurable session duration (30 days with remember me)
- Automatic session refresh
- Secure token storage
- Cross-tab synchronization

## 🎨 UI Components

The application uses a comprehensive set of shadcn/ui components:

- **Forms**: Input, Email Input, Phone Input, Password Input with strength
- **Layout**: Sidebar, Card, Tabs, Separator
- **Feedback**: Toast notifications, Loading states, Validation messages
- **Interactive**: Buttons, Checkboxes, Dropdowns
- **Navigation**: Breadcrumbs, Menu items, User avatar

## 🔒 Security Features

- **Password Requirements**: Minimum 8 characters with strength validation
- **Rate Limiting**: Built-in protection against brute force attacks
- **Session Security**: Secure token generation and validation
- **Input Validation**: Client and server-side validation
- **CSRF Protection**: Built into Better Auth
- **Secure Headers**: Configured in Hono middleware

## 🚦 API Endpoints

### Authentication Routes
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout
- `GET /api/auth/session` - Get current session
- `POST /api/auth/phone/send-otp` - Send phone verification
- `POST /api/auth/phone/verify` - Verify phone number

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Better Auth](https://better-auth.com) - Modern authentication library
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Hono](https://hono.dev) - Lightweight web framework
- [Drizzle ORM](https://drizzle.team) - TypeScript ORM
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

---

**Built with ❤️ using modern web technologies** 