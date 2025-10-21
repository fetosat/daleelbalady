import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Index from "./pages/Index";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import BecomePartner from "./pages/BecomePartner";
import Search from "./pages/Search";
import ShopProfile from "./pages/ShopProfile";
import ShopsListing from "./pages/ShopsListing";
import UserProfile from "./pages/UserProfile";
import ServiceProfile from "./pages/ServiceProfile";
import CoachDiet from "./pages/CoachDiet";
import NotFound from "./pages/NotFound";
import { RequireAuth } from "@/components/auth/RequireAuth";

// Payment pages
import SubscriptionPlans from "./pages/SubscriptionPlans";
import PaymentCheckout from "./pages/PaymentCheckout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentHistory from "./pages/PaymentHistory";

// Dashboard pages
import Dashboard from "./pages/dashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import ShopOwnerDashboard from "./pages/dashboard/ShopOwnerDashboard";
import ProviderDashboard from "./pages/dashboard/ProviderDashboard";
import DeliveryDashboard from "./pages/dashboard/DeliveryDashboard";

// Admin pages
import Users from "./pages/dashboard/Users";
import Deliveries from "./pages/dashboard/Deliveries";
import Reviews from "./pages/dashboard/Reviews";

// Shared dashboard pages
import BookingsPage from "./pages/dashboard/BookingsPage";
import OrdersPage from "./pages/dashboard/OrdersPage";
import ChatPage from "./pages/dashboard/ChatPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import AnalyticsPage from "./pages/dashboard/AnalyticsPage.tsx";

// Shop management pages
import ShopsPage from "./pages/dashboard/ShopsPage.tsx";
import ProductsPage from "./pages/dashboard/ProductsPage.tsx";
import ServicesPage from "./pages/dashboard/ServicesPage.tsx";

// Dashboard redirect component
function DashboardRedirect() {
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // Redirect based on user role
    const roleRoute = user.role.toLowerCase().replace('_', '-');
    return <Navigate to={`/dashboard/${roleRoute}`} replace />;
}

export default function AppRoutes() {
    return (
        <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/become-partner" element={<BecomePartner />} />
                <Route path="/search" element={<Search />} />
                <Route path="/coach-diet" element={<CoachDiet />} />
                
                {/* Shop routes */}
                <Route path="/shops" element={<ShopsListing />} />
                <Route path="/shop/:slug" element={<ShopProfile />} />
                
                {/* User profile route */}
                <Route path="/user/:id" element={<UserProfile />} />
                
                {/* Service profile route */}
                <Route path="/service/:id" element={<ServiceProfile />} />
                
                {/* Payment routes */}
                <Route path="/subscription-plans" element={<SubscriptionPlans />} />
                <Route path="/payment-checkout" element={
                    <RequireAuth>
                        <PaymentCheckout />
                    </RequireAuth>
                } />
                <Route path="/payment-success" element={
                    <RequireAuth>
                        <PaymentSuccess />
                    </RequireAuth>
                } />
                <Route path="/payment-failed" element={
                    <RequireAuth>
                        <PaymentFailed />
                    </RequireAuth>
                } />
                <Route path="/payment-history" element={
                    <RequireAuth>
                        <PaymentHistory />
                    </RequireAuth>
                } />

                {/* Dashboard and its nested routes */}
                <Route path="/dashboard" element={<Dashboard />}>
                    {/* Default route - redirect to role-specific dashboard */}
                    <Route index element={<DashboardRedirect />} />
                    
                    {/* Role-specific dashboards */}
                    <Route path="admin" element={<AdminDashboard />} />
                    <Route path="customer" element={<CustomerDashboard />} />
                    <Route path="shop-owner" element={<ShopOwnerDashboard />} />
                    <Route path="provider" element={<ProviderDashboard />} />
                    <Route path="delivery" element={<DeliveryDashboard />} />

                    {/* Admin pages */}
                    <Route path="users" element={
                        <RequireAuth role="ADMIN">
                            <Users />
                        </RequireAuth>
                    } />
                    <Route path="deliveries" element={
                        <RequireAuth role="ADMIN">
                            <Deliveries />
                        </RequireAuth>
                    } />
                    <Route path="reviews" element={
                        <RequireAuth role="ADMIN">
                            <Reviews />
                        </RequireAuth>
                    } />

                    {/* Shared pages */}
                    <Route path="bookings" element={<BookingsPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="chat" element={<ChatPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />

                    {/* Shop management pages */}
                    <Route path="shops" element={<ShopsPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="services" element={<ServicesPage />} />
                    
                    {/* Payment management pages */}
                    <Route path="subscription" element={<PaymentHistory />} />
                </Route>
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
    );
}
