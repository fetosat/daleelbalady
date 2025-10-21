import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface IndependentListingsMenuItemProps {
  className?: string;
  variant?: 'sidebar' | 'card' | 'button';
}

const IndependentListingsMenuItem: React.FC<IndependentListingsMenuItemProps> = ({
  className = '',
  variant = 'button'
}) => {
  const location = useLocation();
  const isActive = location.pathname.includes('/dashboard/independent-listings');

  if (variant === 'card') {
    return (
      <Link to="/dashboard/independent-listings">
        <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Independent Listings</h3>
                  <p className="text-muted-foreground">
                    Manage services and products without a shop
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">New</Badge>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  if (variant === 'sidebar') {
    return (
      <Link
        to="/dashboard/independent-listings"
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent hover:text-accent-foreground'
        } ${className}`}
      >
        <User className="h-4 w-4" />
        <span className="flex-1">Independent Listings</span>
        <Badge variant={isActive ? 'secondary' : 'outline'} className="text-xs">
          New
        </Badge>
      </Link>
    );
  }

  // Default button variant
  return (
    <Link to="/dashboard/independent-listings">
      <Button
        variant={isActive ? 'default' : 'ghost'}
        className={`justify-start gap-2 ${className}`}
      >
        <User className="h-4 w-4" />
        Independent Listings
        <Badge variant="secondary" className="ml-auto text-xs">
          New
        </Badge>
      </Button>
    </Link>
  );
};

export default IndependentListingsMenuItem;
