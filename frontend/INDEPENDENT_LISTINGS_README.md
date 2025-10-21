# Independent Listings Feature

## Overview

The Independent Listings feature allows users to create and manage services and products directly without needing to set up a full shop. This is perfect for individual professionals, freelancers, or small-scale sellers who want to offer their services or products on the Daleel Balady platform.

## Features Implemented

### 🔧 Backend API (Node.js/Express)
- **CRUD Operations**: Full Create, Read, Update, Delete functionality for independent services and products
- **Authentication**: User authentication and ownership validation
- **Search & Filtering**: Advanced search capabilities with text matching
- **Multilingual Support**: Arabic and English translations
- **Database Schema**: Updated Prisma schema with optional shop relationships

### 🎨 Frontend Components (React/TypeScript)
- **Form Components**: Dedicated forms for creating/editing services and products
- **Dashboard Page**: Complete management interface with tabs and statistics
- **Search Components**: Advanced search with filters, sorting, and results display
- **Analytics Dashboard**: Comprehensive analytics with performance metrics and insights
- **Navigation Components**: Reusable menu items for different UI layouts
- **Responsive Design**: Mobile-friendly components with proper animations

### 📊 Database Schema Updates
- **Products Model**: Made `shopId` optional to allow independent products
- **ListingType Enum**: Added to distinguish between shop-based and independent listings
- **User Relations**: Added direct relationships to independent services and products

## Component Structure

```
frontend/src/
├── components/
│   ├── forms/
│   │   ├── ServiceForm.tsx          # Service creation/editing form
│   │   └── ProductForm.tsx          # Product creation/editing form
│   ├── dashboard/
│   │   └── IndependentListingsPage.tsx  # Main dashboard page
│   ├── search/
│   │   ├── IndependentListingsSearch.tsx    # Advanced search component
│   │   └── IndependentListingsResults.tsx   # Search results display
│   ├── analytics/
│   │   └── IndependentListingsAnalytics.tsx # Analytics dashboard
│   └── navigation/
│       └── IndependentListingsMenuItem.tsx  # Navigation component
├── pages/
│   └── IndependentListingsSearchPage.tsx   # Complete search page
├── api/
│   └── userListings.ts             # API client functions
└── routes/
    └── independentListingsRoutes.tsx    # Route configuration
```

## API Endpoints

### Services
- `GET /api/user-listings/services` - Get user's services
- `POST /api/user-listings/services` - Create new service
- `PUT /api/user-listings/services/:id` - Update service
- `DELETE /api/user-listings/services/:id` - Delete service

### Products
- `GET /api/user-listings/products` - Get user's products
- `POST /api/user-listings/products` - Create new product
- `PUT /api/user-listings/products/:id` - Update product
- `DELETE /api/user-listings/products/:id` - Delete product

### Combined
- `GET /api/user-listings` - Get all user listings (services + products)
- `GET /api/user-listings/search` - Search user listings with advanced filters

## Usage Examples

### 1. Integration in Dashboard

```tsx
import IndependentListingsPage from '@/components/dashboard/IndependentListingsPage';
import IndependentListingsSearchPage from '@/pages/IndependentListingsSearchPage';
import IndependentListingsAnalytics from '@/components/analytics/IndependentListingsAnalytics';

// In your router configuration
<Route path="/dashboard/independent-listings" element={<IndependentListingsPage />} />
<Route path="/search/independent-listings" element={<IndependentListingsSearchPage />} />
<Route path="/dashboard/independent-listings/analytics" element={<IndependentListingsAnalytics />} />
```

### 2. Navigation Menu

```tsx
import IndependentListingsMenuItem from '@/components/navigation/IndependentListingsMenuItem';

// Sidebar navigation
<IndependentListingsMenuItem variant="sidebar" />

// Card layout
<IndependentListingsMenuItem variant="card" />

// Button variant
<IndependentListingsMenuItem variant="button" />
```

### 3. Form Components

```tsx
import ServiceForm from '@/components/forms/ServiceForm';
import ProductForm from '@/components/forms/ProductForm';

// Service form
<ServiceForm
  service={selectedService} // Optional for editing
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onSuccess={(service) => {
    // Handle success
    console.log('Service created/updated:', service);
  }}
/>

// Product form
<ProductForm
  product={selectedProduct} // Optional for editing
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onSuccess={(product) => {
    // Handle success
    console.log('Product created/updated:', product);
  }}
/>
```

### 4. Search Components Usage

```tsx
import IndependentListingsSearch from '@/components/search/IndependentListingsSearch';
import IndependentListingsResults from '@/components/search/IndependentListingsResults';

// Advanced search component
<IndependentListingsSearch
  onResults={(results) => setSearchResults(results)}
  showFilters={true}
/>

// Results display component
<IndependentListingsResults
  results={searchResults}
  loading={isSearching}
  onServiceClick={(service) => navigate(`/services/${service.id}`)}
  onProductClick={(product) => navigate(`/products/${product.id}`)}
  onContactClick={(listing) => window.open(`tel:${listing.phone}`)}
/>
```

### 5. Analytics Dashboard

```tsx
import IndependentListingsAnalytics from '@/components/analytics/IndependentListingsAnalytics';

// Complete analytics dashboard
<IndependentListingsAnalytics />
```

### 6. API Client Usage

```tsx
import {
  getAllUserListings,
  createUserService,
  updateUserProduct,
  searchUserListings
} from '@/api/userListings';

// Get all user listings
const listings = await getAllUserListings();

// Create a service
const newService = await createUserService({
  name_ar: 'خدمة جديدة',
  name_en: 'New Service',
  price: 100,
  currency: 'EGP'
});

// Advanced search with filters
const results = await searchUserListings({
  query: 'repair',
  type: 'service',
  minPrice: 50,
  maxPrice: 500,
  location: 'Cairo',
  available: true,
  tags: ['professional', 'urgent'],
  sortBy: 'price_low'
});
```

## Form Features

### Service Form
- ✅ Bilingual name and description (Arabic/English)
- ✅ Price, duration, and currency selection
- ✅ Contact information (phone, city)
- ✅ Design theme selection
- ✅ Tags management
- ✅ Availability toggle (for editing)
- ✅ Form validation and error handling

### Product Form
- ✅ Bilingual name and description (Arabic/English)
- ✅ Price, stock quantity, and unit selection
- ✅ Contact information (phone, city)
- ✅ Design theme selection
- ✅ Tags management
- ✅ Availability toggle (for editing)
- ✅ Form validation and error handling

## Design Features

- **Modern UI**: Using shadcn/ui components with proper theming
- **Responsive**: Mobile-first design with responsive grids
- **Animations**: Framer Motion animations for smooth transitions
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **RTL Support**: Right-to-left text direction for Arabic content

## Backend Integration

The forms are fully integrated with the backend API and include:
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Visual feedback during API calls
- **Toast Notifications**: Success and error notifications
- **Data Validation**: Client-side and server-side validation

## Next Steps

To fully integrate this feature into your application:

1. **Database Migration**: Run the updated Prisma schema migration
2. **Route Integration**: Add the routes to your main router
3. **Navigation**: Add navigation menu items where appropriate
4. **Authentication**: Ensure proper authentication middleware is in place
5. **Testing**: Test the complete flow from UI to database

## File Locations

- **Backend Routes**: `backend/routes/userListings.js`
- **API Client**: `frontend/src/api/userListings.ts`
- **Form Components**: `frontend/src/components/forms/`
- **Dashboard Page**: `frontend/src/components/dashboard/IndependentListingsPage.tsx`
- **Navigation**: `frontend/src/components/navigation/IndependentListingsMenuItem.tsx`

## Dependencies Used

- **Frontend**: React, TypeScript, Framer Motion, Lucide Icons, shadcn/ui
- **Backend**: Express.js, Prisma ORM, JWT authentication
- **Validation**: Client-side form validation with proper error states

This implementation provides a complete, production-ready feature for independent listings management within the Daleel Balady platform.
