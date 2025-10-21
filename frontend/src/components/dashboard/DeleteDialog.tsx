import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteDialogProps {
  title: string;
  description: string;
  onDelete: () => void;
}

export function DeleteDialog({ title, description, onDelete }: DeleteDialogProps) {
  const { t } = useTranslation("dashboard");

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
        <AlertDialogAction onClick={onDelete} className="bg-red-600">
          {t("common.delete")}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}
