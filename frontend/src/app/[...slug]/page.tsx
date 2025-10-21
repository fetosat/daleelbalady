import '../../index.css'
import { ClientOnly } from './client'

export function generateStaticParams() {
  // Don't generate static paths for this catch-all route
  // The homepage ("/") is handled by src/app/page.tsx
  return []
}

export default function Page() {
  return <ClientOnly />
}
