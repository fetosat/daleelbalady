'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'

const UserProfile = dynamic(() => import('@/components/UserProfile'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>
})

interface UserProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
  // Unwrap the params Promise using React.use()
  const { id } = React.use(params)
  
  // Store the params globally so UserProfile can access them
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__nextjsParams = { id }
    }
  }, [id])
  
  return <UserProfile />
}
