'use client'

import React, { useEffect } from 'react'
import dynamic from 'next/dynamic'

const UserChatPage = dynamic(() => import('@/components/UserChatPage'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>
})

interface UserChatPageProps {
  params: Promise<{
    chatId: string
  }>
}

export default function ChatPage({ params }: UserChatPageProps) {
  // Unwrap the params Promise using React.use()
  const { chatId } = React.use(params)
  
  // Store the params globally so UserChatPage can access them
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__nextjsParams = { chatId }
    }
  }, [chatId])
  
  return <UserChatPage />
}
