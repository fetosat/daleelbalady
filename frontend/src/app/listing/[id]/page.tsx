'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { loadPageLayout } from '@/utils/designLoader'
import dynamic from 'next/dynamic'

interface ListingData {
  id: string
  type: 'shop' | 'service' | 'user' | 'product'
  planType: 'FREE' | 'VERIFICATION' | 'SERVICES' | 'PRODUCTS'
  data: any
  designSlug?: string
}

export default function ListingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [listing, setListing] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [DesignComponent, setDesignComponent] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchListing = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch user data - this is now the primary listing
        const response = await fetch(`https://api.daleelbalady.com/api/users/${id}`, {
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('User not found')
        }

        const data = await response.json()
        
        if (data.user) {
          // Debug: Log the received data
          console.log('🔍 User data received:', {
            hasDesign: !!data.user.design,
            design: data.user.design,
            hasProviderSubscription: !!data.user.providerSubscription,
            providerSubscription: data.user.providerSubscription
          })
          
          // Determine plan type based on user's subscription
          // For USER listings (profile pages), we use VERIFICATION plan to show their profile
          // SERVICES and PRODUCTS plans are for individual service/product pages, not user profiles
          let planType: 'FREE' | 'VERIFICATION' | 'SERVICES' | 'PRODUCTS' = 'FREE'
          
          // User profiles should use VERIFICATION plan if verified
          if (data.user.isVerified) {
            planType = 'VERIFICATION'
          }
          // Even if they have advanced subscriptions, we show their profile page
          // Individual services/products will have their own dedicated pages
          
          // Get design slug from user's design or category design
          const designSlug = data.user.design?.slug || data.user.services?.[0]?.design?.slug || null
          
          console.log('🎨 Design slug resolved:', designSlug)
          
          setListing({ 
            id, 
            type: 'user', 
            planType, 
            data: data.user,
            designSlug
          })
          
          // Load the appropriate design component
          console.log(`📦 Loading design component for planType: ${planType}, designSlug: ${designSlug}`)
          
          loadPageLayout(planType, designSlug).then(Component => {
            console.log('✅ Successfully loaded design component:', Component.name || 'Anonymous')
            setDesignComponent(() => Component)
          }).catch(err => {
            console.error('❌ Failed to load design:', err)
            console.error('Error details:', {
              message: err.message,
              stack: err.stack,
              planType,
              designSlug
            })
            // Fallback to default if design fails to load
            console.log('🔄 Falling back to default design')
            import('@/designs/default').then(module => {
              const Component = planType === 'FREE' ? module.FreeListingPage :
                              planType === 'VERIFICATION' ? module.VerifiedListingPage :
                              planType === 'SERVICES' ? module.ServiceBookingPage :
                              module.ProductListingPage
              console.log('✅ Loaded fallback component:', Component.name || 'Anonymous')
              setDesignComponent(() => Component)
            })
          })
        } else {
          throw new Error('User data not found')
        }

      } catch (err: any) {
        console.error('Error fetching listing:', err)
        setError(err.message || 'Failed to load listing')
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading listing...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto pt-20">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || 'Listing not found'}
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button onClick={() => router.push('/find')}>
              Browse Listings
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Render dynamic design component
  if (!DesignComponent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading design...</p>
        </div>
      </div>
    )
  }

  const commonProps = {
    data: listing.data,
    type: listing.type
  }

  return (
    <div className="min-h-screen bg-background">
      <DesignComponent {...commonProps} />
    </div>
  )
}
