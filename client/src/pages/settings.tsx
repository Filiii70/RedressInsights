import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Smartphone, Bell, Clock, AlertTriangle, Save, Send } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import type { CompanyContact } from "@shared/schema";
import { useState, useEffect } from "react";

export default function Settings() {
  const { toast } = useToast();
  const defaultCompanyId = "demo-company";

  const { data: contact, isLoading } = useQuery<CompanyContact>({
    queryKey: ["/api/contacts", defaultCompanyId],
    retry: false,
  });

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    whatsapp: "",
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: true,
    weeklyDigest: true,
    paymentReminders: true,
    criticalAlerts: true,
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        email: contact.email || "",
        phone: contact.phone || "",
        whatsapp: contact.whatsapp || "",
        emailEnabled: contact.emailEnabled ?? true,
        smsEnabled: contact.smsEnabled ?? false,
        whatsappEnabled: contact.whatsappEnabled ?? true,
        weeklyDigest: contact.weeklyDigest ?? true,
        paymentReminders: contact.paymentReminders ?? true,
        criticalAlerts: contact.criticalAlerts ?? true,
      });
    }
  }, [contact]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (contact) {
        return apiRequest(`/api/contacts/${contact.id}`, "PATCH", data);
      }
      return apiRequest("/api/contacts", "POST", {
        companyId: defaultCompanyId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", defaultCompanyId] });
      toast({
        title: "Instellingen opgeslagen",
        description: "Je notificatievoorkeuren zijn bijgewerkt.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon instellingen niet opslaan. Probeer opnieuw.",
        variant: "destructive",
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/notifications/test", "POST", {
        channel: "email",
        email: formData.email,
      });
    },
    onSuccess: () => {
      toast({
        title: "Test email verstuurd",
        description: `Check je inbox op ${formData.email}`,
      });
    },
    onError: () => {
      toast({
        title: "Test mislukt",
        description: "Kon test email niet versturen. Email service is nog niet geconfigureerd.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Instellingen</h1>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Instellingen</h1>
        <p className="text-muted-foreground mt-1">
          Beheer je notificatievoorkeuren en contactgegevens
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Information */}
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contactgegevens
            </CardTitle>
            <CardDescription>
              Waar moeten we je notificaties naartoe sturen?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email adres</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="jouw@bedrijf.be"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-email"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => testEmailMutation.mutate()}
                  disabled={!formData.email || testEmailMutation.isPending}
                  title="Test email versturen"
                  data-testid="button-test-email"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefoonnummer (SMS)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+32 xxx xx xx xx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                data-testid="input-phone"
              />
              <p className="text-xs text-muted-foreground">
                Internationaal formaat met landcode
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp nummer</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+32 xxx xx xx xx"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                data-testid="input-whatsapp"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Channels */}
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificatiekanalen
            </CardTitle>
            <CardDescription>
              Kies via welke kanalen je berichten wilt ontvangen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">Overzichten en rapporten</p>
                </div>
              </div>
              <Switch
                checked={formData.emailEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, emailEnabled: checked })}
                data-testid="switch-email-enabled"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">SMS</Label>
                  <p className="text-sm text-muted-foreground">Kritieke alerts</p>
                </div>
              </div>
              <Switch
                checked={formData.smsEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, smsEnabled: checked })}
                data-testid="switch-sms-enabled"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SiWhatsapp className="h-5 w-5 text-green-500" />
                <div>
                  <Label className="font-medium">WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">Snelle updates</p>
                </div>
              </div>
              <Switch
                checked={formData.whatsappEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, whatsappEnabled: checked })}
                data-testid="switch-whatsapp-enabled"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Types */}
        <Card className="overflow-visible lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Notificatietypes</CardTitle>
            <CardDescription>
              Selecteer welke types berichten je wilt ontvangen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 auto-rows-fr">
              <div className="rounded-lg border p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Wekelijks Overzicht</p>
                      <p className="text-xs text-muted-foreground mt-1">Elke maandag een samenvatting</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.weeklyDigest}
                    onCheckedChange={(checked) => setFormData({ ...formData, weeklyDigest: checked })}
                    data-testid="switch-weekly-digest"
                  />
                </div>
                <div className="flex gap-2 flex-wrap mt-auto pt-3">
                  <Badge variant="secondary" className="text-xs">Email</Badge>
                </div>
              </div>

              <div className="rounded-lg border p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <Bell className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Betalingsherinneringen</p>
                      <p className="text-xs text-muted-foreground mt-1">Als facturen vervallen</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.paymentReminders}
                    onCheckedChange={(checked) => setFormData({ ...formData, paymentReminders: checked })}
                    data-testid="switch-payment-reminders"
                  />
                </div>
                <div className="flex gap-2 flex-wrap mt-auto pt-3">
                  <Badge variant="secondary" className="text-xs">Email</Badge>
                  <Badge variant="secondary" className="text-xs">WhatsApp</Badge>
                </div>
              </div>

              <div className="rounded-lg border border-red-200 dark:border-red-900/50 p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Kritieke Alerts</p>
                      <p className="text-xs text-muted-foreground mt-1">30+ dagen over tijd</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.criticalAlerts}
                    onCheckedChange={(checked) => setFormData({ ...formData, criticalAlerts: checked })}
                    data-testid="switch-critical-alerts"
                  />
                </div>
                <div className="flex gap-2 flex-wrap mt-auto pt-3">
                  <Badge variant="destructive" className="text-xs">SMS</Badge>
                  <Badge variant="secondary" className="text-xs">WhatsApp</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saveMutation.isPending}
          className="gap-2"
          data-testid="button-save-settings"
        >
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? "Opslaan..." : "Instellingen Opslaan"}
        </Button>
      </div>
    </div>
  );
}
