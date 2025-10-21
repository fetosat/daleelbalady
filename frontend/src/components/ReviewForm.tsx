import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { StarRating } from './StarRating';
import reviewAPI from '../services/reviewAPI';

interface ReviewFormProps {
  serviceId?: string;
  productId?: string;
  shopId?: string;
  onReviewSubmitted?: (review: any) => void;
  onCancel?: () => void;
  className?: string;
}

export function ReviewForm({ 
  serviceId, 
  productId, 
  shopId, 
  onReviewSubmitted, 
  onCancel,
  className = '' 
}: ReviewFormProps) {
  const { t, i18n } = useTranslation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isRTL = i18n.language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError(i18n.language === 'ar' ? 'يرجى اختيار تقييم' : 'Please select a rating');
      return;
    }

    // Note: Authentication is now checked by backend via cookies
    // We'll handle 401 errors in the catch block

    setIsSubmitting(true);
    setError('');

    try {
      const reviewData = {
        rating,
        comment: comment.trim() || undefined,
        ...(serviceId && { serviceId }),
        ...(productId && { productId }),
        ...(shopId && { shopId })
      };

      const response = await reviewAPI.createReview(reviewData);
      
      if (onReviewSubmitted) {
        onReviewSubmitted(response.review);
      }

      // Reset form
      setRating(0);
      setComment('');
      
      // Show success message (you might want to use a toast library instead)
      alert(i18n.language === 'ar' ? 'تم إرسال التقييم بنجاح!' : 'Review submitted successfully!');

    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review';
      
      // If authentication error, redirect to login
      if (errorMessage.includes('Authentication required') || errorMessage.includes('401')) {
        const confirmLogin = window.confirm(
          i18n.language === 'ar' 
            ? 'يجب تسجيل الدخول لإضافة تقييم. هل تريد الانتقال لصفحة تسجيل الدخول؟'
            : 'Please log in to submit a review. Would you like to go to the login page?'
        );
        if (confirmLogin) {
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
        return;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setComment('');
    setError('');
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onSubmit={handleSubmit}
      className={`bg-white dark:bg-zinc-800 rounded-2xl p-6 border border-stone-200 dark:border-zinc-700 shadow-lg ${className}`}
    >
      <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
        {i18n.language === 'ar' ? 'إضافة تقييم' : 'Add Review'}
      </h3>

      {/* Rating Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">
          {i18n.language === 'ar' ? 'التقييم' : 'Rating'}
          <span className="text-red-500 ml-1">*</span>
        </label>
        
        <div className="flex items-center gap-3">
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
            showText
            className="flex-1"
          />
        </div>
        
        {rating > 0 && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-sm text-stone-500 dark:text-stone-400 mt-2"
          >
            {i18n.language === 'ar' ? 
              `لقد اخترت ${rating} ${rating === 1 ? 'نجمة' : 'نجوم'}` : 
              `You selected ${rating} star${rating === 1 ? '' : 's'}`
            }
          </motion.p>
        )}
      </div>

      {/* Comment Field */}
      <div className="mb-6">
        <label 
          htmlFor="review-comment"
          className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2"
        >
          {i18n.language === 'ar' ? 'التعليق (اختياري)' : 'Comment (Optional)'}
        </label>
        
        <textarea
          id="review-comment"
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={i18n.language === 'ar' ? 
            'شارك تجربتك مع الآخرين...' : 
            'Share your experience with others...'
          }
          className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-zinc-700 border border-stone-200 dark:border-zinc-600 text-stone-900 dark:text-white placeholder-stone-500 dark:placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-colors"
          style={{ textAlign: isRTL ? 'right' : 'left' }}
          maxLength={1000}
        />
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-stone-400">
            {comment.length}/1000
          </span>
          {comment.length > 900 && (
            <span className="text-xs text-amber-600">
              {i18n.language === 'ar' ? 
                `${1000 - comment.length} حرف متبقي` : 
                `${1000 - comment.length} characters left`
              }
            </span>
          )}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          type="button"
          onClick={handleCancel}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 px-6 py-3 bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-stone-200 font-semibold rounded-xl hover:bg-stone-300 dark:hover:bg-zinc-600 transition-colors"
        >
          {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
        </motion.button>
        
        <motion.button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          whileHover={rating > 0 && !isSubmitting ? { scale: 1.02 } : {}}
          whileTap={rating > 0 && !isSubmitting ? { scale: 0.98 } : {}}
          className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
            rating === 0 || isSubmitting
              ? 'bg-stone-300 dark:bg-zinc-600 text-stone-500 dark:text-stone-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
              <span>
                {i18n.language === 'ar' ? 'جاري الإرسال...' : 'Submitting...'}
              </span>
            </div>
          ) : (
            i18n.language === 'ar' ? 'إرسال التقييم' : 'Submit Review'
          )}
        </motion.button>
      </div>

      {/* Note: Login prompt removed - authentication is now handled by backend via cookies */}
      {/* Users will be redirected to login if not authenticated when they try to submit */}
    </motion.form>
  );
}

// Review success animation component
export function ReviewSubmittedAnimation() {
  const { i18n } = useTranslation();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center justify-center p-8 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-700"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4"
      >
        <motion.svg
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-8 h-8 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path d="M20 6L9 17l-5-5" />
        </motion.svg>
      </motion.div>
      
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-xl font-bold text-green-800 dark:text-green-300 mb-2"
      >
        {i18n.language === 'ar' ? 'شكراً لك!' : 'Thank You!'}
      </motion.h3>
      
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-green-700 dark:text-green-400 text-center"
      >
        {i18n.language === 'ar' ? 
          'تم إرسال تقييمك بنجاح' : 
          'Your review has been submitted successfully'
        }
      </motion.p>
    </motion.div>
  );
}
