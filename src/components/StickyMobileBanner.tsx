'use client'

import React, { useState } from 'react'
import AdsterraBanner from './AdsterraBanner'
import { X } from 'lucide-react'

export default function StickyMobileBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0c0c]/95 border-t border-white/10 p-1 flex flex-col items-center justify-center lg:hidden shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
      {/* Close button */}
      <button 
        onClick={() => setVisible(false)}
        className="absolute -top-6 right-2 bg-black/85 text-gray-400 hover:text-white border border-white/10 p-1 rounded-t-lg transition flex items-center justify-center cursor-pointer"
        style={{ height: '24px', width: '32px' }}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Render 320x50 Adsterra banner */}
      <div className="w-[320px] h-[50px] overflow-hidden flex items-center justify-center">
        <AdsterraBanner 
          idKey="8e79ec1062f9cde3ac737e2317b21ac1" 
          format="iframe" 
          height={50} 
          width={320} 
        />
      </div>
    </div>
  )
}
