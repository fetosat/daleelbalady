import React, { useState } from 'react';
import { resolveTheme, getThemeStyles } from '@/utils/themeResolver';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ThemeDemoProps {
  designSlugs: string[];
}

const ThemeDemo: React.FC<ThemeDemoProps> = ({ designSlugs }) => {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">🎨 Dynamic Theme Demo</h2>
      
      {designSlugs.map((slug) => {
        const theme = resolveTheme(slug);
        
        return (
          <div key={slug} className="space-y-2">
            <h3 className="text-lg font-semibold">Design Slug: "{slug}"</h3>
            
            {/* Demo Card */}
            <Card 
              className="w-80 border-2"
              style={{
                backgroundColor: theme.colors.background,
                borderColor: theme.border.color,
                borderRadius: theme.border.radius,
                boxShadow: theme.shadow.default
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center mb-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    style={{ 
                      backgroundColor: theme.colors.primary + '20',
                      color: theme.colors.primary 
                    }}
                  >
                    <span className="text-lg">{theme.emoji}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: theme.colors.text }}>
                      Sample {slug} Service
                    </h4>
                    <p className="text-sm" style={{ color: theme.colors.textLight }}>
                      Professional service provider
                    </p>
                  </div>
                </div>
                
                <p className="text-sm mb-3" style={{ color: theme.colors.textLight }}>
                  This is how a {slug} themed card would look with custom colors, 
                  borders, and styling.
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge variant={theme.badgeVariant} className="text-xs">
                    {slug}
                  </Badge>
                  <span 
                    className="text-sm font-medium" 
                    style={{ color: theme.colors.primary }}
                  >
                    $50/hour
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Theme Debug Info */}
            <details className="text-xs text-stone-600">
              <summary className="cursor-pointer hover:text-stone-800">
                🔍 Theme Details
              </summary>
              <pre className="mt-2 p-2 bg-stone-100 rounded text-xs overflow-auto">
{JSON.stringify({
  emoji: theme.emoji,
  colors: theme.colors,
  border: theme.border,
  badgeVariant: theme.badgeVariant,
  specialEffects: theme.specialEffects
}, null, 2)}
              </pre>
            </details>
          </div>
        );
      })}
    </div>
  );
};

// Example usage component
export const ThemeDemoShowcase: React.FC = () => {
  const demoSlugs = [
    'doctor',
    'nurse', 
    'lawyer',
    'teacher',
    'automotive',
    'beauty',
    'fitness',
    'technology',
    'food',
    'entertainment',
    'plumbing', // Should map to home-services via contains
    'clinic',   // Should map to medical via contains
    'unknown'   // Should fallback to default
  ];

  return <ThemeDemo designSlugs={demoSlugs} />;
};

export default ThemeDemo;
