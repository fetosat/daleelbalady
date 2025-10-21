# دليل بلدي (Daleelbalady) - Local Business Directory Platform

## Overview

Daleelbalady is a comprehensive Next.js-based marketplace platform for Egyptian local businesses, services, and products. The platform connects service providers, shop owners, and customers through a modern web application with advanced search capabilities, booking systems, e-commerce features, and multi-tier subscription plans.

**Core Purpose**: Create a unified local business directory where users can discover, book services, purchase products, and interact with local Egyptian businesses through a modern, AI-enhanced interface.

**Technology Stack**:
- Frontend: Next.js 15.5.4 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS + shadcn/ui components
- State Management: React Query + React Hooks
- Internationalization: react-i18next (Arabic/English)
- Authentication: Custom JWT-based auth system
- API Integration: REST API backend

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 9, 2025 - Vercel to Replit Migration
**Migration completed successfully** - The Next.js application has been migrated from Vercel to Replit environment with the following changes:

1. **Port Configuration**: Updated `package.json` scripts to bind Next.js dev and production servers to `0.0.0.0:5000` (required by Replit)
2. **Cross-Origin Fix**: Added `allowedDevOrigins: ['*']` to `next.config.mjs` to resolve cross-origin request warnings in Replit's iframe environment
3. **Dependency Installation**: Installed all dependencies using npm with `--legacy-peer-deps` flag to resolve react-leaflet peer dependency conflicts
4. **Deployment Configuration**: Set up autoscale deployment using `npm run build` and `npm run start`
5. **Workflow Setup**: Configured development workflow to run `npm run dev` on port 5000 with webview output

**Status**: Application running successfully with production API connection and WebSocket functionality working as expected.

## System Architecture

### 1. Frontend Architecture

**Framework Decision**: Next.js 15 with App Router
- **Rationale**: Enables server-side rendering for SEO optimization, especially important for local business discovery
- **Pros**: Built-in routing, image optimization, excellent performance
- **Cons**: Learning curve for App Router paradigm
- **Alternative Considered**: Create React App (rejected due to lack of SSR)

**Routing Strategy**: Hybrid Client/Server Rendering
- Server-side rendering for listing pages (`/listing/[id]`, `/service/[id]`, `/product/[id]`)
- Client-side rendering for dashboards and interactive pages
- Dynamic routing with Next.js App Router for all user-facing pages
- Protected routes use `RequireAuth` wrapper component

**Key Design Patterns**:
- **Unified Listing System**: Single `/listing/[id]` route that dynamically renders based on subscription tier (FREE, VERIFICATION, SERVICES, PRODUCTS)
- **Role-Based Components**: Different dashboard layouts for CUSTOMER, PROVIDER, SHOP_OWNER, DELIVERY, ADMIN roles
- **Theme System**: Custom `themeResolver` utility for consistent design across all pages
- **Client-Only Rendering**: Uses `ClientOnly` and `NoSSR` wrappers to prevent hydration mismatches for dynamic content

### 2. State Management

**Approach**: React Query + Local State
- **React Query** for server state (API data, caching, background refetching)
- **React Context** for global UI state (auth, chatbox, theme)
- **Local useState** for component-specific UI state
- **Rationale**: Separates server/UI concerns, prevents prop drilling, automatic cache invalidation

**Authentication State**: Custom `AuthProvider` context
- Stores user data, role, verification status
- Provides `login`, `logout`, `signup` methods
- Persists auth token in localStorage
- Automatic redirect handling for protected routes

### 3. Component Architecture

**UI Library**: shadcn/ui (Radix UI primitives + Tailwind)
- **Rationale**: Accessible, customizable, no runtime overhead
- **Pros**: Copy-paste components, full design control
- **Cons**: Manual component updates
- **Alternative Considered**: Material-UI (rejected due to bundle size)

**Component Organization**:
```
src/components/
├── ui/                    # shadcn/ui base components
├── listing/              # Listing view components (Free, Verified, Services, Products)
├── admin/                # Admin panel components
├── dashboard/            # Dashboard page components
├── forms/                # Reusable form components
├── navigation/           # Navigation and layout components
└── shared/               # Shared utilities (FloatingChatbox, etc.)
```

**Key Component Patterns**:
- **Compound Components**: Used for complex UI like tabs, accordions
- **Render Props**: Used in search components for flexibility
- **Higher-Order Components**: `RequireAuth` wrapper for protected routes

### 4. Internationalization

**Library**: react-i18next
- Default language: Arabic (RTL)
- Supported languages: Arabic, English
- Translation files: `/src/locales/ar.json`, `/src/locales/en.json`
- **Key Feature**: Automatic RTL/LTR layout switching based on language

**Implementation Details**:
- Document direction (`dir`) updates automatically on language change
- Language preference stored in localStorage
- `useDocumentTitle` hook for transtoned page titles

### 5. API Integration Strategy

**Backend URL**: `https://api.daleelbalady.com/api`
- **Note**: Configuration files show previous localhost setup but production uses live API
- All API calls use axios with base configuration
- Credentials sent with every request (`withCredentials: true`)
- Auth token injected via axios interceptors

**API Client Pattern**:
- Centralized `api.ts` file with axios instance
- Request interceptors add auth headers
- Response interceptors handle 401 errors (auto-logout)
- Separate API modules for different domains (user, shops, bookings, etc.)

**Key API Endpoints**:
- `/api/users/:id` - User profiles and listings
- `/api/services/:id` - Service details
- `/api/shops/:id` - Shop information
- `/api/products/:id` - Product details
- `/api/advanced-search/` - Multi-type search with filters
- `/api/booking/` - Appointment scheduling
- `/api/chats/` - Real-time messaging
- `/api/payments/` - Paymob payment integration
- `/api/dashboard/` - Role-specific dashboard data

### 6. Search Architecture

**Multi-Type Search System**: Advanced search across shops, services, users, products
- Location-based filtering (city, lat/lon, radius)
- Category and subcategory filtering
- Price range filters
- Sort options: reviews, recommendation, location, rating, recent
- AI-enhanced metadata display (priority scores, quality badges)

**Search Result Components**:
- Unified result cards with navigation to `/listing/:id`
- Real-time search with debouncing
- Cache support for shareable search results
- Socket.io integration for live search updates

### 7. User Roles and Permissions

**Role Hierarchy**:
1. **CUSTOMER**: Basic user, can book services and purchase products
2. **PROVIDER**: Independent service provider (no shop)
3. **SHOP_OWNER**: Can manage shops, products, and shop-based services
4. **DELIVERY**: Delivery personnel for order fulfillment
5. **ADMIN**: Platform administrator with full access

**Permission System**:
- Route-level protection via `RequireAuth` component
- Component-level feature gating based on user role
- Subscription tier determines listing feature access (FREE, VERIFICATION, SERVICES, PRODUCTS)

### 8. Subscription and Payment System

**Subscription Tiers**:
- **FREE**: Basic listing with masked contact info
- **VERIFICATION**: Verified badge, full contact info, chat capability
- **SERVICES**: Booking system, calendar management
- **PRODUCTS**: E-commerce features, product catalog

**Payment Integration**: Paymob gateway
- Card payments, mobile wallets, bank transfers
- Payment tracking and history
- Discount code support
- Automatic subscription activation

## External Dependencies

### Third-Party Services

1. **Paymob Payment Gateway**
   - Purpose: Process payments for subscriptions and product purchases
   - Integration: REST API with `paymob.js` backend class
   - Features: Multiple payment methods, transaction tracking

2. **Socket.io** (Backend)
   - Purpose: Real-time features (chat, notifications, live search)
   - Connection: `https://api.daleelbalady.com`
   - Events: `multi_search_results`, `search_results`, chat messages

3. **Microsoft Clarity**
   - Purpose: User analytics and session replay
   - Integration: `@microsoft/clarity` package
   - Project ID: Configured in App.tsx

4. **Leaflet** (Maps)
   - Purpose: Location display and selection
   - Package: `leaflet`, `@types/leaflet`
   - Use cases: Shop locations, service areas, delivery tracking

### UI Component Libraries

1. **Radix UI Primitives**
   - All `@radix-ui/react-*` packages
   - Purpose: Accessible UI component primitives (dialogs, dropdowns, tabs, etc.)
   - Used via shadcn/ui wrapper components

2. **Lucide React Icons**
   - Purpose: Consistent icon system across the platform
   - Large icon library for UI elements

3. **Framer Motion**
   - Purpose: Animations and page transitions
   - Key uses: Dashboard transitions, page load animations, micro-interactions

### Development Dependencies

1. **TypeScript**
   - Type safety across the entire codebase
   - Strict mode disabled (`strict: false`) for faster development

2. **Tailwind CSS**
   - Utility-first styling
   - Custom design system with CSS variables
   - Mobile-first responsive design

3. **React Query** (`@tanstack/react-query`)
   - Server state management
   - Automatic caching and refetching
   - Optimistic updates for better UX

### Backend API Dependencies

**Note**: The frontend assumes a Node.js/Express backend with the following capabilities:
- JWT authentication
- Prisma ORM (database schema references suggest this)
- File upload handling (for images, documents)
- WebSocket support (Socket.io)
- Email notifications (registration, bookings)

**Expected Database**: PostgreSQL (Prisma schema suggests relational DB)
- Tables: users, shops, services, products, bookings, orders, reviews, chats, notifications
- Relationships: One-to-many, many-to-many with junction tables

### Environment Variables Required

```env
NEXT_PUBLIC_API_URL=https://api.daleelbalady.com/api
NEXT_PUBLIC_API_BASE_URL=https://api.daleelbalady.com/api
```

**Note**: Previous configuration files show localhost setup, but production uses live API endpoints.