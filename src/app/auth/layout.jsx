'use client'
import React from 'react'
import { usePathname } from 'next/navigation'
export default function Layout({ children }) {
  const pathname = usePathname()
  let varName;
  if(pathname === '/auth/signin'){
    varName = 'Sign in'
  }else if(pathname === '/auth/signup'){
    varName = 'Sign up'
  }
  return (
    <>
      <div className="min-h-screen flex p-1">
        <div className="w-[45%] min-h-full bg-[#1a0033] rounded-[3%] p-12 flex flex-col justify-between">
          <div>
            <div className="text-gray-100 text-md font-semibold tracking-wide flex items-center">
              <img src="/logo.png" className='w-12'/> DotChat.ai
            </div>
            <h1 className="mt-30 text-5xl font-bold text-white leading-tight">
              Welcome to DotChat.ai
            </h1>
            <p className="mt-5 text-lg text-white/80 max-w-lg">
              Your intelligent workspace for conversations, collaboration,
              and AI-powered chat — all in one place.
            </p>
            <p className="mt-4 text-white/60 text-sm">
              {varName} to continue where ideas turn into conversations.
            </p>
          </div>
          <div className="text-gray-300 text-sm">
            DotChat.ai • Smart conversations, simplified
          </div>
        </div>
        <div className="w-[55%] flex items-center justify-center">
          {children}
        </div>
      </div>
    </>
  )
}

