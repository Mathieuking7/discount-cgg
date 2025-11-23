import { UploadDocument } from "./UploadDocument";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface UploadListProps {
  orderId: string;
  isPaid: boolean;
}

const requiredDocuments = [
  "Carte grise (recto)",
  "Carte grise (verso)",
  "Pièce d'identité (recto)",
  "Pièce d'identité (verso)",
  "Justificatif de domicile",
];

export const UploadList = ({ orderId, isPaid }: UploadListProps) => {
  if (!isPaid) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Documents requis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vous pourrez déposer vos documents après le paiement
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Déposez vos documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requiredDocuments.map((docType) => (
          <UploadDocument
            key={docType}
            orderId={orderId}
            documentType={docType}
            onUploadSuccess={() => {}}
          />
        ))}
      </CardContent>
    </Card>
  );
};
