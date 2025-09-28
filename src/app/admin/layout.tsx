
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Home, ShoppingBag, Package, Users, BarChart2, Settings, UserCircle, LifeBuoy, LayoutDashboard, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Mock user data - in a real app, this would come from an auth context
const user = {
    name: 'Admin User',
    role: 'admin', // available roles: 'admin', 'sales', 'accountant', 'supplier'
    avatar: 'https://placehold.co/100x100.png'
};

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'sales', 'accountant', 'supplier'] },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, roles: ['admin', 'sales'] },
    { href: '/admin/products', label: 'Products', icon: Package, roles: ['admin', 'supplier'] },
    { href: '/admin/sourcing', label: 'Sourcing Department', icon: PackageSearch, roles: ['admin', 'supplier'] },
    { href: '/admin/users', label: 'Users', icon: Users, roles: ['admin'] },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart2, roles: ['admin', 'sales'] },
    { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const userCanAccess = (itemRoles: string[]) => {
      return itemRoles.includes(user.role);
  };
  
  return (
      <SidebarProvider>
          <div className="flex h-screen bg-background">
              <Sidebar>
                  <SidebarHeader>
                     <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-lg">{user.name}</span>
                            <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                        </div>
                    </div>
                  </SidebarHeader>
                  <SidebarContent>
                      <SidebarMenu>
                          {navItems.filter(item => userCanAccess(item.roles)).map(item => (
                               <SidebarMenuItem key={item.href}>
                                    <Link href={item.href}>
                                          <SidebarMenuButton isActive={pathname === item.href} icon={<item.icon />}>
                                              {item.label}
                                          </SidebarMenuButton>
                                      </Link>
                               </SidebarMenuItem>
                          ))}
                      </SidebarMenu>
                  </SidebarContent>
                  <SidebarFooter>
                       <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start gap-2">
                                     <UserCircle />
                                     <div className="flex flex-col items-start">
                                        <span>{user.name}</span>
                                        <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                                     </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Help</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Logout</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                  </SidebarFooter>
              </Sidebar>
              <main className="flex-1 overflow-y-auto">
                 <div className="p-4 sm:p-6 lg:p-8">
                   <div className="flex items-center gap-4 mb-6">
                        <SidebarTrigger className="md:hidden" />
                        <h1 className="text-2xl font-bold capitalize">{pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}</h1>
                   </div>
                   {children}
                 </div>
              </main>
          </div>
      </SidebarProvider>
  );
}
