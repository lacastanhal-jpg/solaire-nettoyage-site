import IntranetHeader from '@/app/intranet/components/IntranetHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <IntranetHeader />
      <div>
        {children}
      </div>
    </div>
  )
}
