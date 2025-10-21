'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Moon, Sun, Globe, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ServiceNavbar() {
  // const { t, i18n } = useTranslation();
  // const { theme, setTheme } = useTheme();
  // const router = useRouter();
  // const isRTL = i18n.language === 'ar';

  // const changeLanguage = (newLang: string) => {
  //   const newDir = newLang === 'ar' ? 'rtl' : 'ltr';
    
  //   // Change language
  //   i18n.changeLanguage(newLang);
    
  //   // Update document direction and language
  //   if (typeof document !== 'undefined') {
  //     document.documentElement.dir = newDir;
  //     document.documentElement.lang = newLang;
  //   }
    
  //   // Persist to localStorage
  //   if (typeof window !== 'undefined') {
  //     localStorage.setItem('language', newLang);
  //     localStorage.setItem('direction', newDir);
  //   }
  // };

  // const handleBack = () => {
  //   router.back();
  // };

  return (
    <div></div>
    // <motion.nav 
    //   initial={{ y: -20, opacity: 0 }}
    //   animate={{ y: 0, opacity: 1 }}
    //   className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-xl bg-transparent border-b border-white/20"
    // >
    //   <div className="mx-auto max-w-7xl flex items-center justify-between">
    //     {/* Back Button & Logo */}
    //     <motion.div
    //       initial={{ opacity: 0, x: -20 }}
    //       animate={{ opacity: 1, x: 0 }}
    //       transition={{ delay: 0.1 }}
    //       className="flex items-center gap-4"
    //     >
    //       <Button
    //         variant="ghost"
    //         size="sm"
    //         onClick={handleBack}
    //         className="gap-2 rounded-full hover:bg-background-secondary"
    //       >
    //         <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
    //         <span className="hidden sm:inline text-white">
    //           {isRTL ? 'عودة' : 'Back'}
    //         </span>
    //       </Button>

    //       <div className="text-2xl font-bold text-white flex items-center gap-2">
    //         <div className="w-8 h-8 rounded-lg bg-green-primary flex items-center justify-center">
    //           <span className="text-white font-bold text-sm">دب</span>
    //         </div>
    //         <Link href="/" className="hover:opacity-80 transition-opacity">
    //           {t('nav.logo')}
    //         </Link>
    //       </div>
    //     </motion.div>

    //     {/* Right Controls */}
    //     <motion.div
    //       initial={{ opacity: 0, x: 20 }}
    //       animate={{ opacity: 1, x: 0 }}
    //       transition={{ delay: 0.3 }}
    //       className="flex items-center gap-4"
    //     >
    //       {/* Language Toggle */}
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button
    //             variant="ghost"
    //             size="sm"
    //             className="gap-2 rounded-full hover:bg-background-secondary"
    //           >
    //             <Globe className="h-4 w-4 text-white" />
    //             <span className="text-sm hidden sm:inline text-white">
    //               {i18n.language === 'ar' ? 'العربية' : 'English'}
    //             </span>
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent 
    //           align="end"
    //           className="bg-background/95 backdrop-blur-sm border-background-tertiary/50"
    //         >
    //           <DropdownMenuItem 
    //             onClick={() => changeLanguage('ar')}
    //             className={i18n.language === 'ar' ? 'bg-accent' : ''}
    //           >
    //             العربية
    //           </DropdownMenuItem>
    //           <DropdownMenuItem 
    //             onClick={() => changeLanguage('en')}
    //             className={i18n.language === 'en' ? 'bg-accent' : ''}
    //           >
    //             English
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>

    //       {/* Theme Toggle */}
    //       <DropdownMenu>
    //         <DropdownMenuTrigger asChild>
    //           <Button
    //             variant="ghost"
    //             size="icon"
    //             className="rounded-full hover:bg-background-secondary"
    //           >
    //             <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-white" />
    //             <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-white" />
    //             <span className="sr-only">Toggle theme</span>
    //           </Button>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent 
    //           align="end"
    //           className="bg-background/95 backdrop-blur-sm border-background-tertiary/50"
    //         >
    //           <DropdownMenuItem onClick={() => setTheme('light')}>
    //             {isRTL ? 'فاتح' : 'Light'}
    //           </DropdownMenuItem>
    //           <DropdownMenuItem onClick={() => setTheme('dark')}>
    //             {isRTL ? 'داكن' : 'Dark'}
    //           </DropdownMenuItem>
    //           <DropdownMenuItem onClick={() => setTheme('system')}>
    //             {isRTL ? 'تلقائي' : 'System'}
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>

    //       {/* Login/Sign Up buttons for non-authenticated users */}
    //       <div className="flex items-center gap-2">
    //         <Button variant="ghost" size="sm" asChild>
    //           <Link href="/login">{t('auth.login')}</Link>
    //         </Button>
    //         <Button size="sm" asChild className="bg-green-primary hover:bg-green-primary/90">
    //           <Link href="/signup">{t('auth.signup')}</Link>
    //         </Button>
    //       </div>
    //     </motion.div>
    //   </div>
    // </motion.nav>
  );
}
