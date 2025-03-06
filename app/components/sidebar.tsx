"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Users, Package, Beer, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "./theme-toggle"

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    label: "Calendario",
    icon: Calendar,
    href: "/calendario",
  },
  {
    label: "Comics",
    icon: Users,
    href: "/comics",
  },
  {
    label: "Estoque",
    icon: Package,
    href: "/estoque",
  },
  {
    label: "Bar",
    icon: Beer,
    href: "/bar",
  },
]

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Comedy Club
          </h2>
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 py-2">
        <ModeToggle />
      </div>
    </div>
  )
}

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  )
} 