import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar, MobileSidebar } from "@/components/sidebar";
import { getUser } from "@/lib/auth";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Comedy Club Manager",
  description: "Sistema de Gestão do Comedy Club Manager",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user } = await getUser();
  const userEmail = user?.email ?? null;

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:w-80 md:flex-col md:fixed md:inset-y-0 border-r border-sidebar-border bg-sidebar">
              <Sidebar className="flex-1" userEmail={userEmail} />
            </aside>
            
            {/* Main Content */}
            <div className="flex-1 md:pl-80">
              {/* Mobile Header */}
              <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 flex items-center md:hidden">
                <MobileSidebar userEmail={userEmail} />
                <span className="ml-4 font-semibold">Comedy Club Manager</span>
              </header>
              <main className="p-6 md:p-8">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
