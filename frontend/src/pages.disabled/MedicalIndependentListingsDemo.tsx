import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Stethoscope,
  UserCheck,
  Plus,
  Search,
  BarChart3,
  Calendar,
  Package,
  Star,
  MapPin,
  Phone,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MedicalLayout from '@/components/layout/MedicalLayout';
import IndependentListingsSearch from '@/components/search/IndependentListingsSearch';
import ClientOnly from '@/components/ClientOnly';
import Head from 'next/head';

const MedicalIndependentListingsDemoContent: React.FC = () => {
  // Dynamic import of useNavigate to avoid SSR issues
  const navigate = typeof window !== 'undefined' ? require('react-router-dom').useNavigate() : () => {};

  const medicalServices = [
    {
      id: 1,
      name: 'General Consultation',
      nameAr: 'استشارة عامة',
      provider: 'Dr. Ahmed Hassan',
      price: 200,
      duration: 30,
      rating: 4.8,
      reviews: 124,
      location: 'Nasr City, Cairo',
      phone: '+20 10 1234 5678',
      specialty: 'Internal Medicine',
      available: true
    },
    {
      id: 2,
      name: 'Cardiology Checkup',
      nameAr: 'فحص القلب',
      provider: 'Dr. Sarah Mohamed',
      price: 350,
      duration: 45,
      rating: 4.9,
      reviews: 89,
      location: 'Maadi, Cairo',
      phone: '+20 11 2345 6789',
      specialty: 'Cardiology',
      available: true
    },
    {
      id: 3,
      name: 'Pediatric Care',
      nameAr: 'رعاية الأطفال',
      provider: 'Dr. Mona Ali',
      price: 180,
      duration: 25,
      rating: 4.7,
      reviews: 156,
      location: 'Heliopolis, Cairo',
      phone: '+20 12 3456 7890',
      specialty: 'Pediatrics',
      available: false
    }
  ];

  const medicalProducts = [
    {
      id: 1,
      name: 'Digital Blood Pressure Monitor',
      nameAr: 'جهاز قياس ضغط الدم الرقمي',
      provider: 'MedEquip Store',
      price: 450,
      stock: 15,
      rating: 4.6,
      reviews: 78,
      location: 'Downtown, Cairo',
      category: 'Medical Devices'
    },
    {
      id: 2,
      name: 'Vitamin D3 Supplements',
      nameAr: 'مكملات فيتامين د3',
      provider: 'HealthPlus Pharmacy',
      price: 85,
      stock: 50,
      rating: 4.5,
      reviews: 203,
      location: 'Zamalek, Cairo',
      category: 'Supplements'
    }
  ];

  const stats = [
    {
      icon: UserCheck,
      label: 'Medical Providers',
      labelAr: 'مقدمي الخدمات الطبية',
      value: '2,847',
      change: '+12%',
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      label: 'Health Services',
      labelAr: 'الخدمات الصحية',
      value: '15,632',
      change: '+8%',
      color: 'text-red-500'
    },
    {
      icon: Package,
      label: 'Medical Products',
      labelAr: 'المنتجات الطبية',
      value: '8,419',
      change: '+15%',
      color: 'text-green-600'
    },
    {
      icon: Star,
      label: 'Average Rating',
      labelAr: 'متوسط التقييم',
      value: '4.8',
      change: '+0.2',
      color: 'text-yellow-500'
    }
  ];

  return (
    <MedicalLayout>
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <Plus className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 dark:text-blue-100 mb-4">
            Medical Independent Listings
          </h1>
          <p className="text-xl text-blue-700 dark:text-blue-300 mb-8 max-w-3xl mx-auto">
            Connect with independent medical professionals and find quality healthcare products
            without the need for traditional medical centers or pharmacies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/dashboard/independent-listings')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3"
            >
              <UserCheck className="mr-2 h-5 w-5" />
              Manage Listings
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/search/independent-listings')}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-3"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Services
            </Button>
          </div>
        </motion.section>

        {/* Statistics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-blue-200/50 dark:border-stone-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        {stat.change} this month
                      </p>
                    </div>
                    <div className={`p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.section>

        {/* Search Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-blue-200/50 dark:border-stone-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <Search className="h-5 w-5" />
                Search Medical Services & Products
              </CardTitle>
              <CardDescription>
                Find the healthcare services and medical products you need from independent providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IndependentListingsSearch
                showFilters={true}
                onResults={(results) => {
                  console.log('Search results:', results);
                }}
              />
            </CardContent>
          </Card>
        </motion.section>

        {/* Featured Services */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              Featured Medical Services
            </h2>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              View All Services
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {medicalServices.map((service) => (
              <Card key={service.id} className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-blue-200/50 dark:border-stone-700/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                        by {service.provider}
                      </p>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        {service.specialty}
                      </p>
                    </div>
                    <Badge variant={service.available ? 'default' : 'secondary'}>
                      {service.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{service.rating}</span>
                      <span>({service.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration} mins</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{service.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {service.price} EGP
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Featured Products */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              Featured Medical Products
            </h2>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              View All Products
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {medicalProducts.map((product) => (
              <Card key={product.id} className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-blue-200/50 dark:border-stone-700/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-100 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                        by {product.provider}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    <Badge variant="default">
                      In Stock: {product.stock}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{product.rating}</span>
                      <span>({product.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400 mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{product.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        {product.price} EGP
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-white mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                Ready to Join Our Medical Network?
              </h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Whether you're a healthcare professional or medical supplier, 
                join our independent listings to reach more patients and customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/dashboard/independent-listings')}
                  className="bg-white text-blue-700 hover:bg-blue-50"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Start Listing
                </Button>
                <Button 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-700"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
    </MedicalLayout>
  );
};

const MedicalIndependentListingsDemo: React.FC = () => {
  return (
    <>
      <Head>
        <title>Medical Independent Listings - Daleel Balady</title>
        <meta name="description" content="Find and manage independent medical services and products in Egypt." />
      </Head>
      <ClientOnly 
        fallback={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-stone-600 dark:text-stone-400">Loading Medical Services...</p>
            </div>
          </div>
        }
      >
        <MedicalIndependentListingsDemoContent />
      </ClientOnly>
    </>
  );
};

export default MedicalIndependentListingsDemo;
