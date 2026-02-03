import "./globals.css"
import { Providers } from "./providers"

export const metadata = {
  title: "FreshBooks Clone",
  description: "Invoice and accounting management",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
