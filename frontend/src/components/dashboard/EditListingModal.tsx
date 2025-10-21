'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ListingType, ListingFormData, UnifiedListing } from '@/types/dashboard';
import { X, Store, Package, ShoppingBag, Upload, ArrowLeft, ArrowRight, Check, Image as ImageIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ListingFormData) => Promise<void>;
  listing: UnifiedListing | null;
  existingShops?: Array<{ id: string; name: string }>;
}

type Step = 'details' | 'media' | 'review';

export const EditListingModal: React.FC<EditListingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  listing,
  existingShops = [],
}) => {
  const [step, setStep] = useState<Step>('details');
  const [formData, setFormData] = useState<ListingFormData>({
    type: 'SHOP',
    name: '',
    description: '',
    city: '',
    price: undefined,
    currency: 'EGP',
    phone: '',
    email: '',
    website: '',
    locationLat: undefined,
    locationLon: undefined,
    durationMins: undefined,
    stock: undefined,
    sku: '',
    coverImage: '',
    logoImage: '',
    galleryImages: [],
    shopId: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill form data when listing changes
  useEffect(() => {
    if (listing) {
      const coverImg = listing.coverImage || '';
      setFormData({
        type: listing.type,
        name: listing.name,
        description: listing.description || '',
        city: listing.city || '',
        price: listing.price,
        currency: listing.currency || 'EGP',
        phone: listing.phone || '',
        email: listing.email || '',
        website: listing.website || '',
        locationLat: listing.locationLat,
        locationLon: listing.locationLon,
        durationMins: listing.durationMins,
        stock: listing.stock,
        sku: listing.sku || '',
        coverImage: coverImg,
        logoImage: listing.logoImage || '',
        galleryImages: listing.galleryImages || [],
        shopId: listing.shopId,
      });
      setImagePreview(coverImg);
    }
  }, [listing]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const updateFormData = (updates: Partial<ListingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Failed to update listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('details');
    onClose();
  };

  const canProceed = () => {
    return formData.name.trim().length > 0;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        updateFormData({ coverImage: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    updateFormData({ coverImage: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!listing || !isOpen) return null;

  return (
    <AnimatePresence>
      <div className='absolute w-screen h-screen bg-transparent flex justify-center items-center'>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className=" bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <div>
                <h2 className="text-2xl font-bold text-stone-900">Edit {listing.type}</h2>
                <p className="text-sm text-stone-600 mt-1">
                  Step {['details', 'media', 'review'].indexOf(step) + 1} of 3
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-stone-500" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-stone-200">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: '0%' }}
                animate={{
                  width: `${((['details', 'media', 'review'].indexOf(step) + 1) / 3) * 100}%`
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 'details' && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-semibold text-stone-900 mb-4">
                      {formData.type} Details
                    </h3>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Enter ${formData.type.toLowerCase()} name`}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => updateFormData({ description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => updateFormData({ city: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Cairo, Alexandria..."
                        />
                      </div>

                      {/* Price or Stock */}
                      {formData.type !== 'PRODUCT' ? (
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Price (EGP)</label>
                          <input
                            type="number"
                            value={formData.price || ''}
                            onChange={(e) => updateFormData({ price: parseFloat(e.target.value) || undefined })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Stock</label>
                          <input
                            type="number"
                            value={formData.stock || ''}
                            onChange={(e) => updateFormData({ stock: parseInt(e.target.value) || undefined })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                        </div>
                      )}
                    </div>

                    {/* Product-specific: Price + SKU */}
                    {formData.type === 'PRODUCT' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Price (EGP)</label>
                          <input
                            type="number"
                            value={formData.price || ''}
                            onChange={(e) => updateFormData({ price: parseFloat(e.target.value) || undefined })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">SKU</label>
                          <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) => updateFormData({ sku: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="PROD-001"
                          />
                        </div>
                      </div>
                    )}

                    {/* Service-specific: Duration */}
                    {formData.type === 'SERVICE' && (
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Duration (minutes)</label>
                        <input
                          type="number"
                          value={formData.durationMins || ''}
                          onChange={(e) => updateFormData({ durationMins: parseInt(e.target.value) || undefined })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="60"
                        />
                      </div>
                    )}

                    {/* Shop selection for Services and Products */}
                    {(formData.type === 'SERVICE' || formData.type === 'PRODUCT') && existingShops.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Associated Shop</label>
                        <select
                          value={formData.shopId || ''}
                          onChange={(e) => updateFormData({ shopId: e.target.value || undefined })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">None</option>
                          {existingShops.map((shop) => (
                            <option key={shop.id} value={shop.id}>{shop.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Contact Info (for shops) */}
                    {formData.type === 'SHOP' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => updateFormData({ phone: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+20 123 456 7890"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData({ email: e.target.value })}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="shop@example.com"
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {step === 'media' && (
                  <motion.div
                    key="media"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-lg font-semibold text-stone-900 mb-4">Add Media (Optional)</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        {formData.type === 'SHOP' ? 'Cover Image' : 'Image'}
                      </label>
                      
                      {imagePreview ? (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg border-2 border-stone-300"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="cursor-pointer text-center py-12 border-2 border-dashed border-stone-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                          <Upload className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                          <p className="text-sm text-stone-600 mb-2">Click to upload image</p>
                          <p className="text-xs text-stone-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>

                    {formData.type === 'SHOP' && (
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                          Logo Image (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.logoImage || ''}
                          onChange={(e) => updateFormData({ logoImage: e.target.value })}
                          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter logo image URL"
                        />
                      </div>
                    )}

                    <p className="text-xs text-stone-500">
                      Tip: Use high-quality images for better visibility
                    </p>
                  </motion.div>
                )}

                {step === 'review' && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-lg font-semibold text-stone-900 mb-4">Review Changes</h3>
                    <div className="bg-stone-50 rounded-xl p-6 space-y-4">
                      <div>
                        <div className="text-xs font-medium text-stone-500 uppercase">Type</div>
                        <div className="text-sm text-stone-900 mt-1">{formData.type}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-stone-500 uppercase">Name</div>
                        <div className="text-sm text-stone-900 mt-1">{formData.name}</div>
                      </div>
                      {formData.description && (
                        <div>
                          <div className="text-xs font-medium text-stone-500 uppercase">Description</div>
                          <div className="text-sm text-stone-900 mt-1">{formData.description}</div>
                        </div>
                      )}
                      {formData.city && (
                        <div>
                          <div className="text-xs font-medium text-stone-500 uppercase">City</div>
                          <div className="text-sm text-stone-900 mt-1">{formData.city}</div>
                        </div>
                      )}
                      {formData.price && (
                        <div>
                          <div className="text-xs font-medium text-stone-500 uppercase">Price</div>
                          <div className="text-sm text-stone-900 mt-1">{formData.price} {formData.currency}</div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-stone-200 bg-stone-50">
              <button
                onClick={() => {
                  const steps: Step[] = ['details', 'media', 'review'];
                  const currentIndex = steps.indexOf(step);
                  if (currentIndex > 0) {
                    setStep(steps[currentIndex - 1]);
                  }
                }}
                disabled={step === 'details'}
                className="px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>

              {step !== 'review' ? (
                <button
                  onClick={() => {
                    const steps: Step[] = ['details', 'media', 'review'];
                    const currentIndex = steps.indexOf(step);
                    if (currentIndex < steps.length - 1 && canProceed()) {
                      setStep(steps[currentIndex + 1]);
                    }
                  }}
                  disabled={!canProceed()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
      </div>
    </AnimatePresence>
  );
};

export default EditListingModal;

