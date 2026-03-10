import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { generateInvoicePDF, type InvoiceOrder, type BrandingConfig } from "@/lib/generate-invoice-pdf";

interface InvoiceButtonProps {
  order: InvoiceOrder;
  brandingConfig?: BrandingConfig;
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
}

export function InvoiceButton({ order, brandingConfig, variant = "outline", className }: InvoiceButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateInvoicePDF(order, brandingConfig);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-${order.id.slice(0, 8).toUpperCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur generation facture:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleDownload}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generation...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Telecharger la facture
        </>
      )}
    </Button>
  );
}
