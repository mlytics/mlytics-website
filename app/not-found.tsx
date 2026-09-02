import NotFoundContent from '@/components/not-found/NotFoundContent'

export const metadata = { title: '404 — Page Not Found' }

export default function NotFound() {
  return (
    <div className="flex-1 section-dark flex items-center justify-center text-center px-6 pt-32 pb-16">
      <NotFoundContent />
    </div>
  )
}
