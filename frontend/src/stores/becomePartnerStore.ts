import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProviderPlanType } from '../lib/subscription';

export interface PartnerFormData {
  // Personal Info (Step 1 - if not logged in)
  name: string;
  emailOrPhone: string;
  password: string;
  confirmPassword: string;

  // Business Type & Info (Step 2/3)
  businessType: 'PROVIDER' | 'DELIVERY';
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessDescription: string;
  businessAddress: string;
  businessCity: string;

  // Category Selection (Step 3/4)
  categoryId: string;
  subCategoryId: string;
  location: {
    lat?: number;
    lon?: number;
    address?: string;
    city?: string;
  };

  // Documents (Step 4/5)
  documents: File[];

  // Subscription Plan (Step 5/6)
  selectedPlan: ProviderPlanType;
  hasFieldRepDiscount: boolean;
  matchingDiscountPercent: number;

  // Premium features (locked until paid)
  promotionalVideo?: string;
  advancedListing?: boolean;
  verifiedBadge?: boolean;
}

interface BecomePartnerStore {
  formData: PartnerFormData;
  currentStep: number;
  totalSteps: number;
  isLoggedIn: boolean;
  isDraft: boolean;

  // Actions
  setFormData: (data: Partial<PartnerFormData>) => void;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetForm: () => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  saveDraft: () => void;
  clearDraft: () => void;
}

const getInitialFormData = (): PartnerFormData => ({
  name: '',
  emailOrPhone: '',
  password: '',
  confirmPassword: '',
  businessType: 'PROVIDER',
  businessName: '',
  businessEmail: '',
  businessPhone: '',
  businessDescription: '',
  businessAddress: '',
  businessCity: '',
  categoryId: '',
  subCategoryId: '',
  location: {},
  documents: [],
  selectedPlan: ProviderPlanType.BASIC_FREE,
  hasFieldRepDiscount: false,
  matchingDiscountPercent: 0,
});

export const useBecomePartnerStore = create<BecomePartnerStore>()(
  persist(
    (set, get) => ({
      formData: getInitialFormData(),
      currentStep: 1,
      totalSteps: 6,
      isLoggedIn: false,
      isDraft: false,

      setFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data },
        isDraft: true,
      })),

      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () => set((state) => ({
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
      })),

      prevStep: () => set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 1),
      })),

      resetForm: () => set({
        formData: getInitialFormData(),
        currentStep: 1,
        isDraft: false,
      }),

      setIsLoggedIn: (isLoggedIn) => set((state) => ({
        isLoggedIn,
        currentStep: isLoggedIn ? 2 : 1,
        totalSteps: isLoggedIn ? 5 : 6,
      })),

      saveDraft: () => set({ isDraft: true }),

      clearDraft: () => set({ isDraft: false }),
    }),
    {
      name: 'become-partner-draft',
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        isDraft: state.isDraft,
      }),
    }
  )
);

