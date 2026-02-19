"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Home, Users, Package, Beer, Menu, DollarSign } from "lucide-react"
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
  {
    label: "Financeiro",
    icon: DollarSign,
    href: "/financeiro",
  },
]

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-8", className)}>
      <div className="space-y-3 py-3">
        <div className="px-2 py-1.5">
          <h2 className="mb-1.5 px-3 text-sm font-medium tracking-tight text-muted-foreground">
            Comedy Club Manager
          </h2>
          <div className="space-y-0.5">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                className="w-full justify-start h-9 text-sm font-normal"
                asChild
              >
                <Link href={route.href}>
                  <route.icon className="mr-2 h-3.5 w-3.5" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="px-2 py-1.5">
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