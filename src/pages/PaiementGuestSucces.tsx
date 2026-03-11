import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Copy, Search, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PaiementGuestSucces = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    const loadOrder = async () => {
      const { data, error } = await supabase
        .from("guest_orders")
        .select("id, tracking_number, nom, prenom, email, immatriculation, montant_ttc, demarche_type")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        navigate("/recherche-suivi");
        return;
      }
      setOrder(data);
    };
    loadOrder();
  }, [orderId]);

  const handleCopy = () => {
    if (!order?.tracking_number) return;
    navigator.clipboard.writeText(order.tracking_number);
    setCopied(true);
    toast({ title: "Copie !", description: "Numero de suivi copie dans le presse-papier" });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Success icon */}
          <div className="mx-auto w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Paiement confirme !</h1>
            <p className="text-gray-500 text-lg">
              Merci {order.prenom}, votre commande a ete validee avec succes.
            </p>
          </div>

          {/* Tracking number card */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-3">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Votre numero de suivi</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-mono font-bold text-[#1B2A4A] tracking-wider">
                {order.tracking_number}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title="Copier le numero"
              >
                <Copy className={`w-5 h-5 ${copied ? "text-emerald-500" : "text-gray-400"}`} />
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Conservez ce numero pour suivre l'avancement de votre dossier.
            </p>
          </div>

          {/* Info */}
          {order.email && (
            <p className="text-sm text-gray-500">
              Un email de confirmation a ete envoye a <span className="font-medium text-gray-700">{order.email}</span>
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/suivi/${order.tracking_number}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B2A4A] text-white rounded-full text-sm font-semibold hover:bg-[#263a5e] transition-colors"
            >
              <Search className="w-4 h-4" />
              Suivre ma commande
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Retour a l'accueil
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaiementGuestSucces;
