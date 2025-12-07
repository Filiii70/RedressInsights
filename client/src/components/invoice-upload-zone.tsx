import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export function InvoiceUploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("invoice", file);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);
      
      try {
        const response = await fetch("/api/invoices/upload", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Upload failed");
        }
        
        return response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if ((error as Error).name === 'AbortError') {
          throw new Error("Upload timeout - try a smaller image");
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices/recent"] });
      toast({
        title: "Invoice uploaded",
        description: "The invoice has been successfully processed.",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf" || file.type.startsWith("image/")
    );
    
    if (droppedFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Upload a PDF or image (PNG, JPG).",
        variant: "destructive",
      });
      return;
    }
    
    processFiles(droppedFiles);
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  }, []);

  const processFiles = async (newFiles: File[]) => {
    const uploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      file,
      status: "pending" as const,
    }));

    setFiles((prev) => [...prev, ...uploadedFiles]);

    for (const uploadedFile of uploadedFiles) {
      setFiles((prev) =>
        prev.map((f) =>
          f.file === uploadedFile.file ? { ...f, status: "uploading" } : f
        )
      );

      try {
        await uploadMutation.mutateAsync(uploadedFile.file);
        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadedFile.file ? { ...f, status: "success" } : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === uploadedFile.file
              ? { ...f, status: "error", error: (error as Error).message }
              : f
          )
        );
      }
    }
  };

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  };

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "overflow-visible border-2 border-dashed transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Drop your invoice here
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to select a file
          </p>
          <Button asChild variant="outline" data-testid="button-select-file">
            <label className="cursor-pointer">
              Select file
              <input
                type="file"
                accept=".pdf,image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                data-testid="input-file-upload"
              />
            </label>
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Supported formats: PDF, PNG, JPG
          </p>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Card className="overflow-visible">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Uploaded files</h4>
            <ul className="space-y-2">
              {files.map((uploadedFile, index) => (
                <li
                  key={`${uploadedFile.file.name}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                  data-testid={`file-item-${index}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm truncate">{uploadedFile.file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploadedFile.status === "uploading" && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {uploadedFile.status === "success" && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    {uploadedFile.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFile(uploadedFile.file)}
                      className="h-6 w-6"
                      data-testid={`button-remove-file-${index}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
