import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  status: "pending" | "active" | "suspended";
  categories: string[];
}

export default function ShopManagement() {
  const { t } = useTranslation("dashboard");
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  
  // Mock data - replace with actual API calls
  const [shops, setShops] = useState<Shop[]>([
    {
      id: "1",
      name: "Sample Shop",
      description: "A sample shop description",
      address: "123 Main St",
      phone: "+1234567890",
      email: "shop@example.com",
      status: "active",
      categories: ["Electronics", "Gadgets"]
    }
  ]);

  const handleShopUpdate = (shopId: string, updates: Partial<Shop>) => {
    setShops(shops.map(shop => 
      shop.id === shopId ? { ...shop, ...updates } : shop
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("shopOwner.shopManagement")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">{t("shopOwner.shopDetails")}</TabsTrigger>
            <TabsTrigger value="verification">{t("shopOwner.verification")}</TabsTrigger>
            <TabsTrigger value="settings">{t("shopOwner.settings")}</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="space-y-4">
              <div className="grid w-full gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("shopOwner.shopName")}</Label>
                  <Input
                    id="name"
                    placeholder={t("shopOwner.enterShopName")}
                    value={activeShop?.name || ""}
                    onChange={(e) => activeShop && handleShopUpdate(activeShop.id, { name: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">{t("shopOwner.description")}</Label>
                  <Input
                    id="description"
                    placeholder={t("shopOwner.enterDescription")}
                    value={activeShop?.description || ""}
                    onChange={(e) => activeShop && handleShopUpdate(activeShop.id, { description: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">{t("shopOwner.address")}</Label>
                  <Input
                    id="address"
                    placeholder={t("shopOwner.enterAddress")}
                    value={activeShop?.address || ""}
                    onChange={(e) => activeShop && handleShopUpdate(activeShop.id, { address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">{t("shopOwner.phone")}</Label>
                    <Input
                      id="phone"
                      placeholder={t("shopOwner.enterPhone")}
                      value={activeShop?.phone || ""}
                      onChange={(e) => activeShop && handleShopUpdate(activeShop.id, { phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t("shopOwner.email")}</Label>
                    <Input
                      id="email"
                      placeholder={t("shopOwner.enterEmail")}
                      value={activeShop?.email || ""}
                      onChange={(e) => activeShop && handleShopUpdate(activeShop.id, { email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">
                  {t("common.cancel")}
                </Button>
                <Button>{t("common.save")}</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verification">
            <div className="space-y-4">
              <p className="text-sm text-stone-500">
                {t("shopOwner.verificationDescription")}
              </p>
              {/* Add verification form fields here */}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-4">
              <p className="text-sm text-stone-500">
                {t("shopOwner.settingsDescription")}
              </p>
              {/* Add settings form fields here */}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
