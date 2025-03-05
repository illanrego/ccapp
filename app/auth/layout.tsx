export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
  return (
    <div className="w-full h-screen lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      <div className="flex items-center justify-center py-12">
        {children}
      </div>
      <div className="hidden bg-muted lg:block">

      </div>
    </div>
  )
}
