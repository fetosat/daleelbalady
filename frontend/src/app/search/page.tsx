'use client'

import dynamic from 'next/dynamic'

const Search = dynamic(() => import('@/components/Search'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>
})

export default function SearchPage() {
  return <Search />
}
