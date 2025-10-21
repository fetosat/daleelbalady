import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Activity, Scale, Dumbbell, Target } from 'lucide-react';

interface UserData {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
}

interface CalorieData {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface CalculatorProps {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  calorieData: CalorieData;
}

const Calculator: React.FC<CalculatorProps> = ({ userData, setUserData, calorieData }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isRTL ? 'بياناتك الشخصية' : 'Personal Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{isRTL ? 'الوزن (كجم)' : 'Weight (kg)'}</Label>
              <Input
                type="number"
                value={userData.weight}
                onChange={(e) => setUserData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{isRTL ? 'الطول (سم)' : 'Height (cm)'}</Label>
              <Input
                type="number"
                value={userData.height}
                onChange={(e) => setUserData(prev => ({ ...prev, height: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{isRTL ? 'العمر' : 'Age'}</Label>
              <Input
                type="number"
                value={userData.age}
                onChange={(e) => setUserData(prev => ({ ...prev, age: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{isRTL ? 'الجنس' : 'Gender'}</Label>
              <select
                value={userData.gender}
                onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="male">{isRTL ? 'ذكر' : 'Male'}</option>
                <option value="female">{isRTL ? 'أنثى' : 'Female'}</option>
              </select>
            </div>
          </div>

          <div>
            <Label>{isRTL ? 'مستوى النشاط' : 'Activity Level'}</Label>
            <select
              value={userData.activityLevel}
              onChange={(e) => setUserData(prev => ({ ...prev, activityLevel: e.target.value as any }))}
              className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="sedentary">{isRTL ? 'قليل الحركة' : 'Sedentary'}</option>
              <option value="light">{isRTL ? 'نشاط خفيف' : 'Light Activity'}</option>
              <option value="moderate">{isRTL ? 'نشاط معتدل' : 'Moderate Activity'}</option>
              <option value="active">{isRTL ? 'نشط' : 'Active'}</option>
              <option value="very_active">{isRTL ? 'نشط جداً' : 'Very Active'}</option>
            </select>
          </div>

          <div>
            <Label>{isRTL ? 'الهدف' : 'Goal'}</Label>
            <select
              value={userData.goal}
              onChange={(e) => setUserData(prev => ({ ...prev, goal: e.target.value as any }))}
              className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="lose">{isRTL ? 'فقدان الوزن' : 'Lose Weight'}</option>
              <option value="maintain">{isRTL ? 'المحافظة على الوزن' : 'Maintain Weight'}</option>
              <option value="gain">{isRTL ? 'زيادة الوزن' : 'Gain Weight'}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {isRTL ? 'النتائج' : 'Results'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <Scale className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-muted-foreground">{isRTL ? 'معدل الأيض الأساسي' : 'BMR'}</p>
              <p className="text-2xl font-bold text-blue-600">{calorieData.bmr}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'سعرة حرارية/يوم' : 'cal/day'}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <Dumbbell className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground">{isRTL ? 'إجمالي الطاقة المطلوبة' : 'TDEE'}</p>
              <p className="text-2xl font-bold text-green-600">{calorieData.tdee}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'سعرة حرارية/يوم' : 'cal/day'}</p>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-center mb-4">
              <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-muted-foreground">{isRTL ? 'السعرات المستهدفة يومياً' : 'Daily Calorie Target'}</p>
              <p className="text-3xl font-bold text-purple-600">{calorieData.dailyCalories}</p>
              <p className="text-xs text-muted-foreground">{isRTL ? 'سعرة حرارية' : 'calories'}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center">
                <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  {isRTL ? 'بروتين' : 'Protein'}
                </Badge>
                <p className="font-bold mt-1">{calorieData.protein}g</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  {isRTL ? 'كربوهيدرات' : 'Carbs'}
                </Badge>
                <p className="font-bold mt-1">{calorieData.carbs}g</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                  {isRTL ? 'دهون' : 'Fats'}
                </Badge>
                <p className="font-bold mt-1">{calorieData.fats}g</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calculator;

