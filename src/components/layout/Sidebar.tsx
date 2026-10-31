"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/actions/auth";
import { COMPANY_NAME } from "@/lib/constants";
import {
  AppsIcon,
  ChartIcon,
  GearIcon,
  HomeIcon,
  ListIcon,
  LogoMark,
  TagIcon,
} from "@/components/icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/transactions", label: "Transactions", icon: ListIcon },
  { href: "/products", label: "Apps & products", icon: AppsIcon },
  { href: "/categories", label: "Expense categories", icon: TagIcon },
  { href: "/reports", label: "Reports & export", icon: ChartIcon },
];

type SidebarProps = {
  userName: string;
  userRole: string;
  onNavigate?: () => void;
};

export function Sidebar({ userName, userRole, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-white">
      <div className="flex items-center gap-3 px-5 py-5">
        <LogoMark />
        <div>
          <p className="text-sm font-semibold tracking-tight">{COMPANY_NAME}</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border px-3 py-4">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={`mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
            pathname.startsWith("/settings")
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <GearIcon />
          Settings
        </Link>
        <div className="flex items-center justify-between gap-2 px-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="text-xs capitalize text-slate-500">{userRole}</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
