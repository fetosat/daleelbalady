'use client'

import dynamic from 'next/dynamic'

const Signup = dynamic(() => import('@/components/Signup'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>
})

export default function SignupPage() {
  return <Signup />
}
