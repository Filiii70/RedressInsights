import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Copy, Check, Loader2, ExternalLink, MousePointerClick } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface QRCodeCardProps {
  invoiceId: string;
  invoiceNumber?: string;
}

interface QRCodeData {
  token: string;
  qrCodeDataUrl: string;
  url: string;
  clicks: number;
  createdAt?: string;
}

export function QRCodeCard({ invoiceId, invoiceNumber }: QRCodeCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: qrData, isLoading: isLoadingExisting } = useQuery<QRCodeData>({
    queryKey: ["/api/invoices", invoiceId, "qr"],
    retry: false,
  });

  const generateQRMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/invoices/${invoiceId}/qr`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/invoices", invoiceId, "qr"], data);
      toast({
        title: "QR-code gegenereerd",
        description: "Je kunt deze nu downloaden of delen.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon QR-code niet genereren.",
        variant: "destructive",
      });
    },
  });

  const handleCopyLink = async () => {
    if (qrData?.url) {
      await navigator.clipboard.writeText(qrData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link gekopieerd",
        description: "De quick-link is gekopieerd naar je klembord.",
      });
    }
  };

  const handleDownloadQR = () => {
    if (qrData?.qrCodeDataUrl) {
      const link = document.createElement("a");
      link.href = qrData.qrCodeDataUrl;
      link.download = `qr-factuur-${invoiceNumber || invoiceId.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoadingExisting) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!qrData) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            QR-code voor Snelle Registratie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Genereer een QR-code die je klant kan scannen om snel een betaling te bevestigen.
          </p>
          <Button
            onClick={() => generateQRMutation.mutate()}
            disabled={generateQRMutation.isPending}
            className="w-full"
            data-testid="button-generate-qr"
          >
            {generateQRMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Genereren...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                QR-code Genereren
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Quick-Link QR-code
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1">
            <MousePointerClick className="h-3 w-3" />
            {qrData.clicks} scans
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-3 rounded-lg border">
            <img
              src={qrData.qrCodeDataUrl}
              alt="QR Code"
              className="w-40 h-40"
              data-testid="img-qr-code"
            />
          </div>
          
          <p className="text-xs text-center text-muted-foreground max-w-[200px]">
            Scan deze code om betaling te bevestigen in 30 seconden
          </p>

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleDownloadQR}
              data-testid="button-download-qr"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleCopyLink}
              data-testid="button-copy-link"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Gekopieerd
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Kopieer Link
                </>
              )}
            </Button>
          </div>

          <a
            href={qrData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Bekijk registratiepagina
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
