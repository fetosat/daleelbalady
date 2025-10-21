# Daleelbalady - Next.js Application

## Overview
This is a full-stack marketplace application migrated from Vercel to Replit. The project consists of:
- **Frontend**: Next.js 15.5.4 with React 18, TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Node.js Express server with Prisma ORM
- **Database**: PostgreSQL (via Replit Database)

## Current State
✅ Successfully migrated to Replit environment
✅ Frontend running on port 5000
✅ All dependencies installed
✅ Environment variables configured

## Recent Changes (October 21, 2025)
- Migrated from Vercel to Replit
- Updated Next.js config to allow all hosts for Replit compatibility
- Changed dev server port from 3000 to 5000
- Configured workflow for automatic frontend server startup
- Added .gitignore for proper file exclusion
- Installed all frontend and backend dependencies

## Project Architecture

### Frontend (`/frontend`)
- **Framework**: Next.js 15 (App Router)
- **UI**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **State Management**: Zustand, React Query
- **Maps**: Leaflet for location features
- **Real-time**: Socket.io client
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: i18next

### Backend (`/backend`)
- **Server**: Express.js
- **Database ORM**: Prisma
- **Authentication**: Passport.js (Local, Google, Facebook OAuth)
- **Payment**: PayMob integration
- **Real-time**: Socket.io
- **File Upload**: Multer
- **Security**: Helmet, express-rate-limit
- **Session Storage**: Redis

### Key Features
- Multi-vendor marketplace
- Service and product listings
- Booking system
- Real-time chat
- Delivery tracking
- Payment processing (PayMob)
- OAuth authentication (Google, Facebook)
- Admin dashboard with analytics
- Multi-language support (i18next)
- Family subscription plans

## User Preferences
- Package Manager: npm (chosen for Replit compatibility)
- Port Configuration: 5000 (required for Replit)
- Host Configuration: 0.0.0.0 (allows all hosts for iframe preview)

## Environment Variables
All required secrets are configured in Replit Secrets:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET` - Authentication token secret
- `BACKEND_API_URL` - Backend API endpoint
- `NEXT_PUBLIC_API_BASE_URL` - Public API base URL
- OAuth credentials (Google, Facebook)
- PayMob payment integration keys
- `REDIS_URL` - Session and cache storage

## Running the Project

### Development
The frontend workflow is configured to start automatically:
```bash
cd frontend && npm run dev
```

To run backend separately:
```bash
cd backend && npm run dev
```

### Building for Production
```bash
cd frontend && npm run build
cd frontend && npm start
```

## Known Issues
- ⚠️ Duplicate page warning for `[...slug]` route (both .js and .tsx files exist)
  - This doesn't affect functionality but should be cleaned up
- Backend is installed but not configured in workflow (runs separately if needed)

## Next Steps
- Consider setting up backend workflow if both services needed simultaneously
- Clean up duplicate page files in `src/app/[...slug]/`
- Test all OAuth integrations
- Verify PayMob payment flow
- Test database connections

## File Structure
```
/
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/      # App router pages and API routes
│   │   ├── components/  # Reusable React components
│   │   └── assets/   # Static assets
│   ├── public/       # Public static files
│   └── package.json
├── backend/          # Express.js API server
│   ├── server.js     # Main server file
│   ├── prisma/       # Database schema and migrations
│   └── package.json
└── replit.md         # This file
```

## Dependencies Update Policy
- Dependencies are managed via npm
- Run `npm install` in respective directories when adding new packages
- Lock files are committed to ensure consistent installations
