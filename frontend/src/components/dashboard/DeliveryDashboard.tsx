import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getUser } from "@/api/user";
import { motion } from "framer-motion";

export default function DeliveryDashboard() {
  const { t } = useTranslation("dashboard");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setUser(await getUser("delivery1"));
    })();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex flex-col">
      <DashboardNavbar profilePic={user.profilePic} />
      <div className="flex flex-1 gap-6 p-6">
        <DashboardSidebar role={user.role} />
        <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div layout className="rounded-2xl shadow bg-white dark:bg-stone-900 p-6">
            <h2 className="font-bold text-lg mb-2">{t("delivery.assignedOrders")}</h2>
            <div className="text-stone-500">(Mocked map view)</div>
          </motion.div>
          <motion.div layout className="rounded-2xl shadow bg-white dark:bg-stone-900 p-6">
            <h2 className="font-bold text-lg mb-2">{t("delivery.deliveryStatus")}</h2>
            <div className="text-stone-500">(Mocked delivery status update)</div>
          </motion.div>
          <motion.div layout className="rounded-2xl shadow bg-white dark:bg-stone-900 p-6">
            <h2 className="font-bold text-lg mb-2">{t("delivery.earnings")}</h2>
            <div className="text-stone-500">(Mocked earnings/history)</div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
