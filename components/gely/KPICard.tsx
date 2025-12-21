'use client'

import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  color: string
}

export default function KPICard({ title, value, subtitle, icon: Icon, color }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1 font-medium">{title}</p>
          <p className="text-3xl font-bold text-blue-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} p-4 rounded-xl shadow-md`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  )
}
