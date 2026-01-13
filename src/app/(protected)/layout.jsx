'use client'
import { redirect } from 'next/navigation';
import React, { useEffect } from 'react'
import { apiRequest } from '../utils/api';
import Link from 'next/link';
function Protected({ children }) {
  useEffect(() => {
    const token = localStorage.getItem('token') || ''
    if (!token) {
      redirect('/auth/signin')
    }
    async function authCheck() {
      try {
        const isValid = await apiRequest('GET', '/auth/me')
        console.log(isValid)
      } catch (error) {
        console.log(error)
        localStorage.removeItem('token')
        redirect('/auth/signin')
      }
    }
    authCheck()
  })

  return (
    <>
      <div className='flex'>
        <div className='w-1/6 min-h-screen bg-gray-200'>
          <div className='w-full
          h-screen
          border 
          rounded-tl-4xl 
          rounded-bl-4xl 
          bg-[#1a0033]  
          text-white
          flex
          flex-col
          p-6
          gap-20
          '>
            <div className='flex items-center gap-2'>
              <img src="/logo.png" className='w-10' />
              <h1 className='text-2xl text-gray-200 font-semibold tracking-wide'>DotChat.ai</h1>
            </div>
            <div className='flex flex-col gap-95'>
              <div className='flex w-35 flex-col gap-3'>
                <Link href='/dashboard'>
                  <div className='w-50 rounded-lg p-3 flex items-center gap-3 hover:bg-[#2a0a4d]'>
                    <img src="/dashboard.png" className='w-5' />
                    <p className='text-md font-bold tracking-wide'>Dashboard</p>
                  </div>
                </Link>
                <Link href='/messages'>
                  <div className='w-50 rounded-lg p-3 flex items-center gap-3 hover:bg-[#2a0a4d]'>
                    <img src="/message.png" className='w-5' />
                    <p className='text-md font-bold tracking-wide'>Messages</p>
                  </div>
                </Link>
                <Link href='/files'>
                  <div className='w-50 rounded-lg p-3 flex items-center gap-3 hover:bg-[#2a0a4d]'>
                    <img src="/file.png" className='w-5' />
                    <p className='text-md font-bold tracking-wide'>Files</p>
                  </div>
                </Link>
                <Link href='/later'>
                  <div className='w-50 rounded-lg p-3 flex items-center gap-3 hover:bg-[#2a0a4d]'>
                    <img src="/bookmark.png" className='w-5' />
                    <p className='text-md font-bold tracking-wide'>Later</p>
                  </div>
                </Link>
              </div>
              <div>
                <div className='w-50 rounded-2xl p-3 flex items-center gap-3 hover:bg-[#2a0a4d] cursor-pointer'>
                  <img src="/user.png" className='w-8' />
                  <p className='text-md font-semibold tracking-wide'>Mukul Kumar</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='w-full'>
          {children}
        </div>
      </div>
    </>
  )
}

export default Protected;