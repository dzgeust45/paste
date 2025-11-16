# Paste-Life

## Overview

Paste-Life is a minimal, developer-focused pastebin application for sharing code snippets with syntax highlighting, expiration controls, and privacy settings. The application allows users to create, view, edit, and delete text/code pastes without requiring authentication. Each paste is identified by a unique slug and can be secured with a secret token for editing and deletion operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React with TypeScript for type-safe component development
- Wouter for lightweight client-side routing (pages: create, view, raw)
- Single Page Application (SPA) architecture served from the client directory

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod resolvers for form validation
- Custom hooks pattern for reusable logic (use-mobile, use-toast)

**UI Component System**
- shadcn/ui component library (Radix UI primitives) for accessible, composable components
- Tailwind CSS for utility-first styling with custom design tokens
- Design system inspired by developer tools (GitHub Gist, Vercel, Linear)
- Inter/DM Sans for UI text, JetBrains Mono/Fira Code for code display

**Syntax Highlighting**
- Prism.js with Tomorrow Night theme loaded via CDN
- Autoloader plugin for dynamic language loading
- Line numbers plugin for enhanced code readability

### Backend Architecture

**Server Framework**
- Express.js REST API with TypeScript
- Custom middleware for request logging and response capture
- Rate limiting per IP address to prevent abuse

**API Design**
- RESTful endpoints under `/api/pastes`
- POST for paste creation (returns slug and secret_token)
- GET for paste retrieval (with view counter increment)
- PUT for paste updates (requires secret_token verification)
- DELETE for paste removal (requires secret_token verification)

**Security Model**
- No authentication system - pastes are protected by secret tokens
- Secret tokens are cryptographically random (64 hex characters)
- Server-side token verification for all mutation operations
- Privacy levels: public (discoverable), unlisted (URL-only), private (token-required)

**Validation & Type Safety**
- Zod schemas shared between client and server via `/shared` directory
- Input validation on all API endpoints
- TypeScript interfaces for compile-time type checking

### Data Storage

**Database**
- Supabase (PostgreSQL) as the primary data store
- Drizzle ORM for type-safe database queries (configured but may be extended)
- Supabase service role key used server-side for admin operations
- Supabase anon key used client-side for read operations

**Data Model**
- Pastes table with fields: id, slug, title, content, language, privacy, secret_token, created_at, expires_at, views
- Unique slugs (8 characters) generated using cryptographic randomness
- Expiration timestamps calculated server-side (1h, 1d, 1w, or null for never)
- View counter incremented atomically on each paste view

**Storage Strategy**
- Short random slugs (8 chars) for user-friendly URLs
- Secret tokens (64 hex chars) never exposed in URLs
- Expired pastes handled with friendly error messages
- No automatic cleanup implemented (expired pastes remain in database)

### Build & Development

**Build Pipeline**
- Vite for frontend bundling with React plugin
- esbuild for backend bundling (ESM format, external packages)
- Development mode with HMR and Vite middleware
- Production build outputs to `/dist` directory

**Development Tools**
- Replit-specific plugins for runtime error overlay and cartographer
- TypeScript strict mode for maximum type safety
- Path aliases for clean imports (@/, @shared/, @assets/)

**Environment Configuration**
- `DATABASE_URL` for Drizzle/Neon database connection
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for client-side Supabase
- `SUPABASE_SERVICE_ROLE_KEY` for server-side Supabase admin operations

## External Dependencies

**Third-Party Services**
- Supabase: PostgreSQL database hosting and client SDK
- Neon Database: Alternative PostgreSQL serverless provider (via @neondatabase/serverless)
- Google Fonts CDN: Inter, DM Sans, JetBrains Mono font families
- Prism.js CDN: Syntax highlighting library and themes

**Key Libraries**
- UI Components: @radix-ui/* primitives, shadcn/ui patterns
- Forms: react-hook-form, @hookform/resolvers, zod
- Styling: tailwindcss, class-variance-authority, clsx
- Data: @tanstack/react-query, drizzle-orm
- Date: date-fns for timestamp formatting
- Utilities: nanoid (slug generation), vaul (drawer component)

**Database Schema Management**
- drizzle-kit for migrations (configured with schema in `/shared/schema.ts`)
- PostgreSQL dialect targeting Supabase/Neon databases