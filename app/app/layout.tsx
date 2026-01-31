// app/app/layout.tsx
import "./app.css"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Background layer that extends into safe areas */}
      <div className="fixed inset-0 bg-[#fafafa]" style={{ zIndex: -1 }} />
      <div className="app-light-mode fixed inset-0">
        {children}
      </div>
    </>
  )
}