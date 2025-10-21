import React from 'react';
import { Route } from 'react-router-dom';
import IndependentListingsPage from '@/components/dashboard/IndependentListingsPage';
// import IndependentListingsSearchPage from '@/pages/IndependentListingsSearchPage'; // TODO: Create this page
import IndependentListingsAnalytics from '@/components/analytics/IndependentListingsAnalytics';

// Temporary placeholder component
const IndependentListingsSearchPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Independent Listings Search</h1>
    <p>This page is under construction.</p>
  </div>
);

// Route configuration for independent listings
export const independentListingsRoutes = [
  <Route 
    key="independent-listings-dashboard" 
    path="/dashboard/independent-listings" 
    element={<IndependentListingsPage />} 
  />,
  <Route 
    key="independent-listings-search" 
    path="/search/independent-listings" 
    element={<IndependentListingsSearchPage />} 
  />,
  <Route 
    key="independent-listings-analytics" 
    path="/dashboard/independent-listings/analytics" 
    element={<IndependentListingsAnalytics />} 
  />
];

// For React Router v6 with createBrowserRouter
export const independentListingsRouteObjects = [
  {
    path: '/dashboard/independent-listings',
    element: <IndependentListingsPage />,
    errorElement: <div>Error loading Independent Listings Dashboard</div>
  },
  {
    path: '/search/independent-listings',
    element: <IndependentListingsSearchPage />,
    errorElement: <div>Error loading Independent Listings Search</div>
  },
  {
    path: '/dashboard/independent-listings/analytics',
    element: <IndependentListingsAnalytics />,
    errorElement: <div>Error loading Independent Listings Analytics</div>
  }
];

// Export default route configuration
export default independentListingsRoutes;
