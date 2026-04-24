"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 no-print">
      <div className="container mx-auto max-w-6xl flex items-center justify-between h-14">
        <Link href="/app" className="font-bold text-gray-900 text-lg">
          SheetMind
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-gray-500 hidden sm:block">
              {user.full_name ?? user.email}
            </span>
          )}
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
