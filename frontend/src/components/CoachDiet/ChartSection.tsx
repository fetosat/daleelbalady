import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Timer } from 'lucide-react';

// Using simple inline charts for better performance
// No heavy chart.js dependency

interface ChartSectionProps {
  dailyCalories: number;
}

const ChartSection: React.FC<ChartSectionProps> = ({ dailyCalories }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {isRTL ? 'تقدم الوزن' : 'Weight Progress'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            {isRTL ? 'الرسم البياني قيد التطوير' : 'Chart coming soon'}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            {isRTL ? 'إحصائيات أسبوعية' : 'Weekly Stats'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'متوسط السعرات' : 'Avg Calories'}
              </p>
              <p className="text-2xl font-bold">{dailyCalories}</p>
            </div>
            <div className="text-center p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'أيام الالتزام' : 'Days on Track'}
              </p>
              <p className="text-2xl font-bold">5/7</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartSection;

