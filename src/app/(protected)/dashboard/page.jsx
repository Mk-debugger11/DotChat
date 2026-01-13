import React from 'react'
import ChatHeader from '@/app/components/chatHeader'
import ChatInput from '@/app/components/chatInput'
import ChatMessages from '@/app/components/chatMessages'
import ChatSidebar from '@/app/components/chatSidebar'
function page() {
  return (
    <>
      <div className='w-full h-full flex'>
        <div className='h-full w-full flex flex-col'>
          <div className='h-[10%]'>
            <ChatHeader/>
          </div>
          <div className='h-[78%]'>
            <ChatMessages/>
          </div>
          <div className='h-[12%]'>
            <ChatInput/>
          </div>
        </div>
        <div className='h-full w-1/3'>
          <ChatSidebar/>
        </div>
      </div>
    </>
  )
}

export default page