'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const ShopProfile = dynamic(() => import('@/components/ShopProfile'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>
})

interface ShopProfilePageProps {
  params: Promise<{
    slug: string
  }>
}

export default function ShopProfilePage({ params }: ShopProfilePageProps) {
  const { slug } = React.use(params)
  return <ShopProfile slug={slug} />
}
