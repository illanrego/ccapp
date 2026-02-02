"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, Calendar, Users, Package2, Beer, DollarSign, Clock, Laugh } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserMenu } from "@/components/user-menu"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Início",
    href: "/",
    icon: Home,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10 group-hover:bg-violet-500/20",
    textColor: "text-violet-500",
  },
  {
    label: "Calendário",
    href: "/calendar",
    icon: Calendar,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10 group-hover:bg-blue-500/20",
    textColor: "text-blue-500",
  },
  {
    label: "Agenda",
    href: "/schedule",
    icon: Clock,
    color: "from-sky-500 to-blue-500",
    bgColor: "bg-sky-500/10 group-hover:bg-sky-500/20",
    textColor: "text-sky-500",
  },
  {
    label: "Comics",
    href: "/comics",
    icon: Users,
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10 group-hover:bg-pink-500/20",
    textColor: "text-pink-500",
  },
  {
    label: "Estoque",
    href: "/estoque",
    icon: Package2,
    color: "from-orange-500 to-amber-500",
    bgColor: "bg-orange-500/10 group-hover:bg-orange-500/20",
    textColor: "text-orange-500",
  },
  {
    label: "Bar",
    href: "/bar",
    icon: Beer,
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-500/10 group-hover:bg-amber-500/20",
    textColor: "text-amber-500",
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
    color: "from-emerald-500 to-green-500",
    bgColor: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    textColor: "text-emerald-500",
  },
]

function NavItem({ 
  item, 
  isActive,
  onClick
}: { 
  item: typeof navItems[0]
  isActive: boolean
  onClick?: () => void
}) {
  const Icon = item.icon
  
  return (
    <Link href={item.href} className="block" onClick={onClick}>
      <div
        className={cn(
          "group relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200",
          isActive
            ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.textColor}/25`
            : "hover:bg-muted/80"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
            isActive
              ? "bg-white/20"
              : item.bgColor
          )}
        >
          <Icon className={cn(
            "h-5 w-5 transition-colors",
            isActive ? "text-white" : item.textColor
          )} />
        </div>
        <span className={cn(
          "font-medium text-base",
          isActive ? "text-white" : "text-foreground"
        )}>
          {item.label}
        </span>
      </div>
    </Link>
  )
}

interface SidebarProps {
  className?: string
  onNavClick?: () => void
  userEmail?: string | null
}

export function Sidebar({ className, onNavClick, userEmail }: SidebarProps) {
  const pathname = usePathname()
  
  return (
    <div className={cn("flex h-full flex-col bg-sidebar", className)}>
      {/* Header / Branding */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl blur-xl" />
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Laugh className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Comedy Club
            </h1>
            <p className="text-sm text-muted-foreground">Gestão</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 pb-4">
        <div className="mb-4">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu
          </p>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              onClick={onNavClick}
            />
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border">
        {/* User Menu */}
        {userEmail && (
          <div className="px-2 py-3 border-b border-sidebar-border">
            <UserMenu email={userEmail} />
          </div>
        )}
        
        {/* Theme Toggle */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  )
}

interface MobileSidebarProps {
  userEmail?: string | null
}

export function MobileSidebar({ userEmail }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <Sidebar onNavClick={() => setOpen(false)} userEmail={userEmail} />
      </SheetContent>
    </Sheet>
  )
} 