'use client'

import React, { useEffect, useState } from 'react'
import { X, Bell, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PopupNotification() {
  const [isOpen, setIsOpen] = useState(false)
  const [popupData, setPopupData] = useState<{
    title: string
    message: string
    btnText: string
    btnLink: string
  } | null>(null)

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('desisexy_popup_dismissed')
    if (isDismissed === 'true') return

    // Fetch popup config from Settings API
    fetch('/api/settings')
      .then(res => res.json())
      .then(settings => {
        if (settings && settings.popup_active === 'true') {
          setPopupData({
            title: settings.popup_title || 'Announcement',
            message: settings.popup_message || 'Welcome to DesiSexy.in!',
            btnText: settings.popup_btn_text || 'Learn More',
            btnLink: settings.popup_btn_link || '',
          })
          
          // Delay showing by 1.5 seconds for a nicer UX
          setTimeout(() => {
            setIsOpen(true)
          }, 1500)
        }
      })
      .catch(err => console.error('Failed to load popup notification:', err))
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    sessionStorage.setItem('desisexy_popup_dismissed', 'true')
  }

  if (!popupData) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-sm bg-[#111115] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl overflow-hidden"
          >
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-accent/15 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Content */}
            <div className="flex gap-4">
              <div className="p-3 bg-brand-accent/15 border border-brand-accent/20 rounded-xl text-brand-accent shrink-0 h-11 w-11 flex items-center justify-center">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              <div className="space-y-1.5 flex-1 pr-6">
                <h4 className="text-sm font-bold text-white tracking-wide uppercase">
                  {popupData.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                  {popupData.message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={handleClose}
                className="px-3.5 py-2 hover:bg-white/5 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-lg transition"
              >
                Close
              </button>
              {popupData.btnLink && (
                <a
                  href={popupData.btnLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-brand-accent hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-1.5 shadow-md shadow-red-950/20"
                >
                  <span>{popupData.btnText}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
