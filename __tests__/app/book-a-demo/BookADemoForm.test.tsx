import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BookADemoForm } from '@/app/book-a-demo/BookADemoForm'

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}))

vi.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    form: ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => <form {...props}>{children}</form>,
  },
}))

describe('BookADemoForm — country code auto-detect', () => {
  it('defaults to Taiwan (+886) when geo-detection has not resolved yet', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})) // never resolves
    render(<BookADemoForm />)
    expect(screen.getByRole('button', { name: /\+886/ })).toBeInTheDocument()
  })

  it('switches to Japan (+81) when geo-IP resolves to Japan', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve({ country: 'JP' }) })
    render(<BookADemoForm />)
    await waitFor(() => expect(screen.getByRole('button', { name: /\+81/ })).toBeInTheDocument())
  })

  it('switches to a different country again for the US (proves it is not hardcoded to one detected value)', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ json: () => Promise.resolve({ country: 'US' }) })
    render(<BookADemoForm />)
    await waitFor(() => expect(screen.getByRole('button', { name: /\+1\b/ })).toBeInTheDocument())
  })

  it('stays on the Taiwan default when geo-IP fails', async () => {
    global.fetch = vi.fn().mockRejectedValueOnce(new Error('network error'))
    render(<BookADemoForm />)
    await new Promise(r => setTimeout(r, 20))
    expect(screen.getByRole('button', { name: /\+886/ })).toBeInTheDocument()
  })
})
