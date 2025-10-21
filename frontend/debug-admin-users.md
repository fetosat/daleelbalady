# Admin Users Table - Debugging Guide

## Issues Fixed
1. ✅ User profile route updated from `/user/${user.id}` to `/listing/${user.id}`
2. ✅ UniversalConversionDialog API endpoint updated to use local proxy

## If Buttons Still Don't Work - Debug Steps

### 1. Check Browser Console
Open browser dev tools (F12) and look for:
- JavaScript errors when clicking buttons
- Network errors (failed API requests)
- Console warnings about missing components

### 2. Verify Button Rendering
The buttons should appear in a dropdown menu in the 7th column (Actions column). 
If you see a "..." (three dots) button, that's the dropdown trigger.

### 3. Test Each Action Type

#### Open Profile (فتح الملف الشخصي)
- Should open `/listing/{user-id}` in new tab
- If fails: Check if listing route exists and has proper page component

#### View Details (عرض التفاصيل) 
- Should open `/admin/users/{user-id}` in new tab
- If fails: Check admin user details page

#### Edit (تعديل)
- Should open edit dialog modal
- If fails: Check if dialog state management is working

#### Convert to Shop/Service/Product (تحويل إلى متجر/خدمة/منتج)
- Should open conversion dialog
- If fails: Check if UniversalConversionDialog component is imported and rendered

#### Delete (حذف)
- Should show confirmation dialog then delete user
- If fails: Check API endpoint and authentication

### 4. Check Authentication
All API calls require valid token in localStorage with key 'daleel-token'

### 5. Verify DataTable Component
The DataTable component should render actions properly. If actions don't show:
- Check if actions array is passed correctly
- Verify Action interface implementation
- Check DropdownMenu component imports

## Quick Fix Commands (Run in browser console)

```javascript
// Check if actions are defined
console.log('Actions:', window.React.__internals?.actions);

// Check localStorage token
console.log('Token exists:', !!localStorage.getItem('daleel-token'));

// Manually trigger an action (replace userId with actual ID)
const testAction = () => {
  window.open('/listing/1', '_blank');
};
testAction();
```

## Backend API Endpoints Expected
- GET `/api/dashboard/admin/users` - List users
- GET `/api/dashboard/admin/users/{id}` - Get user details  
- PATCH `/api/dashboard/admin/users/{id}` - Update user
- DELETE `/api/dashboard/admin/users/{id}` - Delete user
- POST `/api/dashboard/admin/conversions/convert` - Convert user to shop/service/product

If any of these return 404, the backend API may need to be implemented.
