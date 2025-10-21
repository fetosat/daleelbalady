import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";

export default function SettingsPage() {
    const { t } = useTranslation("dashboard");
    const { user } = useAuth();

    return (
        <div className="space-y-6 bg-background p-6 rounded-lg shadow">

            <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="profile">{t("settings.profile")}</TabsTrigger>
                        <TabsTrigger value="account">{t("settings.account")}</TabsTrigger>
                        <TabsTrigger value="notifications">{t("settings.notifications")}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("settings.personalInfo")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">{t("settings.firstName")}</Label>
                                        <Input id="firstName" placeholder={t("settings.enterFirstName")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">{t("settings.lastName")}</Label>
                                        <Input id="lastName" placeholder={t("settings.enterLastName")} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">{t("settings.email")}</Label>
                                    <Input id="email" type="email" placeholder={t("settings.enterEmail")} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">{t("settings.phone")}</Label>
                                    <Input id="phone" type="tel" placeholder={t("settings.enterPhone")} />
                                </div>

                                <Button>{t("common.save")}</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="account" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("settings.security")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
                                    <Input id="currentPassword" type="password" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
                                    <Input id="newPassword" type="password" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">{t("settings.confirmPassword")}</Label>
                                    <Input id="confirmPassword" type="password" />
                                </div>

                                <Button>{t("settings.updatePassword")}</Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{t("settings.deleteAccount")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {t("settings.deleteAccountWarning")}
                                </p>
                                <Button variant="destructive">{t("settings.deleteAccount")}</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("settings.notificationPreferences")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>{t("settings.emailNotifications")}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t("settings.emailNotificationsDesc")}
                                        </p>
                                    </div>
                                    <Switch />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>{t("settings.pushNotifications")}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t("settings.pushNotificationsDesc")}
                                        </p>
                                    </div>
                                    <Switch />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>{t("settings.smsNotifications")}</Label>
                                        <p className="text-sm text-muted-foreground">
                                            {t("settings.smsNotificationsDesc")}
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>

    );
}
