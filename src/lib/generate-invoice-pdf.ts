import { jsPDF } from "jspdf";
import { siteConfig } from "@/config/site.config";

export interface InvoiceOrder {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  code_postal: string;
  ville: string;
  montant_ht: number;
  montant_ttc: number;
  frais_dossier: number;
  paye: boolean;
  created_at: string;
  demarche_type?: string;
  sms_notifications?: boolean;
}

export interface BrandingConfig {
  companyName?: string;
  address?: string;
  siret?: string;
  habilitation?: string;
  email?: string;
  phone?: string;
}

const DEMARCHE_LABELS: Record<string, string> = {
  changement_titulaire: "Changement de titulaire (carte grise)",
  duplicata: "Duplicata de carte grise",
  changement_adresse: "Changement d'adresse",
  declaration_cession: "Declaration de cession",
  immatriculation_neuf: "Premiere immatriculation (vehicule neuf)",
  immatriculation_import: "Immatriculation (vehicule importe)",
  correction_erreur: "Correction d'erreur",
  carte_grise: "Carte grise",
  changement_caracteristiques: "Changement de caracteristiques techniques",
};

function getDemarcheLabel(type?: string): string {
  if (!type) return "Demarche administrative";
  return DEMARCHE_LABELS[type] || type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatCurrency(amount: number): string {
  return amount.toFixed(2).replace(".", ",") + " \u20AC";
}

export async function generateInvoicePDF(
  order: InvoiceOrder,
  config?: BrandingConfig
): Promise<Blob> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const companyName = config?.companyName || siteConfig.legalName;
  const companyAddress = config?.address || "France";
  const siret = config?.siret || "XXX XXX XXX XXXXX";
  const habilitation = config?.habilitation || "N\u00B0 XXXXX";
  const companyEmail = config?.email || siteConfig.emails.contact;

  const invoiceNumber = `FAC-${new Date(order.created_at).getFullYear()}-${order.id.slice(0, 8).toUpperCase()}`;

  // ── Header ──────────────────────────────────────────────
  doc.setFillColor(17, 24, 39); // gray-900
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(companyName, margin, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(companyAddress, margin, 27);
  doc.text(`SIRET : ${siret}`, margin, 32);
  doc.text(companyEmail, margin, 37);

  // Invoice label on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("FACTURE", pageWidth - margin, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(invoiceNumber, pageWidth - margin, 27, { align: "right" });
  doc.text(`Date : ${formatDate(order.created_at)}`, pageWidth - margin, 32, { align: "right" });

  y = 55;

  // ── Payment status badge ────────────────────────────────
  if (order.paye) {
    doc.setFillColor(34, 197, 94); // green
    doc.roundedRect(pageWidth - margin - 30, y - 5, 30, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("PAYE", pageWidth - margin - 15, y, { align: "center" });
  } else {
    doc.setFillColor(239, 68, 68); // red
    doc.roundedRect(pageWidth - margin - 35, y - 5, 35, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("EN ATTENTE", pageWidth - margin - 17.5, y, { align: "center" });
  }

  // ── Client info ─────────────────────────────────────────
  doc.setTextColor(107, 114, 128); // gray-500
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("FACTURE A", margin, y);

  y += 6;
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${order.prenom} ${order.nom}`, margin, y);

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(order.adresse, margin, y);
  y += 4.5;
  doc.text(`${order.code_postal} ${order.ville}`, margin, y);
  y += 4.5;
  doc.text(order.email, margin, y);
  if (order.telephone) {
    y += 4.5;
    doc.text(order.telephone, margin, y);
  }

  y += 12;

  // ── Table ───────────────────────────────────────────────
  const colX = {
    desc: margin,
    qty: margin + contentWidth * 0.5,
    unit: margin + contentWidth * 0.65,
    total: margin + contentWidth * 0.85,
  };

  // Table header
  doc.setFillColor(243, 244, 246); // gray-100
  doc.rect(margin, y - 4, contentWidth, 8, "F");

  doc.setTextColor(107, 114, 128);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("DESCRIPTION", colX.desc + 2, y);
  doc.text("QTE", colX.qty, y, { align: "center" });
  doc.text("PRIX UNIT.", colX.unit, y, { align: "center" });
  doc.text("TOTAL", pageWidth - margin - 2, y, { align: "right" });

  y += 8;

  // Build line items
  const items: { desc: string; qty: number; unitPrice: number; total: number }[] = [];

  const servicePrice = order.frais_dossier || order.montant_ht;
  items.push({
    desc: getDemarcheLabel(order.demarche_type),
    qty: 1,
    unitPrice: servicePrice,
    total: servicePrice,
  });

  // Taxe regionale: difference between TTC and HT minus other line items
  const taxeRegionale = order.montant_ttc - order.montant_ht;
  if (taxeRegionale > 0 && order.demarche_type?.includes("carte_grise") || order.demarche_type === "changement_titulaire" || order.demarche_type === "immatriculation_neuf" || order.demarche_type === "immatriculation_import") {
    items.push({
      desc: "Taxe regionale (carte grise)",
      qty: 1,
      unitPrice: taxeRegionale,
      total: taxeRegionale,
    });
  }

  if (order.sms_notifications) {
    items.push({
      desc: "Suivi SMS",
      qty: 1,
      unitPrice: 5.0,
      total: 5.0,
    });
  }

  // Draw rows
  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  items.forEach((item, i) => {
    if (i > 0) {
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y - 4, pageWidth - margin, y - 4);
    }

    doc.text(item.desc, colX.desc + 2, y);
    doc.text(String(item.qty), colX.qty, y, { align: "center" });
    doc.text(formatCurrency(item.unitPrice), colX.unit, y, { align: "center" });
    doc.text(formatCurrency(item.total), pageWidth - margin - 2, y, { align: "right" });

    y += 8;
  });

  // Bottom line
  doc.setDrawColor(209, 213, 219);
  doc.line(margin, y - 4, pageWidth - margin, y - 4);

  y += 4;

  // ── Totals ──────────────────────────────────────────────
  const totalsX = margin + contentWidth * 0.6;
  const totalsValX = pageWidth - margin - 2;

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text("Total HT", totalsX, y);
  doc.setTextColor(17, 24, 39);
  doc.text(formatCurrency(order.montant_ht), totalsValX, y, { align: "right" });

  y += 6;

  const tva = order.montant_ttc - order.montant_ht;
  if (tva > 0) {
    doc.setTextColor(107, 114, 128);
    doc.text("TVA", totalsX, y);
    doc.setTextColor(17, 24, 39);
    doc.text(formatCurrency(tva), totalsValX, y, { align: "right" });
    y += 6;
  } else {
    doc.setTextColor(107, 114, 128);
    doc.text("TVA non applicable (art. 293B CGI)", totalsX, y);
    y += 6;
  }

  // Total TTC box
  doc.setFillColor(17, 24, 39);
  doc.roundedRect(totalsX - 4, y - 4, pageWidth - margin - totalsX + 6, 10, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL TTC", totalsX, y + 2);
  doc.text(formatCurrency(order.montant_ttc), totalsValX, y + 2, { align: "right" });

  y += 20;

  // ── Footer ──────────────────────────────────────────────
  doc.setDrawColor(229, 231, 235);
  doc.line(margin, y, pageWidth - margin, y);

  y += 8;
  doc.setTextColor(107, 114, 128);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const footerLines = [
    "Merci pour votre confiance.",
    "",
    `${companyName} - ${companyAddress}`,
    `SIRET : ${siret} | Habilitation : ${habilitation}`,
    `Contact : ${companyEmail}`,
    "",
    "Document a conserver. En cas de litige, contacter le service client.",
  ];

  footerLines.forEach((line) => {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 4;
  });

  return doc.output("blob");
}
