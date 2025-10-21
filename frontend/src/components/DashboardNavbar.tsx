import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { Sun, Moon, User } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function DashboardNavbar({ profilePic }: { profilePic: string }) {
  const { t } = useTranslation("dashboard");
  const [dark, setDark] = useState(false);
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-stone-50 dark:bg-stone-900 shadow rounded-2xl">
      <div className="flex items-center gap-2">
        <Image src="/logo.svg" alt="DaleelBalady" width={32} height={32} className="h-8" />
        <span className="font-bold text-xl">DaleelBalady</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          aria-label={t("navbar.themeSwitch")}
          onClick={() => setDark((d) => !d)}
          className="rounded-full p-2 bg-stone-200 dark:bg-stone-800 transition"
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <Image
          src={profilePic}
          alt={t("navbar.profile")}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full border"
        />
      </div>
    </nav>
  );
}
