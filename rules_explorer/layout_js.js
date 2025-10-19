// app/layout.js
// Root layout component for Next.js App Router

import './globals.css'

export const metadata = {
  title: 'Detection Rules Explorer',
  description: 'Explore and search threat detection rules',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}