import { Check } from "lucide-react";
import { Link } from "react-router-dom";

type PaymentOption = "garage_dossier" | "garage_tout" | "client_tout";

interface PaymentOptionSelectorProps {
  fraisDossier: number;
  prixCarteGrise: number;
  garageBalance: number;
  selectedOption: PaymentOption;
  onSelect: (option: PaymentOption) => void;
}

interface CardConfig {
  key: PaymentOption;
  title: string;
  subtitle: string;
  garagePays: number;
  garageLabel: string;
  clientPays: number;
  clientLabel: string;
  requiredBalance: number | null;
}

const fmt = (n: number) => n.toFixed(2).replace(".", ",");

export default function PaymentOptionSelector({
  fraisDossier,
  prixCarteGrise,
  garageBalance,
  selectedOption,
  onSelect,
}: PaymentOptionSelectorProps) {
  const total = fraisDossier + prixCarteGrise;

  const cards: CardConfig[] = [
    {
      key: "garage_tout",
      title: "Je paie tout (recommandé)",
      subtitle: "Votre client n'a rien à payer — débit direct sur votre solde",
      garagePays: total,
      garageLabel: `${fmt(total)} EUR (débit solde)`,
      clientPays: 0,
      clientLabel: "0 EUR",
      requiredBalance: total,
    },
    {
      key: "garage_dossier",
      title: "Je paie les frais de dossier, le client paie la CG",
      subtitle: "Un lien de paiement sera envoyé à votre client pour la carte grise",
      garagePays: fraisDossier,
      garageLabel: `${fmt(fraisDossier)} EUR (débit solde)`,
      clientPays: prixCarteGrise,
      clientLabel: `${fmt(prixCarteGrise)} EUR (lien de paiement)`,
      requiredBalance: fraisDossier,
    },
    {
      key: "client_tout",
      title: "Le client paie tout",
      subtitle: "Un lien de paiement sera généré pour votre client",
      garagePays: 0,
      garageLabel: "0 EUR",
      clientPays: total,
      clientLabel: `${fmt(total)} EUR (lien de paiement)`,
      requiredBalance: null,
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold" style={{ color: "#1B2A4A" }}>
          Qui paie quoi ?
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Frais de dossier : {fmt(fraisDossier)} EUR &middot; Carte grise :{" "}
          {fmt(prixCarteGrise)} EUR
        </p>
      </div>

      <div className="space-y-3">
        {cards.map((card) => {
          const disabled =
            card.requiredBalance !== null &&
            garageBalance < card.requiredBalance;
          const selected = selectedOption === card.key && !disabled;
          const missing =
            disabled && card.requiredBalance !== null
              ? card.requiredBalance - garageBalance
              : 0;

          return (
            <button
              key={card.key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(card.key)}
              className={`relative w-full text-left rounded-xl border-2 p-4 transition-all ${
                selected
                  ? "border-blue-600 bg-blue-50/40"
                  : disabled
                    ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              {selected && (
                <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}

              <div className="pr-8">
                <p
                  className="font-semibold text-sm"
                  style={{ color: "#1B2A4A" }}
                >
                  {card.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{card.subtitle}</p>

                <div className="mt-3 flex flex-col gap-1 text-sm">
                  <span style={{ color: "#1B2A4A" }}>
                    <span className="font-medium">Vous :</span>{" "}
                    {card.garageLabel}
                  </span>
                  <span style={{ color: "#1B2A4A" }}>
                    <span className="font-medium">Client :</span>{" "}
                    {card.clientLabel}
                  </span>
                </div>

                {disabled && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    Solde insuffisant (il vous manque {fmt(missing)} EUR)
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-sm pt-1">
        <span className="text-gray-600">
          Votre solde actuel :{" "}
          <span className="font-semibold" style={{ color: "#1B2A4A" }}>
            {fmt(garageBalance)} EUR
          </span>
        </span>
        <Link
          to="/acheter-jetons"
          className="text-blue-600 hover:underline font-medium"
        >
          Recharger mon compte
        </Link>
      </div>
    </div>
  );
}
