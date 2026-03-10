import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Bell, CheckCircle, Clock, Gift, CreditCard, XCircle, FileText } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function AllDemarches() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [demarchesATraiter, setDemarchesATraiter] = useState<any[]>([]);
  const [demarchesTerminees, setDemarchesTerminees] = useState<any[]>([]);
  const [demarchesRefusees, setDemarchesRefusees] = useState<any[]>([]);
  const [demarchesEnSaisie, setDemarchesEnSaisie] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      checkAdminAndLoadData();
    }
  }, [user]);

  const checkAdminAndLoadData = async () => {
    if (!user) return;

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAdminRole = roles?.some(r => r.role === 'admin');

    if (!hasAdminRole) {
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);

    const { data } = await supabase
      .from('demarches')
      .select('*, garages(raison_sociale, is_verified)')
      .order('created_at', { ascending: false });

    if (data) {
      const aTraiter = data.filter(d =>
        d.is_draft === false && (d.paye === true || d.is_free_token === true) && d.status !== 'finalise' && d.status !== 'refuse'
      );
      const terminees = data.filter(d => d.status === 'finalise');
      const refusees = data.filter(d => d.status === 'refuse');
      const enSaisie = data.filter(d => d.is_draft === true);

      setDemarchesATraiter(aTraiter);
      setDemarchesTerminees(terminees);
      setDemarchesRefusees(refusees);
      setDemarchesEnSaisie(enSaisie);
    }

    setLoading(false);
  };

  const handleViewDemarche = async (demarche: any) => {
    if (!demarche.admin_viewed) {
      await supabase
        .from('demarches')
        .update({ admin_viewed: true })
        .eq('id', demarche.id);

      setDemarchesATraiter(prev =>
        prev.map(d => d.id === demarche.id ? { ...d, admin_viewed: true } : d)
      );
    }

    navigate(`/admin/demarche/${demarche.id}`);
  };

  const getPaymentStatusBadge = (demarche: any) => {
    if (demarche.is_free_token) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
          <Gift className="h-3 w-3" />
          Jeton gratuit
        </span>
      );
    }
    if (demarche.paye) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
          <CreditCard className="h-3 w-3" />
          Paye
        </span>
      );
    }
    return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">Non paye</span>;
  };

  const unviewedCount = demarchesATraiter.filter(d => !d.admin_viewed).length;

  if (authLoading || loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const renderTable = (items: any[], options?: { showUnviewed?: boolean; rowBgClass?: string }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200">
            {options?.showUnviewed && <TableHead className="w-10"></TableHead>}
            <TableHead className="text-xs uppercase tracking-widest text-gray-500 font-medium">N Demarche</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-gray-500 font-medium">Immatriculation</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-gray-500 font-medium">Garage</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-gray-500 font-medium">Type</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-gray-500 font-medium">Paiement</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-gray-500 font-medium">Montant</TableHead>
            <TableHead className="text-xs uppercase tracking-widest text-gray-500 font-medium">Date</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((d: any) => (
            <TableRow
              key={d.id}
              className={`border-gray-100 hover:bg-gray-50 ${options?.showUnviewed && !d.admin_viewed ? "bg-red-50/60" : (options?.rowBgClass || "")}`}
            >
              {options?.showUnviewed && (
                <TableCell>
                  {!d.admin_viewed && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </TableCell>
              )}
              <TableCell className="font-mono text-xs font-semibold text-gray-900">{d.numero_demarche}</TableCell>
              <TableCell className="font-medium text-gray-700">{d.immatriculation}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">{d.garages?.raison_sociale}</span>
                  {d.garages?.is_verified && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-green-100 text-green-700">Verifie</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">{d.type}</span>
              </TableCell>
              <TableCell>{getPaymentStatusBadge(d)}</TableCell>
              <TableCell className="font-medium text-gray-700">{formatPrice(d.montant_ttc || 0)}&euro;</TableCell>
              <TableCell className="text-gray-500 text-sm">{new Date(d.created_at).toLocaleDateString('fr-FR')}</TableCell>
              <TableCell>
                <Link
                  to={`/admin/demarche/${d.id}`}
                  onClick={() => options?.showUnviewed && handleViewDemarche(d)}
                >
                  <Button
                    size="sm"
                    className={`rounded-md text-xs ${options?.showUnviewed && !d.admin_viewed ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-900 hover:bg-gray-800 text-white"}`}
                  >
                    {options?.showUnviewed && !d.admin_viewed ? "A traiter" : "Voir"}
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6 rounded-md hover:bg-gray-50">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        {/* Section A TRAITER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-xl font-serif font-bold text-gray-900">Demarches a traiter</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">{demarchesATraiter.length}</span>
            {unviewedCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700 animate-pulse">
                <Bell className="h-3 w-3" />
                {unviewedCount} nouvelle{unviewedCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {demarchesATraiter.length === 0 ? (
            <p className="text-gray-400 text-center py-8 border border-gray-200 rounded-md">Aucune demarche a traiter</p>
          ) : (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {renderTable(demarchesATraiter, { showUnviewed: true })}
            </div>
          )}
        </div>

        {/* Section REFUSEES */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-xl font-serif font-bold text-gray-900">Demarches refusees</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700">{demarchesRefusees.length}</span>
          </div>

          {demarchesRefusees.length === 0 ? (
            <p className="text-gray-400 text-center py-8 border border-gray-200 rounded-md">Aucune demarche refusee</p>
          ) : (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {renderTable(demarchesRefusees)}
            </div>
          )}
        </div>

        {/* Section TERMINEES */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-xl font-serif font-bold text-gray-900">Demarches terminees</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-700">{demarchesTerminees.length}</span>
          </div>

          {demarchesTerminees.length === 0 ? (
            <p className="text-gray-400 text-center py-8 border border-gray-200 rounded-md">Aucune demarche terminee</p>
          ) : (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {renderTable(demarchesTerminees)}
            </div>
          )}
        </div>

        {/* Section EN SAISIE */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-lg font-serif font-bold text-gray-500">Brouillons en cours de saisie</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">{demarchesEnSaisie.length}</span>
          </div>

          {demarchesEnSaisie.length === 0 ? (
            <p className="text-gray-400 text-center py-4 border border-gray-200 rounded-md">Aucun brouillon</p>
          ) : (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              {renderTable(demarchesEnSaisie)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
