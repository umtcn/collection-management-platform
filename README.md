# Collection Management Platform

A modern, enterprise-grade collection management platform built with Next.js, featuring product management, drag-and-drop functionality, and comprehensive filtering capabilities.

## 🚀 Features

- **Authentication System**: Secure login with NextAuth.js
- **Collection Management**: View and manage product collections
- **Product Pinning**: Pin important products with drag-and-drop functionality
- **Advanced Filtering**: Filter products by category, price, stock, and more
- **Dark Mode**: Full dark mode support with theme persistence
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Type-Safe**: Built with TypeScript for enhanced developer experience
- **State Management**: Efficient state management with Zustand
- **Dockerized**: Full Docker support for easy deployment

## 📋 Prerequisites

- Node.js 18+ or Docker & Docker Compose
- npm or yarn package manager

## 🛠️ Installation

### Local Development

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd secil-front-case
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Run development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Deployment (Recommended)

**Fastest way to run the application:**

1. Make sure Docker and Docker Compose are installed on your system

2. Run with a single command:
\`\`\`bash
docker-compose up
\`\`\`

That's it! The application will:
- ✅ Install all dependencies
- ✅ Build the Next.js application
- ✅ Start the production server
- ✅ Be accessible at [http://localhost:3000](http://localhost:3000)

**Useful Docker commands:**

\`\`\`bash
# Start in background (detached mode)
docker-compose up -d

# Stop the application
docker-compose down

# Rebuild and start (after code changes)
docker-compose up --build

# View logs
docker-compose logs -f app

# Remove all containers and volumes
docker-compose down -v
\`\`\`

## 🔐 Login Credentials

For testing purposes, use these credentials:

**Admin Account:**
- Email: \`admin@example.com\`
- Password: \`admin123\`

**User Account:**
- Email: \`user@example.com\`
- Password: \`user123\`

## 📁 Project Structure

\`\`\`
secil-front-case/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (SSR)
│   ├── login/             # Login page
│   ├── collections/       # Collections list page
│   ├── edit/              # Edit/pinning page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                   # Utility functions
│   ├── utils.ts          # Helper functions
│   └── mock-data.ts      # Mock data for development
├── store/                 # Zustand stores
│   ├── authStore.ts      # Authentication state
│   ├── collectionStore.ts # Collection state
│   ├── productStore.ts   # Product state
│   ├── filterStore.ts    # Filter state
│   └── uiStore.ts        # UI state (theme, view mode)
├── types/                 # TypeScript type definitions
├── middleware.ts          # Next.js middleware for auth
├── Dockerfile            # Docker configuration
└── docker-compose.yml    # Docker Compose configuration
\`\`\`

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **Drag & Drop**: Vanilla JS (HTML5 Drag & Drop API) + Touch Events
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library (132 tests)
- **Containerization**: Docker & Docker Compose

## 🧪 Testing

The project includes comprehensive test coverage:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- __tests__/edit-interactions.test.tsx

# Generate coverage report
npm test -- --coverage
```

**Test Coverage:**
- ✅ Login page: 27 tests (authentication, validation, Remember Me)
- ✅ Collections page: 36 tests (listing, pagination, navigation)
- ✅ Edit page (static): 39 tests (rendering, filters, view modes)
- ✅ Edit page (interactive): 30 tests (drag-drop, click-to-select, modals)
- **Total: 132 passing tests**

## 🧪 Available Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npm run lint\` - Run ESLint
- \`npm run type-check\` - Run TypeScript compiler check

## 🌐 API Endpoints

All API endpoints are located in the \`/app/api\` directory:

- \`POST /api/auth/login\` - User authentication
- \`GET /api/collections\` - Fetch collections list
- \`GET /api/collections/[id]/products\` - Fetch products for a collection
- \`PUT /api/collections/[id]/products\` - Update product order/pinning
- \`GET /api/health\` - Health check endpoint

## 🎯 Key Features Explained

### Authentication & Middleware
- Middleware protects routes and redirects unauthenticated users
- Session persistence with Zustand
- Secure cookie-based authentication

### Collection Management
- Paginated collection list
- Search and filter capabilities
- Responsive table view

### Product Pinning & Editing
- Drag-and-drop product reordering
- Dual-panel layout (products vs pinned items)
- Advanced filtering modal
- Multiple view modes (grid, list)
- Real-time updates

### Filtering System
- Filter by category, price range, stock
- Product code search
- Multiple sort options
- Applied criteria management
- Filter persistence

## 🎨 Design Principles

- **Mobile-First**: Responsive design starting from mobile breakpoints
- **Accessibility**: Semantic HTML and ARIA attributes
- **Performance**: Optimized images, fonts, and bundle size
- **Clean Code**: Following SOLID principles and best practices
- **Type Safety**: Comprehensive TypeScript coverage

## 🐳 Docker Commands

Build image:
\`\`\`bash
docker build -t collection-platform .
\`\`\`

Run container:
\`\`\`bash
docker run -p 3000:3000 collection-platform
\`\`\`

Using Docker Compose:
\`\`\`bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up --build
\`\`\`

## 📝 Environment Variables

See \`.env.example\` for required environment variables:

- \`NEXTAUTH_URL\` - Application URL
- \`NEXTAUTH_SECRET\` - Secret for NextAuth
- \`NEXT_PUBLIC_API_URL\` - Public API URL
- \`API_BASE_URL\` - Base URL for external APIs

## 🤝 Contributing

This is a test case project. For production use, consider:
- Implementing real authentication backend
- Adding comprehensive test coverage
- Setting up CI/CD pipelines
- Adding error tracking (e.g., Sentry)
- Implementing analytics

## 📄 License

This project is created as a test case.

## 👨‍💻 Author

Created as a test case for collection management platform.
