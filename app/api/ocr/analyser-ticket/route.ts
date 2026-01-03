import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  // Redirection vers la route anglaise
  const formData = await request.formData()
  
  return fetch(new URL('/api/ocr/analyze-ticket', request.url), {
    method: 'POST',
    body: formData
  })
}
