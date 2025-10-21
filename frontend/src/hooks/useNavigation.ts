import { useRouter } from 'next/router';
import { useCallback } from 'react';

/**
 * Custom hook that provides navigation functionality compatible with Next.js
 * This replaces react-router-dom's useNavigate hook
 */
export function useNavigation() {
  const router = useRouter();

  const navigate = useCallback((to: string | number) => {
    if (typeof to === 'number') {
      // Handle relative navigation like navigate(-1)
      if (to === -1) {
        router.back();
      } else {
        // For other numbers, we can't directly go forward/backward by n steps
        // This is a limitation compared to react-router
        console.warn('Navigation by steps other than -1 is not supported');
      }
    } else {
      // Handle string paths
      router.push(to);
    }
  }, [router]);

  return navigate;
}

// Alias for consistency with react-router-dom naming
export const useNavigate = useNavigation;
