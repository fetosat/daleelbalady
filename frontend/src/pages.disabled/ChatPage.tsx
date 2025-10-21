import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function ChatPage() {
  const { t } = useTranslation("dashboard");
  return (
    <motion.div layout className="rounded-2xl shadow bg-white dark:bg-stone-900 p-6 m-6">
      <h2 className="font-bold text-lg mb-2">{t("sidebar.chat")}</h2>
      <div className="text-stone-500">(Floating messenger style, attachments mock)</div>
    </motion.div>
  );
}
