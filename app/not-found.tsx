import NotFoundContent from '@/components/not-found/NotFoundContent'
import { buildVariantScript } from '@/components/not-found/variantScript'

export const metadata = { title: '404 — Page Not Found' }

export default function NotFound() {
  return (
    <div className="flex-1 section-dark flex items-center justify-center text-center px-6 pt-32 pb-16">
      {/* Must stay ahead of NotFoundContent so it runs before the variants
          paint. See components/not-found/variantScript. */}
      <script dangerouslySetInnerHTML={{ __html: buildVariantScript() }} />
      <NotFoundContent />
    </div>
  )
}
