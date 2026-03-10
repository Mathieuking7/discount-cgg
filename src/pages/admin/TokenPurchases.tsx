import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, FileText, Loader2, RefreshCw, Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";

interface TokenPurchase {
  id: string;
  garage_id: string;
  quantity: number;
  amount: number;
  created_at: string;
  stripe_payment_id: string | null;
  garages: {
    raison_sociale: string;
    email: string;
  } | null;
  facture?: {
    id: string;
    numero: string;
    pdf_url: string | null;
  } | null;
}

export default function TokenPurchases() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<TokenPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAccess();
    }
  }, [user, authLoading]);

  const checkAdminAccess = async () => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user?.id)
      .single();

    if (!roles || roles.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    loadPurchases();
  };

  const loadPurchases = async () => {
    const { data: purchasesData, error: purchasesError } = await supabase
      .from('token_purchases')
      .select(`
        *,
        garages:garage_id (raison_sociale, email)
      `)
      .order('created_at', { ascending: false });

    if (purchasesError) {
      console.error('Error loading purchases:', purchasesError);
      setLoading(false);
      return;
    }

    const { data: factures } = await supabase
      .from('factures')
      .select('id, numero, pdf_url, token_purchase_id')
      .not('token_purchase_id', 'is', null);

    const facturesMap = new Map(
      (factures || []).map(f => [f.token_purchase_id, f])
    );

    const purchasesWithFactures = (purchasesData || []).map(p => ({
      ...p,
      facture: facturesMap.get(p.id) || null
    }));

    setPurchases(purchasesWithFactures);
    setLoading(false);
  };

  const generateFacture = async (purchaseId: string) => {
    setGeneratingId(purchaseId);
    try {
      const { data, error } = await supabase.functions.invoke('generate-token-facture', {
        body: { tokenPurchaseId: purchaseId }
      });

      if (error) throw error;

      toast({
        title: "Facture generee",
        description: `Facture ${data.facture.numero} creee avec succes`
      });

      loadPurchases();
    } catch (error: any) {
      console.error('Error generating facture:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la generation",
        variant: "destructive"
      });
    } finally {
      setGeneratingId(null);
    }
  };

  const generateAllFactures = async () => {
    setGeneratingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-all-token-factures', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Generation terminee",
        description: `${data.successCount} factures generees, ${data.errorCount} erreurs`
      });

      loadPurchases();
    } catch (error: any) {
      console.error('Error generating all factures:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la generation",
        variant: "destructive"
      });
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleDownloadFacture = async (purchase: TokenPurchase) => {
    if (!purchase.facture?.pdf_url) return;

    setDownloadingId(purchase.id);
    try {
      const { downloadFacture, extractPathFromUrl } = await import("@/lib/storage-utils");

      const path = extractPathFromUrl(purchase.facture.pdf_url);

      console.log(`TokenPurchases: Downloading facture, path="${path}"`);

      await downloadFacture(path);

      toast({
        title: "Facture telechargee",
        description: `Facture ${purchase.facture.numero}`
      });
    } catch (error: any) {
      console.error('Error downloading facture:', error);
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de telecharger la facture",
        variant: "destructive"
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const purchasesWithoutFacture = purchases.filter(p => !p.facture);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDF8F0] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6 rounded-full hover:bg-white/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Euro className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Achats de jetons</h1>
                <p className="text-sm text-gray-500">
                  {purchases.length} achats - {purchasesWithoutFacture.length} sans facture
                </p>
              </div>
            </div>
            {purchasesWithoutFacture.length > 0 && (
              <Button
                onClick={generateAllFactures}
                disabled={generatingAll}
                className="rounded-full"
              >
                {generatingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generation en cours...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generer {purchasesWithoutFacture.length} factures
                  </>
                )}
              </Button>
            )}
          </div>

          {purchases.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Aucun achat de jetons</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-100">
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Garage</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Credits</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Montant</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Bonus</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Facture</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-gray-500 font-medium text-xs uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => {
                    const bonus = purchase.quantity - purchase.amount;
                    return (
                      <TableRow key={purchase.id} className="border-gray-50">
                        <TableCell className="font-medium text-gray-700">
                          {purchase.garages?.raison_sociale || 'N/A'}
                        </TableCell>
                        <TableCell className="font-bold text-blue-700">
                          {formatPrice(purchase.quantity)}&euro;
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {formatPrice(purchase.amount)}&euro;
                        </TableCell>
                        <TableCell>
                          {bonus > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              +{formatPrice(bonus)}&euro;
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {purchase.facture ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              {purchase.facture.numero}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              Non generee
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(purchase.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          {purchase.facture ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadFacture(purchase)}
                              disabled={downloadingId === purchase.id}
                              className="rounded-full"
                            >
                              {downloadingId === purchase.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateFacture(purchase.id)}
                              disabled={generatingId === purchase.id}
                              className="rounded-full"
                            >
                              {generatingId === purchase.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
