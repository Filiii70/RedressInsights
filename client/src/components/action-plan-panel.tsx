import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, AlertTriangle, Clock, Phone, Mail, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionPlan } from "@shared/schema";
import { useState } from "react";

interface ActionPlanPanelProps {
  plan: ActionPlan;
  companyName: string;
  className?: string;
}

export function ActionPlanPanel({ plan, companyName, className }: ActionPlanPanelProps) {
  const [emailOpen, setEmailOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);

  const urgencyConfig = {
    low: {
      label: "Laag",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-100 dark:bg-green-900/30",
      icon: Clock,
    },
    medium: {
      label: "Medium",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      icon: Clock,
    },
    high: {
      label: "Hoog",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-100 dark:bg-orange-900/30",
      icon: AlertTriangle,
    },
    critical: {
      label: "Kritiek",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/30",
      icon: FileWarning,
    },
  };

  const urgency = urgencyConfig[plan.urgencyLevel];
  const UrgencyIcon = urgency.icon;

  return (
    <Card className={cn("overflow-visible", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg">Actieplan</CardTitle>
          <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", urgency.bg, urgency.color)}>
            <UrgencyIcon className="h-3 w-3" />
            {urgency.label}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommended payment terms */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Aanbevolen betaaltermijn
          </p>
          <p className="text-lg font-semibold" data-testid="text-recommended-terms">
            {plan.recommendedPaymentTerms}
          </p>
        </div>

        {/* Action steps */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Actiestappen
          </p>
          <ul className="space-y-2">
            {plan.actions.map((action, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm"
                data-testid={`text-action-step-${index}`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {index + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Email script */}
        <Collapsible open={emailOpen} onOpenChange={setEmailOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between" data-testid="button-email-script">
              <span className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                E-mail script
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", emailOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap" data-testid="text-email-script">
              {plan.emailScript}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Phone script */}
        <Collapsible open={phoneOpen} onOpenChange={setPhoneOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between" data-testid="button-phone-script">
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telefoon script
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", phoneOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap" data-testid="text-phone-script">
              {plan.phoneScript}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Escalation advice */}
        <div className="rounded-lg border border-orange-200 dark:border-orange-800/50 bg-orange-50 dark:bg-orange-900/20 p-4">
          <p className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Escalatie advies
          </p>
          <p className="text-sm text-orange-700 dark:text-orange-300" data-testid="text-escalation-advice">
            {plan.escalationAdvice}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
