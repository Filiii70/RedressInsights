import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RiskScoreBadge } from "@/components/risk-score-gauge";
import { Link } from "wouter";
import { 
  Building2, 
  ArrowRight, 
  Ban, 
  CheckCircle2, 
  Clock, 
  Trash2,
  Eye
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BlacklistEntryWithCompany } from "@shared/schema";

function formatDate(date: string | Date | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("nl-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge variant="destructive" className="text-[10px]">Actief</Badge>;
    case "resolved":
      return <Badge variant="default" className="text-[10px] bg-green-600">Opgelost</Badge>;
    case "reviewing":
      return <Badge variant="secondary" className="text-[10px]">In Review</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
  }
}

export default function Blacklist() {
  const { toast } = useToast();

  const { data: entries, isLoading } = useQuery<BlacklistEntryWithCompany[]>({
    queryKey: ["/api/blacklist"],
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PATCH", `/api/blacklist/${id}`, { status: "resolved" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blacklist"] });
      toast({ title: "Status bijgewerkt", description: "Bedrijf is gemarkeerd als opgelost" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/blacklist/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blacklist"] });
      toast({ title: "Verwijderd", description: "Bedrijf is van de blacklist verwijderd" });
    },
  });

  const activeEntries = entries?.filter((e) => e.status === "active") || [];
  const resolvedEntries = entries?.filter((e) => e.status === "resolved") || [];

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex-shrink-0">
        <h1 className="text-lg font-bold" data-testid="text-page-title">Blacklist</h1>
        <p className="text-xs text-muted-foreground">Bedrijven met hoog risico of betalingsproblemen</p>
      </div>

      <div className="grid grid-cols-3 gap-2 flex-shrink-0">
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <Ban className="h-4 w-4 text-red-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Actief</p>
              <p className="text-sm font-bold text-red-600" data-testid="stat-active">{activeEntries.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Opgelost</p>
              <p className="text-sm font-bold text-green-600" data-testid="stat-resolved">{resolvedEntries.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-visible">
          <CardContent className="p-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Totaal</p>
              <p className="text-sm font-bold" data-testid="stat-total">{entries?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <Card className="h-full flex flex-col">
          <CardHeader className="p-3 pb-2 flex-shrink-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Ban className="h-4 w-4" />
              Geblokkeerde Bedrijven
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex-1 overflow-auto">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))}
              </div>
            ) : entries && entries.length > 0 ? (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 p-2 rounded border hover-elevate"
                    data-testid={`blacklist-entry-${entry.id}`}
                  >
                    <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/companies/${entry.company.id}`}>
                          <span className="text-sm font-medium hover:underline truncate" data-testid={`text-company-name-${entry.id}`}>
                            {entry.company.name}
                          </span>
                        </Link>
                        {getStatusBadge(entry.status)}
                        {entry.company.isCustomer && (
                          <Badge variant="outline" className="text-[10px] border-blue-500 text-blue-500">Klant</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{entry.company.vatNumber}</span>
                        <span>•</span>
                        <span>Toegevoegd: {formatDate(entry.createdAt)}</span>
                        {entry.reason && (
                          <>
                            <span>•</span>
                            <span className="truncate">{entry.reason}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <RiskScoreBadge score={entry.riskScoreAtTime || entry.paymentBehavior?.riskScore || 50} />
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" data-testid={`button-view-${entry.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{entry.company.name}</DialogTitle>
                            <DialogDescription>Blacklist Details</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground">BTW Nummer</p>
                              <p className="text-sm font-medium">{entry.company.vatNumber}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Status</p>
                              <div className="mt-1">{getStatusBadge(entry.status)}</div>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Risico Score (bij toevoeging)</p>
                              <div className="mt-1">
                                <RiskScoreBadge score={entry.riskScoreAtTime || 50} />
                              </div>
                            </div>
                            {entry.reason && (
                              <div>
                                <p className="text-xs text-muted-foreground">Reden</p>
                                <p className="text-sm">{entry.reason}</p>
                              </div>
                            )}
                            {entry.notes && (
                              <div>
                                <p className="text-xs text-muted-foreground">Notities</p>
                                <p className="text-sm">{entry.notes}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-muted-foreground">Toegevoegd op</p>
                              <p className="text-sm">{formatDate(entry.createdAt)}</p>
                            </div>
                            {entry.resolvedAt && (
                              <div>
                                <p className="text-xs text-muted-foreground">Opgelost op</p>
                                <p className="text-sm">{formatDate(entry.resolvedAt)}</p>
                              </div>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Link href={`/companies/${entry.company.id}`}>
                                <Button size="sm" variant="outline" data-testid={`button-view-company-${entry.id}`}>
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Bekijk Bedrijf
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {entry.status === "active" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => resolveMutation.mutate(entry.id)}
                          disabled={resolveMutation.isPending}
                          data-testid={`button-resolve-${entry.id}`}
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                      )}

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" data-testid={`button-delete-${entry.id}`}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Verwijderen van blacklist?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Weet je zeker dat je {entry.company.name} van de blacklist wilt verwijderen? Deze actie kan niet ongedaan gemaakt worden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuleren</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(entry.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Verwijderen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Ban className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">Geen bedrijven op de blacklist</p>
                <p className="text-xs">Voeg bedrijven toe via de dashboard updates</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
