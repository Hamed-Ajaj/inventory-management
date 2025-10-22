"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  ChevronUp,
  Package,
  Plus,
  Settings,
  User2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Add Product", href: "/add-product", icon: Plus },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const data = useSession();
  return (
    <Sidebar>
      <SidebarHeader className="text-white">
        <SidebarMenu>
          <SidebarMenuItem className="flex gap-3 items-center py-5 mb-8">
            <BarChart3 className="w-8 h-8 text-purple-600 font-bold" />
            <span className="text-lg font-semibold">Inventory App</span>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-gray-400 uppercase">
            Inventory
          </SidebarGroupLabel>
          <SidebarContent className="text-white">
            <SidebarMenu>
              {navigation.map((item, key) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={key}>
                    <Link
                      className={`flex items-center space-x-3 py-2 px-3 rounded-lg ${
                        isActive
                          ? "bg-purple-100 text-gray-800"
                          : "hover:bg-gray-800 text-gray-300"
                      }`}
                      href={item.href}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="borter-t text-white border-gray-700">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User2 /> {data?.data?.user.name}
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
