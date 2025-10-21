import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  status: "active" | "inactive";
}

export default function ServiceManagement() {
  const { t } = useTranslation("dashboard");
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Basic Service",
      description: "A basic service offering",
      price: 100,
      duration: 60,
      category: "General",
      status: "active"
    }
  ]);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleAddService = () => {
    const newService: Service = {
      id: (services.length + 1).toString(),
      name: "",
      description: "",
      price: 0,
      duration: 30,
      category: "",
      status: "active"
    };
    setServices([...services, newService]);
    setEditingService(newService);
  };

  const handleUpdateService = (serviceId: string, updates: Partial<Service>) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, ...updates } : service
    ));
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(services.filter(service => service.id !== serviceId));
    if (editingService?.id === serviceId) {
      setEditingService(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("shopOwner.servicesManagement")}</CardTitle>
        <Button onClick={handleAddService}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t("common.add")}
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("shopOwner.serviceName")}</TableHead>
              <TableHead>{t("shopOwner.price")}</TableHead>
              <TableHead>{t("shopOwner.duration")}</TableHead>
              <TableHead>{t("shopOwner.category")}</TableHead>
              <TableHead>{t("shopOwner.status")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map(service => (
              <TableRow key={service.id}>
                <TableCell>{service.name}</TableCell>
                <TableCell>{service.price}</TableCell>
                <TableCell>{service.duration} min</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{service.status}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingService(service)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {editingService && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                {editingService.id === services[services.length - 1].id
                  ? t("shopOwner.addService")
                  : t("shopOwner.editService")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("shopOwner.serviceName")}</Label>
                  <Input
                    id="name"
                    value={editingService.name}
                    onChange={(e) => handleUpdateService(editingService.id, { name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">{t("shopOwner.description")}</Label>
                  <Input
                    id="description"
                    value={editingService.description}
                    onChange={(e) => handleUpdateService(editingService.id, { description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">{t("shopOwner.price")}</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editingService.price}
                      onChange={(e) => handleUpdateService(editingService.id, { price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="duration">{t("shopOwner.duration")}</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={editingService.duration}
                      onChange={(e) => handleUpdateService(editingService.id, { duration: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">{t("shopOwner.category")}</Label>
                  <Input
                    id="category"
                    value={editingService.category}
                    onChange={(e) => handleUpdateService(editingService.id, { category: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingService(null)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={() => setEditingService(null)}>
                    {t("common.save")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
