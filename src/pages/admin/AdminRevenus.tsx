import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Download, Euro, CalendarDays, TrendingUp, BarChart3 } from "lucide-react";
import { format, subDays, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

interface GuestOrder {
  id: string;
  montant_ttc: number;
  created_at: string;
  demarche_type: string;
  nom: string;
  prenom: string;
  status: string;
  paye: boolean;
}

interface Paiement {
  id: string;
  montant: number;
  created_at: string;
  status: string;
}

interface PaymentLink {
  id: string;
  amount: number;
  status: string;
  paid_at: string | null;
}

export default function AdminRevenus() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<GuestOrder[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      checkAdminAndLoad();
    }
  }, [user, authLoading]);

  async function checkAdminAndLoad() {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user!.id);

    if (!roles?.some((r) => r.role === "admin")) {
      navigate("/");
      return;
    }

    fetchData();
  }

  async function fetchData() {
    setLoading(true);
    const [ordersRes, paiementsRes, linksRes] = await Promise.all([
      supabase.from("guest_orders").select("id, montant_ttc, created_at, demarche_type, nom, prenom, status, paye").order("created_at", { ascending: false }),
      supabase.from("paiements").select("id, montant, created_at, status").order("created_at", { ascending: false }),
      supabase.from("payment_links").select("id, amount, status, paid_at").order("paid_at", { ascending: false }),
    ]);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (paiementsRes.data) setPaiements(paiementsRes.data);
    if (linksRes.data) setPaymentLinks(linksRes.data);
    setLoading(false);
  }

  // Compute revenue from paid orders
  const paidOrders = useMemo(() => orders.filter(o => o.paye), [orders]);

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const revenueToday = useMemo(() => paidOrders.filter(o => new Date(o.created_at) >= todayStart).reduce((s, o) => s + (o.montant_ttc || 0), 0), [paidOrders]);
  const revenueWeek = useMemo(() => paidOrders.filter(o => new Date(o.created_at) >= weekStart).reduce((s, o) => s + (o.montant_ttc || 0), 0), [paidOrders]);
  const revenueMonth = useMemo(() => paidOrders.filter(o => new Date(o.created_at) >= monthStart).reduce((s, o) => s + (o.montant_ttc || 0), 0), [paidOrders]);
  const revenueTotal = useMemo(() => paidOrders.reduce((s, o) => s + (o.montant_ttc || 0), 0), [paidOrders]);

  // Daily revenue for last 30 days
  const dailyRevenue = useMemo(() => {
    const days: { date: string; label: string; amount: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const day = subDays(now, i);
      const dayStr = format(day, "yyyy-MM-dd");
      const label = format(day, "dd/MM");
      const amount = paidOrders
        .filter(o => format(new Date(o.created_at), "yyyy-MM-dd") === dayStr)
        .reduce((s, o) => s + (o.montant_ttc || 0), 0);
      days.push({ date: dayStr, label, amount });
    }
    return days;
  }, [paidOrders]);

  const maxDaily = useMemo(() => Math.max(...dailyRevenue.map(d => d.amount), 1), [dailyRevenue]);

  // Revenue by demarche type
  const byType = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    paidOrders.forEach(o => {
      const t = o.demarche_type || "Autre";
      if (!map[t]) map[t] = { count: 0, revenue: 0 };
      map[t].count++;
      map[t].revenue += o.montant_ttc || 0;
    });
    return Object.entries(map)
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [paidOrders]);

  // Recent 20 transactions
  const recentTransactions = useMemo(() => orders.slice(0, 20), [orders]);

  // CSV export
  function exportCSV() {
    const header = "Date,Nom,Prenom,Type,Montant TTC,Status,Paye\n";
    const rows = orders.map(o =>
      `${format(new Date(o.created_at), "yyyy-MM-dd HH:mm")},${o.nom},${o.prenom},${o.demarche_type},${o.montant_ttc},${o.status},${o.paye ? "Oui" : "Non"}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenus_${format(now, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatEur(n: number) {
    return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  }

  function statusBadge(status: string, paye: boolean) {
    if (paye) return <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>Payé</span>;
    if (status === "pending") return <span style={{ background: "#fef9c3", color: "#854d0e", padding: "2px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>En attente</span>;
    return <span style={{ background: "#fee2e2", color: "#991b1b", padding: "2px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600 }}>{status}</span>;
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "#64748b", fontSize: 18 }}>Chargement des revenus...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Aujourd'hui", value: revenueToday, color: "#f59e0b", icon: <Euro size={20} /> },
    { label: "Cette semaine", value: revenueWeek, color: "#3b82f6", icon: <CalendarDays size={20} /> },
    { label: "Ce mois", value: revenueMonth, color: "#8b5cf6", icon: <TrendingUp size={20} /> },
    { label: "Total", value: revenueTotal, color: "#10b981", icon: <BarChart3 size={20} /> },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#1B2A4A", fontWeight: 500, fontSize: 14 }}
            >
              <ArrowLeft size={16} /> Retour
            </button>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1B2A4A", margin: 0 }}>Tableau de bord Revenus</h1>
          </div>
          <button
            onClick={exportCSV}
            style={{ background: "#1B2A4A", color: "white", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14 }}
          >
            <Download size={16} /> Exporter CSV
          </button>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 32 }}>
          {statCards.map(card => (
            <div key={card.label} style={{ background: "white", borderRadius: 12, padding: "24px 20px", borderLeft: `4px solid ${card.color}`, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, color: "#64748b", fontSize: 13, fontWeight: 500 }}>
                <span style={{ color: card.color }}>{card.icon}</span>
                {card.label}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1B2A4A" }}>{formatEur(card.value)}</div>
            </div>
          ))}
        </div>

        {/* Bar chart - Daily revenue last 30 days */}
        <div style={{ background: "white", borderRadius: 12, padding: 24, marginBottom: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1B2A4A", marginTop: 0, marginBottom: 20 }}>Revenu quotidien (30 derniers jours)</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 200 }}>
            {dailyRevenue.map(day => (
              <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  title={`${day.label}: ${formatEur(day.amount)}`}
                  style={{
                    width: "100%",
                    maxWidth: 28,
                    height: day.amount > 0 ? Math.max((day.amount / maxDaily) * 180, 4) : 2,
                    background: day.amount > 0 ? "#f59e0b" : "#e2e8f0",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.3s ease",
                    cursor: "pointer",
                  }}
                />
                {/* Show label every 5 days */}
                <span style={{ fontSize: 9, color: "#94a3b8", marginTop: 4, whiteSpace: "nowrap" }}>
                  {dailyRevenue.indexOf(day) % 5 === 0 ? day.label : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Two columns: by type + recent transactions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Revenue by demarche type */}
          <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1B2A4A", marginTop: 0, marginBottom: 16 }}>Revenu par type de demarche</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ textAlign: "left", padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Type</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Commandes</th>
                  <th style={{ textAlign: "right", padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Revenu</th>
                </tr>
              </thead>
              <tbody>
                {byType.map(row => (
                  <tr key={row.type} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 4px", color: "#1B2A4A", fontWeight: 500 }}>{row.type}</td>
                    <td style={{ padding: "10px 4px", textAlign: "right", color: "#64748b" }}>{row.count}</td>
                    <td style={{ padding: "10px 4px", textAlign: "right", color: "#1B2A4A", fontWeight: 600 }}>{formatEur(row.revenue)}</td>
                  </tr>
                ))}
                {byType.length === 0 && (
                  <tr><td colSpan={3} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Aucune donnee</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Recent transactions */}
          <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1B2A4A", marginTop: 0, marginBottom: 16 }}>Transactions recentes</h2>
            <div style={{ maxHeight: 420, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e2e8f0", position: "sticky", top: 0, background: "white" }}>
                    <th style={{ textAlign: "left", padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Date</th>
                    <th style={{ textAlign: "left", padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Client</th>
                    <th style={{ textAlign: "left", padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Type</th>
                    <th style={{ textAlign: "right", padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Montant</th>
                    <th style={{ textAlign: "center", padding: "8px 4px", color: "#64748b", fontWeight: 600 }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(o => (
                    <tr key={o.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px 4px", color: "#64748b", whiteSpace: "nowrap" }}>{format(new Date(o.created_at), "dd/MM HH:mm")}</td>
                      <td style={{ padding: "8px 4px", color: "#1B2A4A", fontWeight: 500 }}>{o.prenom} {o.nom}</td>
                      <td style={{ padding: "8px 4px", color: "#64748b", fontSize: 12 }}>{o.demarche_type}</td>
                      <td style={{ padding: "8px 4px", textAlign: "right", color: "#1B2A4A", fontWeight: 600 }}>{formatEur(o.montant_ttc)}</td>
                      <td style={{ padding: "8px 4px", textAlign: "center" }}>{statusBadge(o.status, o.paye)}</td>
                    </tr>
                  ))}
                  {recentTransactions.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#94a3b8" }}>Aucune transaction</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
