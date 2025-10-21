import React, { useState, useEffect, lazy, Suspense } from 'react';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  Calculator as CalculatorIcon,
  Target,
  TrendingUp,
  Heart,
  Apple,
  Dumbbell,
  Timer,
  Activity,
  RotateCcw,
  Plus,
  Minus,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Lazy load heavy components
const CalculatorComponent = lazy(() => import('./CoachDiet/Calculator'));
const ChartSection = lazy(() => import('./CoachDiet/ChartSection'));

interface UserData {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
  targetWeight?: number;
}

interface CalorieData {
  bmr: number;
  tdee: number;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  quantity: number;
}

interface WorkoutEntry {
  id: string;
  name: string;
  duration: number;
  calories: number;
}

const CoachDiet: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  // State Management
  const [userData, setUserData] = useState<UserData>({
    weight: 70,
    height: 170,
    age: 25,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain'
  });
  
  const [calorieData, setCalorieData] = useState<CalorieData>({
    bmr: 0,
    tdee: 0,
    dailyCalories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });
  
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [currentTab, setCurrentTab] = useState('calculator');
  const [dailyProgress, setDailyProgress] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0
  });

  // BMR and TDEE Calculations
  const calculateBMR = (data: UserData): number => {
    const { weight, height, age, gender } = data;
    if (gender === 'male') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }
  };

  const calculateTDEE = (bmr: number, activityLevel: string): number => {
    const multipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    return bmr * multipliers[activityLevel as keyof typeof multipliers];
  };

  const calculateDailyCalories = (tdee: number, goal: string): number => {
    switch (goal) {
      case 'lose':
        return tdee - 500; // 500 calorie deficit
      case 'gain':
        return tdee + 500; // 500 calorie surplus
      default:
        return tdee; // maintenance
    }
  };

  const calculateMacros = (calories: number) => {
    return {
      protein: Math.round((calories * 0.3) / 4), // 30% protein
      carbs: Math.round((calories * 0.4) / 4),   // 40% carbs
      fats: Math.round((calories * 0.3) / 9)     // 30% fats
    };
  };

  // Update calculations when user data changes
  useEffect(() => {
    const bmr = calculateBMR(userData);
    const tdee = calculateTDEE(bmr, userData.activityLevel);
    const dailyCalories = calculateDailyCalories(tdee, userData.goal);
    const macros = calculateMacros(dailyCalories);
    
    setCalorieData({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyCalories: Math.round(dailyCalories),
      ...macros
    });
  }, [userData]);

  // Calculate daily progress
  useEffect(() => {
    const totals = foodEntries.reduce(
      (acc, food) => ({
        calories: acc.calories + (food.calories * food.quantity),
        protein: acc.protein + (food.protein * food.quantity),
        carbs: acc.carbs + (food.carbs * food.quantity),
        fats: acc.fats + (food.fats * food.quantity)
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
    
    // Subtract workout calories
    const workoutCalories = workoutEntries.reduce((acc, workout) => acc + workout.calories, 0);
    
    setDailyProgress({
      ...totals,
      calories: totals.calories - workoutCalories
    });
  }, [foodEntries, workoutEntries]);

  const addFoodEntry = (food: Omit<FoodEntry, 'id' | 'quantity'>) => {
    const newEntry: FoodEntry = {
      ...food,
      id: Date.now().toString(),
      quantity: 1
    };
    setFoodEntries([...foodEntries, newEntry]);
  };

  const updateFoodQuantity = (id: string, quantity: number) => {
    setFoodEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, quantity } : entry
      )
    );
  };

  const removeFoodEntry = (id: string) => {
    setFoodEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const addWorkoutEntry = (workout: Omit<WorkoutEntry, 'id'>) => {
    const newEntry: WorkoutEntry = {
      ...workout,
      id: Date.now().toString()
    };
    setWorkoutEntries([...workoutEntries, newEntry]);
  };

  const removeWorkoutEntry = (id: string) => {
    setWorkoutEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const resetDay = () => {
    setFoodEntries([]);
    setWorkoutEntries([]);
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white py-8"
        >
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-8 w-8" />
              <h1 className="text-3xl md:text-4xl font-bold" suppressHydrationWarning>
                {isRTL ? 'كوتش & دايت' : 'Coach & Diet'}
              </h1>
            </div>
            <p className="text-green-100 text-lg max-w-2xl mx-auto">
              {isRTL 
                ? 'احسب احتياجاتك اليومية من السعرات والعناصر الغذائية وتتبع تقدمك نحو أهدافك الصحية'
                : 'Calculate your daily caloric and nutritional needs and track your progress towards your health goals'
              }
            </p>
          </div>
        </m.div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <CalculatorIcon className="h-4 w-4" />
              {isRTL ? 'الحاسبة' : 'Calculator'}
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              {isRTL ? 'التتبع' : 'Tracking'}
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {isRTL ? 'التقدم' : 'Progress'}
            </TabsTrigger>
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Apple className="h-4 w-4" />
              {isRTL ? 'نصائح' : 'Tips'}
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <Suspense fallback={<div className="text-center py-12">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>}>
              <CalculatorComponent 
                userData={userData} 
                setUserData={setUserData} 
                calorieData={calorieData}
              />
            </Suspense>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Daily Progress */}
              <Card className="xl:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {isRTL ? 'التقدم اليومي' : 'Daily Progress'}
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={resetDay}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isRTL ? 'إعادة تعيين' : 'Reset'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Calories Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-lg font-medium">{isRTL ? 'السعرات الحرارية' : 'Calories'}</Label>
                      <span className="text-lg font-bold">
                        {dailyProgress.calories} / {calorieData.dailyCalories}
                      </span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(dailyProgress.calories, calorieData.dailyCalories)} 
                      className="h-3"
                    />
                  </div>

                  {/* Macros Progress */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">{isRTL ? 'بروتين' : 'Protein'}</Label>
                        <span className="text-sm font-medium">
                          {Math.round(dailyProgress.protein)}g / {calorieData.protein}g
                        </span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(dailyProgress.protein, calorieData.protein)} 
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">{isRTL ? 'كربوهيدرات' : 'Carbs'}</Label>
                        <span className="text-sm font-medium">
                          {Math.round(dailyProgress.carbs)}g / {calorieData.carbs}g
                        </span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(dailyProgress.carbs, calorieData.carbs)} 
                        className="h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm">{isRTL ? 'دهون' : 'Fats'}</Label>
                        <span className="text-sm font-medium">
                          {Math.round(dailyProgress.fats)}g / {calorieData.fats}g
                        </span>
                      </div>
                      <Progress 
                        value={getProgressPercentage(dailyProgress.fats, calorieData.fats)} 
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Food Entries */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Apple className="h-5 w-5" />
                      {isRTL ? 'الوجبات اليوم' : "Today's Meals"}
                    </h3>
                    {foodEntries.map((food) => (
                      <div key={food.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{food.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(food.calories * food.quantity)} {isRTL ? 'سعرة حرارية' : 'cal'} | 
                            {Math.round(food.protein * food.quantity)}g {isRTL ? 'بروتين' : 'protein'} |
                            {Math.round(food.carbs * food.quantity)}g {isRTL ? 'كربوهيدرات' : 'carbs'} |
                            {Math.round(food.fats * food.quantity)}g {isRTL ? 'دهون' : 'fats'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateFoodQuantity(food.id, Math.max(0.1, food.quantity - 0.1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="min-w-[60px] text-center">x{food.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateFoodQuantity(food.id, food.quantity + 0.1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFoodEntry(food.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Workout Entries */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Dumbbell className="h-5 w-5" />
                      {isRTL ? 'التمارين اليوم' : "Today's Workouts"}
                    </h3>
                    {workoutEntries.map((workout) => (
                      <div key={workout.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{workout.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {workout.duration} {isRTL ? 'دقيقة' : 'min'} | -{workout.calories} {isRTL ? 'سعرة حرارية' : 'cal'}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeWorkoutEntry(workout.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Add */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {isRTL ? 'إضافة سريعة' : 'Quick Add'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Common Foods */}
                  <div>
                    <h4 className="font-medium mb-3">{isRTL ? 'أطعمة شائعة' : 'Common Foods'}</h4>
                    <div className="space-y-2">
                      {[
                        { name: isRTL ? 'كوب أرز' : 'Cup of Rice', calories: 200, protein: 4, carbs: 45, fats: 1 },
                        { name: isRTL ? 'قطعة دجاج' : 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 4 },
                        { name: isRTL ? 'موزة متوسطة' : 'Medium Banana', calories: 105, protein: 1, carbs: 27, fats: 0 },
                        { name: isRTL ? 'كوب حليب' : 'Cup of Milk', calories: 150, protein: 8, carbs: 12, fats: 8 },
                        { name: isRTL ? 'شريحة خبز' : 'Slice of Bread', calories: 80, protein: 3, carbs: 15, fats: 1 }
                      ].map((food, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => addFoodEntry(food)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {food.name} ({food.calories} cal)
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Common Workouts */}
                  <div>
                    <h4 className="font-medium mb-3">{isRTL ? 'تمارين شائعة' : 'Common Workouts'}</h4>
                    <div className="space-y-2">
                      {[
                        { name: isRTL ? 'المشي (30 دقيقة)' : 'Walking (30 min)', duration: 30, calories: 150 },
                        { name: isRTL ? 'الجري (30 دقيقة)' : 'Running (30 min)', duration: 30, calories: 300 },
                        { name: isRTL ? 'تمارين الأثقال' : 'Weight Training', duration: 45, calories: 250 },
                        { name: isRTL ? 'السباحة' : 'Swimming', duration: 30, calories: 350 },
                        { name: isRTL ? 'ركوب الدراجة' : 'Cycling', duration: 30, calories: 200 }
                      ].map((workout, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-left"
                          onClick={() => addWorkoutEntry(workout)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {workout.name} (-{workout.calories} cal)
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <Suspense fallback={<div className="text-center py-12">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>}>
              <ChartSection dailyCalories={calorieData.dailyCalories} />
            </Suspense>
          </TabsContent>

          {/* Tips Tab */}
          <TabsContent value="tips">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Heart,
                  title: isRTL ? 'شرب الماء' : 'Stay Hydrated',
                  content: isRTL 
                    ? 'اشرب 8-10 أكواب من الماء يومياً لتحسين الأيض وتقليل الشهية'
                    : 'Drink 8-10 glasses of water daily to boost metabolism and reduce appetite'
                },
                {
                  icon: Apple,
                  title: isRTL ? 'تناول البروتين' : 'Eat Protein',
                  content: isRTL
                    ? 'تناول البروتين في كل وجبة للحفاظ على العضلات وزيادة الشبع'
                    : 'Include protein in every meal to maintain muscle and increase satiety'
                },
                {
                  icon: Timer,
                  title: isRTL ? 'وجبات منتظمة' : 'Regular Meals',
                  content: isRTL
                    ? 'تناول وجبات منتظمة كل 3-4 ساعات لتحافظ على مستوى السكر'
                    : 'Eat regular meals every 3-4 hours to maintain stable blood sugar'
                },
                {
                  icon: Dumbbell,
                  title: isRTL ? 'التمارين الرياضية' : 'Exercise',
                  content: isRTL
                    ? 'مارس الرياضة 150 دقيقة أسبوعياً على الأقل لتحسين الصحة العامة'
                    : 'Exercise at least 150 minutes weekly for better overall health'
                },
                {
                  icon: Scale,
                  title: isRTL ? 'قياس التقدم' : 'Track Progress',
                  content: isRTL
                    ? 'قس وزنك أسبوعياً في نفس الوقت ولا تقيسه يومياً'
                    : 'Weigh yourself weekly at the same time, not daily'
                },
                {
                  icon: Activity,
                  title: isRTL ? 'النوم الكافي' : 'Adequate Sleep',
                  content: isRTL
                    ? 'احصل على 7-9 ساعات نوم يومياً لتحسين الهرمونات والأيض'
                    : 'Get 7-9 hours of sleep daily to improve hormones and metabolism'
                }
              ].map((tip, index) => (
                <m.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6 text-center">
                      <tip.icon className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="text-lg font-semibold mb-2">{tip.title}</h3>
                      <p className="text-muted-foreground text-sm">{tip.content}</p>
                    </CardContent>
                  </Card>
                </m.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </LazyMotion>
  );
};

export default CoachDiet;
