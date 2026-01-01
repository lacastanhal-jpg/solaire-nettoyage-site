'use client'
import { migrerAffectationsAccessoires } from '@/lib/migration-affectations'
import { useState } from 'react'

export default function MigrationPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  async function runMigration() {
    setLoading(true)
    try {
      const res = await migrerAffectationsAccessoires()
      setResult(res)
    } catch (error) {
      console.error(error)
      setResult({ error: String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Migration Affectations</h1>
      <button 
        onClick={runMigration}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        {loading ? 'Migration...' : 'Lancer Migration'}
      </button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
