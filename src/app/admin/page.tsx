import React from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminDashboardClient from './AdminDashboardClient'

export const revalidate = 0

export default async function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-white">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboardClient />
      </main>

      <Footer />
    </div>
  )
}
