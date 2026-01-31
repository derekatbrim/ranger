// app/app/layout.tsx
import "./app.css"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-light-mode">
      {children}
    </div>
  )
}
