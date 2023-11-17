import './globals.css'

export const metadata = {
  title: 'pulllse',
  description: 'Share your vibe',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
