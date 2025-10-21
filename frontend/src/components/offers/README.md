# Offers Slider Components

Modern, animated vertical slider for displaying featured offers with Framer Motion animations, responsive design, and RTL support.

## Components

### OfferSlider

The main slider component that displays offers in a vertical auto-sliding carousel.

#### Features
- ✨ Smooth vertical slide transitions (one offer at a time)
- 🔄 Auto-play with configurable delay (default: 5 seconds)
- ⏸️ Pause on hover (desktop) and manual play/pause button
- 📱 Touch swipe support for mobile (vertical swipe)
- 🎯 Navigation dots and prev/next buttons
- 🌐 Full RTL support for Arabic
- 🌓 Dark/Light mode compatible
- 📊 Automatic view and click tracking
- 🎨 Shimmer loading skeleton

#### Props

```typescript
interface OfferSliderProps {
  categoryId?: string;        // Filter offers by category
  subCategoryId?: string;      // Filter offers by subcategory
  autoPlayDelay?: number;      // Auto-advance delay in ms (default: 5000)
  className?: string;          // Additional CSS classes
  fixedHeight?: string;        // Fixed height classes (default: 'h-[320px] md:h-[400px]')
}
```

#### Usage

```tsx
import { OfferSlider } from '@/components/offers';

// Basic usage
<OfferSlider />

// With custom settings
<OfferSlider 
  autoPlayDelay={6000}
  fixedHeight="h-[280px] sm:h-[320px] md:h-[400px]"
  categoryId="electronics"
/>
```

### OfferCard

Individual offer card component with rich animations and overlay design.

#### Features
- 🖼️ Image or gradient background support
- 🏷️ Discount badge with prominent display
- ⭐ Exclusive/Premium level badges
- ⏰ Urgency badges (expires soon)
- 🏪 Provider/Shop logo display
- 📝 Title, description, and metadata
- 🎯 CTA button with navigation
- 🎨 Smooth entry animations
- 🌐 RTL support

#### Props

```typescript
interface OfferCardProps {
  offer: Offer;                        // Offer data object
  onView?: (offerId: string) => void;  // View tracking callback
  onClick?: (offerId: string) => void; // Click tracking callback
}
```

#### Usage

```tsx
import { OfferCard } from '@/components/offers';

<OfferCard 
  offer={offerData}
  onView={handleView}
  onClick={handleClick}
/>
```

## Offer Data Structure

The components expect offer data from the `useOffers` hook:

```typescript
interface Offer {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  level: 'BASIC' | 'STANDARD' | 'PREMIUM' | 'EXCLUSIVE';
  targetType: 'SERVICE' | 'PRODUCT' | 'BOTH';
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  isExclusive: boolean;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  
  shop?: {
    id: string;
    name: string;
    logoImage?: string;
  };
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}
```

## Animation Details

### Vertical Slide Transition
- Enter: Slides in from bottom/top (100% → 0)
- Exit: Slides out to top/bottom (0 → -100%/100%)
- Spring physics for natural motion (stiffness: 300, damping: 30)
- Fade effect during transition

### Entry Animations
- Discount badge: Scale + rotate animation
- Level badges: Scale animation with stagger
- Content: Slide up with fade-in
- Background image: Subtle scale on hover

## Styling

### Tailwind Classes
The components use Tailwind CSS with custom classes:

```css
/* Fixed heights */
h-[280px]    /* Mobile */
h-[320px]    /* Tablet */
h-[400px]    /* Desktop */

/* Backdrop effects */
backdrop-blur-sm
bg-black/30
bg-gradient-to-t from-black/80 via-black/50 to-transparent

/* Animations */
animate-pulse    /* Urgency badges */
animate-shimmer  /* Loading state */
hover:scale-110  /* Image zoom */
```

## Responsive Behavior

### Mobile (< 640px)
- Height: 280px
- Vertical swipe gestures enabled
- Touch-friendly navigation
- Compact badges and buttons

### Tablet (640px - 768px)
- Height: 320px
- Hover effects disabled
- Touch interactions optimized

### Desktop (> 768px)
- Height: 400px
- Pause on hover
- All navigation controls visible
- Enhanced hover effects

## RTL Support

The components automatically adapt to RTL languages (Arabic):

- Text direction: `dir="rtl"`
- Flex directions reversed: `flex-row-reverse`
- Icon rotation: `rotate-180` for arrows
- Proper spacing adjustments

## Accessibility

- ARIA labels for navigation buttons
- Keyboard navigation support
- Proper focus states
- Screen reader friendly
- Semantic HTML structure

## Performance Optimizations

- Lazy loading for offer images
- Memoized callbacks with `useCallback`
- Efficient re-render prevention
- Optimized animation performance
- Automatic cleanup of intervals

## Integration Example (Find Page)

```tsx
import { OfferSlider } from '@/components/offers';

export default function FindPage() {
  return (
    <div>
      {/* Header Section */}
      
      {/* Offers Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Tag className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
            🔥 عروض حصرية متاحة الآن
          </h2>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <OfferSlider 
            autoPlayDelay={5000} 
            fixedHeight="h-[280px] sm:h-[320px] md:h-[400px]" 
          />
        </div>
      </motion.div>

      {/* Categories Section */}
    </div>
  );
}
```

## Translations

Required translation keys in `/src/locales/[lang].json`:

```json
{
  "find": {
    "offers": {
      "categoryTitle": "{{category}} Offers",
      "defaultTitle": "Special Offers",
      "subtitle": "Exclusive discounts available now",
      "count": "offer",
      "swipeHint": "Swipe to see more",
      "viewOffer": "View Details",
      "exclusive": "Exclusive"
    }
  },
  "common": {
    "currency": "EGP",
    "exclusive": "Exclusive",
    "premium": "Premium"
  }
}
```

## API Integration

The components use the `useOffers` hook which fetches from:

```
GET /api/offers?categoryId={id}&sortBy=discount&limit=8&isActive=true
```

View and click tracking endpoints:
```
POST /api/offers/{offerId}/view
POST /api/offers/{offerId}/click
```

## Future Enhancements

- [ ] Parallax effect for background images
- [ ] Category filter chips above slider
- [ ] Animated offer badges (Hot Deal, New, etc.)
- [ ] Video background support
- [ ] Share offer functionality
- [ ] Favorite/bookmark offers
- [ ] A/B testing variants

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Dependencies

- `framer-motion`: ^12.x - Animations
- `react-i18next`: ^15.x - Translations
- `lucide-react`: ^0.x - Icons
- `@/hooks/useOffers`: Custom hook for data fetching
- `@/components/ui/button`: Shadcn UI button component

---

**Created:** 2025-10-17  
**Version:** 1.0.0  
**Author:** Daleel Balady Team

