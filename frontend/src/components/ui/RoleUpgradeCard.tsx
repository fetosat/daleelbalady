import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Store, 
  Users, 
  TrendingUp, 
  Check, 
  ArrowRight, 
  Crown,
  Sparkles 
} from 'lucide-react';

interface RoleUpgradeCardProps {
  currentRole: string;
  onUpgradeComplete?: () => void;
}

const RoleUpgradeCard: React.FC<RoleUpgradeCardProps> = ({ 
  currentRole, 
  onUpgradeComplete 
}) => {
  const { updateUser, user } = useAuth();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeComplete, setUpgradeComplete] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      console.log('🚀 Starting role upgrade process...');
      
      // Call the API to upgrade role
      const updatedUser = await auth.upgradeToProvider();
      
      // Update local auth state
      updateUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('daleel-user', JSON.stringify(updatedUser));
      
      setUpgradeComplete(true);
      
      toast({
        title: "🎉 Upgrade Successful!",
        description: "Your account has been upgraded to Provider. You now have access to all provider features.",
        duration: 5000,
      });

      // Call the callback if provided
      if (onUpgradeComplete) {
        setTimeout(() => {
          onUpgradeComplete();
        }, 1000);
      }
      
    } catch (error: any) {
      console.error('❌ Role upgrade failed:', error);
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to upgrade your account. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  if (upgradeComplete) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-green-800 dark:text-green-200">
            🎉 Welcome to Daleel Balady Providers!
          </CardTitle>
          <CardDescription className="text-green-600 dark:text-green-400">
            Your account has been successfully upgraded
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-green-700 dark:text-green-300 mb-4">
            You can now create shops, manage services, and access all provider features.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 hover:bg-green-700"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const providerFeatures = [
    {
      icon: <Store className="h-5 w-5" />,
      title: "Create & Manage Shops",
      description: "Set up your business presence with custom shops"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Offer Services",
      description: "List and manage your services for customers"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Business Analytics",
      description: "Track performance and customer engagement"
    }
  ];

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 dark:border-blue-800">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Upgrade to Provider Account
        </CardTitle>
        <CardDescription>
          Unlock powerful business features and start earning with Daleel Balady
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="mb-2">
              <strong>Current Role:</strong> <Badge variant="secondary">{currentRole}</Badge>
            </div>
            <div>
              To access provider features like shop management and service listings, 
              you need to upgrade your account to a Provider account.
            </div>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">🎯 What you'll get with Provider access:</h4>
          {providerFeatures.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg dark:bg-stone-800/50">
              <div className="text-blue-600 dark:text-blue-400 mt-0.5">
                {feature.icon}
              </div>
              <div>
                <div className="font-medium text-sm">{feature.title}</div>
                <div className="text-xs text-stone-600 dark:text-stone-400">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={handleUpgrade}
            disabled={isUpgrading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            {isUpgrading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Upgrading Account...
              </>
            ) : (
              <>
                Upgrade to Provider Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-stone-500 dark:text-stone-400 mt-2">
            Free upgrade • No credit card required • Instant activation
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleUpgradeCard;
