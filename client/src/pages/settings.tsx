import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, Bell, Save, Settings as SettingsIcon, AlertTriangle } from "lucide-react";
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
    emailEnabled: true,
    patternAlerts: true,
    overdueAlerts: true,
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        email: contact.email || "",
        emailEnabled: contact.emailEnabled ?? true,
        patternAlerts: contact.criticalAlerts ?? true,
        overdueAlerts: contact.paymentReminders ?? true,
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
        description: "Could not save preferences.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col gap-4">
        <h1 className="text-xl font-bold">Settings</h1>
        <Skeleton className="flex-1" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <SettingsIcon className="h-5 w-5" />
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">Notification preferences</p>
        </div>
        <Button onClick={() => saveMutation.mutate(formData)} disabled={saveMutation.isPending} data-testid="button-save-settings">
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-shrink-0">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="your@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="input-email"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive alerts via email</p>
              </div>
              <Switch
                checked={formData.emailEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, emailEnabled: checked })}
                data-testid="switch-email-enabled"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Alert Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Pattern Changes
                </p>
                <p className="text-xs text-muted-foreground">Alert when payment behavior changes</p>
              </div>
              <Switch
                checked={formData.patternAlerts}
                onCheckedChange={(checked) => setFormData({ ...formData, patternAlerts: checked })}
                data-testid="switch-pattern-alerts"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4 text-red-500" />
                  Overdue Invoices
                </p>
                <p className="text-xs text-muted-foreground">Alert when invoices become overdue</p>
              </div>
              <Switch
                checked={formData.overdueAlerts}
                onCheckedChange={(checked) => setFormData({ ...formData, overdueAlerts: checked })}
                data-testid="switch-overdue-alerts"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
