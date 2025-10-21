'use client';

import React from 'react';
import RoleUpgradeCard from '@/components/ui/RoleUpgradeCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { canAccessProviderFeatures } from '@/utils/roleUtils';

export default function TestUpgradePage() {
  const { user } = useAuth();
  const [showUpgradeCard, setShowUpgradeCard] = React.useState(false);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Role Upgrade Test Page</CardTitle>
            <CardDescription>
              Test the new role upgrade functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Current User:</span>
              <Badge variant="outline">{user?.name || 'Not logged in'}</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-medium">Current Role:</span>
              <Badge>{user?.role || 'None'}</Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="font-medium">Can Access Provider Features:</span>
              <Badge variant={user && canAccessProviderFeatures(user.role) ? "default" : "destructive"} className={user && canAccessProviderFeatures(user.role) ? "bg-green-100 text-green-800" : ""}>
                {user && canAccessProviderFeatures(user.role) ? 'Yes' : 'No'}
              </Badge>
            </div>

            <div className="pt-4 border-t">
              <Button 
                onClick={() => setShowUpgradeCard(!showUpgradeCard)}
                variant="outline"
              >
                {showUpgradeCard ? 'Hide' : 'Show'} Upgrade Card
              </Button>
            </div>
          </CardContent>
        </Card>

        {showUpgradeCard && user && (
          <RoleUpgradeCard 
            currentRole={user.role} 
            onUpgradeComplete={() => {
              alert('Upgrade complete! Page will reload.');
              window.location.reload();
            }}
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. User Visits Provider Page</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                When a user with CUSTOMER role tries to access the Shops or Provider Services pages, 
                they'll see the upgrade card instead of an error.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">2. Beautiful Upgrade Experience</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                The upgrade card shows what benefits they'll get as a provider, with a clear call-to-action.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">3. One-Click Upgrade</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Clicking the upgrade button immediately upgrades their account to PROVIDER role 
                and refreshes the page to show the provider dashboard.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">4. Immediate Access</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                After upgrade, users can immediately create shops, add services, and manage their business.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Implementation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg">
              <code className="text-sm">
                <strong>Component:</strong> /components/ui/RoleUpgradeCard.tsx
              </code>
            </div>
            
            <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg">
              <code className="text-sm">
                <strong>Used in:</strong> ShopsPage.tsx, ProviderServicesPage.tsx
              </code>
            </div>
            
            <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg">
              <code className="text-sm">
                <strong>API:</strong> auth.upgradeToProvider() in /lib/api.ts
              </code>
            </div>
            
            <div className="bg-stone-100 dark:bg-stone-800 p-3 rounded-lg">
              <code className="text-sm">
                <strong>Backend:</strong> PATCH /api/auth/user endpoint
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
