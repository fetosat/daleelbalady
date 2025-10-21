import React from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { debugUserRole, getRoleInfo, canAccessProviderFeatures } from '@/utils/roleUtils';
import { Shield, User, Settings, AlertCircle } from 'lucide-react';

const RoleDebugger: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  React.useEffect(() => {
    if (user) {
      debugUserRole(user);
    }
  }, [user]);

  const handleUpgradeToProvider = async () => {
    try {
      updateUser({ role: 'PROVIDER' });
      window.location.reload(); // Refresh to update role
    } catch (error) {
      console.error('Failed to upgrade role:', error);
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No user logged in. Please login to see role information.
        </AlertDescription>
      </Alert>
    );
  }

  const roleInfo = getRoleInfo(user.role);
  const canAccess = canAccessProviderFeatures(user.role);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          User Role Debugger
        </CardTitle>
        <CardDescription>
          Debug information for current user role and permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Info */}
        <div className="space-y-2">
          <h4 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Current User Information
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Name: {user.name || 'N/A'}</div>
            <div>Email: {user.email || 'N/A'}</div>
            <div>ID: {user.id}</div>
            <div>Verified: {user.isVerified ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Role Information */}
        <div className="space-y-2">
          <h4 className="font-semibold">Role Information</h4>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={canAccess ? 'default' : 'secondary'}>
              {roleInfo.displayName}
            </Badge>
            <span className="text-sm text-stone-600">({user.role})</span>
          </div>
          <p className="text-sm text-stone-600">{roleInfo.description}</p>
        </div>

        {/* Permissions */}
        <div className="space-y-2">
          <h4 className="font-semibold">Permissions</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>Access Provider Features:</span>
              <Badge variant={roleInfo.canAccessProvider ? 'default' : 'secondary'}>
                {roleInfo.canAccessProvider ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Create Shops:</span>
              <Badge variant={roleInfo.canCreateShops ? 'default' : 'secondary'}>
                {roleInfo.canCreateShops ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Manage Products:</span>
              <Badge variant={roleInfo.canManageProducts ? 'default' : 'secondary'}>
                {roleInfo.canManageProducts ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Token Information */}
        <div className="space-y-2">
          <h4 className="font-semibold">Authentication</h4>
          <div className="text-sm">
            <div>Token Present: {localStorage.getItem('daleel-token') ? 'Yes' : 'No'}</div>
            <div>Stored User: {localStorage.getItem('daleel-user') ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Upgrade Option */}
        {user.role === 'CUSTOMER' && (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription className="mt-2">
              <div className="mb-2">
                You're currently a Customer. To access provider features, you need to upgrade to a Provider account.
              </div>
              <Button onClick={handleUpgradeToProvider} size="sm">
                Upgrade to Provider
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Access Denied Alert */}
        {!canAccess && user.role !== 'CUSTOMER' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your current role ({user.role}) doesn't have access to provider features. 
              Please contact support if you need access.
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {canAccess && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              ✅ Your role has full access to provider features including shop management and service creation.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RoleDebugger;
