import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  MapPin,
  DollarSign,
  Clock,
  Tag,
  Palette,
  Phone,
  Save,
  X,
  Loader2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import {
  createUserService,
  updateUserService,
  handleUserListingsError,
  type IndependentService,
  type CreateServiceData,
  type UpdateServiceData
} from '@/api/userListings';

interface ServiceFormProps {
  service?: IndependentService;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (service: IndependentService) => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const isEditing = Boolean(service);

  // Form state
  const [formData, setFormData] = useState<CreateServiceData>({
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price: 0,
    durationMins: 60,
    currency: 'EGP',
    phone: '',
    city: '',
    locationLat: undefined,
    locationLon: undefined,
    categoryIds: [],
    tags: [],
    designId: undefined
  });

  const [tagInput, setTagInput] = useState('');
  const [available, setAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Design themes
  const designThemes = [
    { id: 'medical', name: 'Medical', description: 'Healthcare and medical services' },
    { id: 'beauty', name: 'Beauty', description: 'Beauty and wellness services' },
    { id: 'automotive', name: 'Automotive', description: 'Auto repair and maintenance' },
    { id: 'general', name: 'General', description: 'General business services' }
  ];

  // Popular cities
  const cities = [
    'Cairo', 'Alexandria', 'Giza', 'Shubra El Khema', 'Port Said',
    'Suez', 'Luxor', 'Aswan', 'Mansoura', 'Tanta', 'Ismailia', 'Fayyum'
  ];

  // Initialize form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        name_ar: service.translation?.name_ar || '',
        name_en: service.translation?.name_en || '',
        description_ar: service.translation?.description_ar || '',
        description_en: service.translation?.description_en || '',
        price: service.price || 0,
        durationMins: service.durationMins || 60,
        currency: service.currency || 'EGP',
        phone: service.phone || '',
        city: service.city || '',
        locationLat: service.locationLat,
        locationLon: service.locationLon,
        categoryIds: service.category?.map(c => c.id) || [],
        tags: service.tags?.map(t => t.name) || [],
        designId: service.design?.id
      });
      setAvailable(service.available);
    } else {
      // Reset form for new service
      setFormData({
        name_ar: '',
        name_en: '',
        description_ar: '',
        description_en: '',
        price: 0,
        durationMins: 60,
        currency: 'EGP',
        phone: '',
        city: '',
        locationLat: undefined,
        locationLon: undefined,
        categoryIds: [],
        tags: [],
        designId: undefined
      });
      setAvailable(true);
    }
    setErrors({});
  }, [service]);

  const handleInputChange = (field: keyof CreateServiceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleInputChange('tags', [...(formData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name_ar.trim()) {
      newErrors.name_ar = 'Arabic name is required';
    }
    if (!formData.name_en.trim()) {
      newErrors.name_en = 'English name is required';
    }
    if (formData.price && formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    if (formData.durationMins && formData.durationMins < 1) {
      newErrors.durationMins = 'Duration must be at least 1 minute';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      let result: IndependentService;
      
      if (isEditing && service) {
        const updateData: UpdateServiceData = {
          ...formData,
          available
        };
        result = await updateUserService(service.id, updateData);
      } else {
        result = await createUserService(formData);
      }

      toast({
        title: "Success",
        description: `Service ${isEditing ? 'updated' : 'created'} successfully!`
      });

      onSuccess(result);
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: handleUserListingsError(err),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {isEditing ? 'Edit Service' : 'Create New Service'}
                  </CardTitle>
                  <CardDescription>
                    {isEditing ? 'Update your service details' : 'Add a new independent service listing'}
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name_ar">Service Name (Arabic) *</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => handleInputChange('name_ar', e.target.value)}
                    placeholder="اسم الخدمة"
                    dir="rtl"
                    className={errors.name_ar ? 'border-destructive' : ''}
                  />
                  {errors.name_ar && (
                    <p className="text-sm text-destructive">{errors.name_ar}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name_en">Service Name (English) *</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => handleInputChange('name_en', e.target.value)}
                    placeholder="Service name"
                    className={errors.name_en ? 'border-destructive' : ''}
                  />
                  {errors.name_en && (
                    <p className="text-sm text-destructive">{errors.name_en}</p>
                  )}
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description_ar">Description (Arabic)</Label>
                  <Textarea
                    id="description_ar"
                    value={formData.description_ar}
                    onChange={(e) => handleInputChange('description_ar', e.target.value)}
                    placeholder="وصف الخدمة..."
                    dir="rtl"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => handleInputChange('description_en', e.target.value)}
                    placeholder="Service description..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Price and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (EGP)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={`pl-10 ${errors.price ? 'border-destructive' : ''}`}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="duration"
                      type="number"
                      value={formData.durationMins || ''}
                      onChange={(e) => handleInputChange('durationMins', parseInt(e.target.value) || 60)}
                      placeholder="60"
                      className={`pl-10 ${errors.durationMins ? 'border-destructive' : ''}`}
                      min="1"
                    />
                  </div>
                  {errors.durationMins && (
                    <p className="text-sm text-destructive">{errors.durationMins}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EGP">EGP (Egyptian Pound)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+20 xxx xxx xxxx"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -transtone-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Design Theme */}
              <div className="space-y-2">
                <Label>Design Theme</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {designThemes.map((theme) => (
                    <Card
                      key={theme.id}
                      className={`cursor-pointer transition-colors ${
                        formData.designId === theme.id
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleInputChange('designId', theme.id)}
                    >
                      <CardContent className="p-3 text-center">
                        <Palette className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <h4 className="font-medium text-sm">{theme.name}</h4>
                        <p className="text-xs text-muted-foreground">{theme.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag..."
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Availability Toggle */}
              {isEditing && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="available" className="text-base font-medium">
                      Service Available
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle to make this service available for booking
                    </p>
                  </div>
                  <Switch
                    id="available"
                    checked={available}
                    onCheckedChange={setAvailable}
                  />
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {isEditing ? 'Update Service' : 'Create Service'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ServiceForm;
