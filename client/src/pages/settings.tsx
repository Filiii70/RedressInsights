import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Smartphone, Bell, Clock, AlertTriangle, Save, Send, Settings as SettingsIcon } from "lucide-react";
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
        return apiRequest("PATCH", `/api/contacts/${contact.id}`, data);
      }
      return apiRequest("POST", "/api/contacts", {
        companyId: defaultCompanyId,
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts", defaultCompanyId] });
      toast({
        title: "Saved",
        description: "Your preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not save.",
        variant: "destructive",
      });
    },
  });

  const testEmailMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/notifications/test", {
        channel: "email",
        email: formData.email,
      });
    },
    onSuccess: () => {
      toast({ title: "Test sent", description: `Check ${formData.email}` });
    },
    onError: () => {
      toast({ title: "Test failed", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-3">
        <h1 className="text-lg font-bold">Settings</h1>
        <Skeleton className="flex-1" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2" data-testid="text-page-title">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Bell className="h-3 w-3" />
            Notification preferences
          </p>
        </div>
        <Button size="sm" onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending} data-testid="button-save-settings">
          <Save className="h-3 w-3 mr-1" />
          {saveMutation.isPending ? "..." : "Save"}
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-3 min-h-0">
        <Card className="overflow-visible flex flex-col">
          <CardHeader className="p-3 pb-2 flex-shrink-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3 flex-1">
            <div className="space-y-1">
              <Label className="text-xs">Email</Label>
              <div className="flex gap-1">
                <Input
                  type="email"
                  placeholder="your@company.be"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-8 text-xs"
                  data-testid="input-email"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => testEmailMutation.mutate()}
                  disabled={!formData.email}
                  data-testid="button-test-email"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Phone (SMS)</Label>
              <Input
                type="tel"
                placeholder="+32 xxx xx xx xx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-8 text-xs"
                data-testid="input-phone"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">WhatsApp</Label>
              <Input
                type="tel"
                placeholder="+32 xxx xx xx xx"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="h-8 text-xs"
                data-testid="input-whatsapp"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible flex flex-col">
          <CardHeader className="p-3 pb-2 flex-shrink-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Email</span>
              </div>
              <Switch
                checked={formData.emailEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, emailEnabled: checked })}
                data-testid="switch-email-enabled"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">SMS</span>
              </div>
              <Switch
                checked={formData.smsEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, smsEnabled: checked })}
                data-testid="switch-sms-enabled"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SiWhatsapp className="h-4 w-4 text-green-500" />
                <span className="text-sm">WhatsApp</span>
              </div>
              <Switch
                checked={formData.whatsappEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, whatsappEnabled: checked })}
                data-testid="switch-whatsapp-enabled"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-visible flex flex-col">
          <CardHeader className="p-3 pb-2 flex-shrink-0">
            <CardTitle className="text-sm">Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm">Weekly</p>
                  <Badge variant="secondary" className="text-[10px] h-4">Email</Badge>
                </div>
              </div>
              <Switch
                checked={formData.weeklyDigest}
                onCheckedChange={(checked) => setFormData({ ...formData, weeklyDigest: checked })}
                data-testid="switch-weekly-digest"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm">Overdue</p>
                  <div className="flex gap-1">
                    <Badge variant="secondary" className="text-[10px] h-4">Email</Badge>
                    <Badge variant="secondary" className="text-[10px] h-4">WA</Badge>
                  </div>
                </div>
              </div>
              <Switch
                checked={formData.paymentReminders}
                onCheckedChange={(checked) => setFormData({ ...formData, paymentReminders: checked })}
                data-testid="switch-payment-reminders"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm">Critical</p>
                  <div className="flex gap-1">
                    <Badge variant="destructive" className="text-[10px] h-4">SMS</Badge>
                    <Badge variant="secondary" className="text-[10px] h-4">WA</Badge>
                  </div>
                </div>
              </div>
              <Switch
                checked={formData.criticalAlerts}
                onCheckedChange={(checked) => setFormData({ ...formData, criticalAlerts: checked })}
                data-testid="switch-critical-alerts"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
