import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";

// Keep landing page in main bundle
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Loading fallback
const LoadingSpinner = () => (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
    <div style={{
      width: 40,
      height: 40,
      border: "4px solid #e5e7eb",
      borderTop: "4px solid #3b82f6",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Lazy-loaded auth pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));

// Lazy-loaded user pages
const NouvelleDemarche = lazy(() => import("./pages/NouvelleDemarche"));
const MesDemarches = lazy(() => import("./pages/MesDemarches"));
const MesFactures = lazy(() => import("./pages/MesFactures"));
const DemarcheDetail = lazy(() => import("./pages/DemarcheDetail"));
const GarageSettings = lazy(() => import("./pages/GarageSettings"));
const Support = lazy(() => import("./pages/Support"));
const AcheterJetons = lazy(() => import("./pages/AcheterJetons"));
const PaiementRecharge = lazy(() => import("./pages/PaiementRecharge"));
const PaiementRechargeSucces = lazy(() => import("./pages/PaiementRechargeSucces"));
const PaiementSoldeSucces = lazy(() => import("./pages/PaiementSoldeSucces"));

// Lazy-loaded guest/public pages
const CommanderSansCompte = lazy(() => import("./pages/CommanderSansCompte"));
const PaiementGuestOrder = lazy(() => import("./pages/PaiementGuestOrder"));
const PaiementDemarche = lazy(() => import("./pages/PaiementDemarche"));
const PaiementSucces = lazy(() => import("./pages/PaiementSucces"));
const SuiviCommande = lazy(() => import("./pages/SuiviCommande"));
const RechercheSuivi = lazy(() => import("./pages/RechercheSuivi"));
const DevisCarteGrise = lazy(() => import("./pages/DevisCarteGrise"));
const Simulateur = lazy(() => import("./pages/Simulateur"));
const ResultatCarteGrise = lazy(() => import("./pages/ResultatCarteGrise"));
const DemarcheSimple = lazy(() => import("./pages/DemarcheSimple"));
const DemarcheParticulier = lazy(() => import("./pages/DemarcheParticulier"));
const PaiementGuestSucces = lazy(() => import("./pages/PaiementGuestSucces"));
const PayerLink = lazy(() => import("./pages/PayerLink"));
const CompleterDemarchePro = lazy(() => import("./pages/CompleterDemarchePro"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const CGV = lazy(() => import("./pages/CGV"));
const PolitiqueConfidentialite = lazy(() => import("./pages/PolitiqueConfidentialite"));

// Lazy-loaded landing pages
const SIVFlowLanding = lazy(() => import("./pages/SIVFlowLanding"));

// Lazy-loaded pro garage dashboard
const GarageDashboard = lazy(() => import("./pages/Dashboard"));

// Lazy-loaded admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AllDemarches = lazy(() => import("./pages/admin/AllDemarches"));
const AdminDemarcheDetail = lazy(() => import("./pages/admin/DemarcheDetail"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const ManageActions = lazy(() => import("./pages/admin/ManageActions"));
const ManageGarages = lazy(() => import("./pages/admin/ManageGarages"));
const ManageAccounts = lazy(() => import("./pages/admin/ManageAccounts"));
const GuestOrders = lazy(() => import("./pages/admin/GuestOrders"));
const GuestOrderDetail = lazy(() => import("./pages/admin/GuestOrderDetail"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const HistoriquePaiements = lazy(() => import("./pages/admin/HistoriquePaiements"));
const TokenPurchases = lazy(() => import("./pages/admin/TokenPurchases"));
const ManageEmailTemplates = lazy(() => import("./pages/admin/ManageEmailTemplates"));
const ManagePricingConfig = lazy(() => import("./pages/admin/ManagePricingConfig"));
const TestEmail = lazy(() => import("./pages/admin/TestEmail"));
const AdminRevenus = lazy(() => import("./pages/admin/AdminRevenus"));
const ManageGuestActions = lazy(() => import("./pages/admin/ManageGuestActions"));
const PaymentLinkCreator = lazy(() => import("./pages/admin/PaymentLinkCreator"));
const CreateDemarche = lazy(() => import("./pages/admin/CreateDemarche"));
const AdminCreerDemarche = lazy(() => import("./pages/admin/AdminCreerDemarche"));
const ManageSubscriptions = lazy(() => import("./pages/admin/ManageSubscriptions"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/devis/:orderId" element={<DevisCarteGrise />} />
              <Route path="/demarches/:slug" element={<DemarcheParticulier />} />
              <Route path="/simulateur" element={<Simulateur />} />
              <Route path="/resultat-carte-grise" element={<ResultatCarteGrise />} />
              <Route path="/demarche-simple" element={<DemarcheSimple />} />
              <Route path="/commander/:orderId" element={<CommanderSansCompte />} />
              <Route path="/paiement/:orderId" element={<PaiementGuestOrder />} />
              <Route path="/paiement-demarche/:demarcheId" element={<PaiementDemarche />} />
              <Route path="/paiement-succes/:demarcheId" element={<PaiementSucces />} />
              <Route path="/paiement-guest-succes/:orderId" element={<PaiementGuestSucces />} />
              <Route path="/recherche-suivi" element={<RechercheSuivi />} />
              <Route path="/suivi/:trackingNumber" element={<SuiviCommande />} />
              <Route path="/mon-espace" element={<GarageDashboard />} />
              <Route path="/nouvelle-demarche" element={<NouvelleDemarche />} />
              <Route path="/nouvelle-demarche/:draftId" element={<NouvelleDemarche />} />
              <Route path="/mes-demarches" element={<MesDemarches />} />
              <Route path="/mes-factures" element={<MesFactures />} />
              <Route path="/demarche/:id" element={<DemarcheDetail />} />
              <Route path="/garage-settings" element={<GarageSettings />} />
              <Route path="/acheter-jetons" element={<AcheterJetons />} />
              <Route path="/paiement-recharge" element={<PaiementRecharge />} />
              <Route path="/paiement-recharge-succes" element={<PaiementRechargeSucces />} />
              <Route path="/paiement-solde-succes/:demarcheId" element={<PaiementSoldeSucces />} />
              <Route path="/support" element={<Support />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/dashboard/demarches" element={<AllDemarches />} />
              <Route path="/dashboard/demarche/:id" element={<AdminDemarcheDetail />} />
              <Route path="/dashboard/users" element={<ManageUsers />} />
              <Route path="/dashboard/actions" element={<ManageActions />} />
              <Route path="/dashboard/manage-garages" element={<ManageGarages />} />
              <Route path="/dashboard/manage-accounts" element={<ManageAccounts />} />
              <Route path="/dashboard/notifications" element={<AdminNotifications />} />
              <Route path="/dashboard/historique-paiements" element={<HistoriquePaiements />} />
              <Route path="/dashboard/token-purchases" element={<TokenPurchases />} />
              <Route path="/dashboard/email-templates" element={<ManageEmailTemplates />} />
              <Route path="/dashboard/pricing-config" element={<ManagePricingConfig />} />
              <Route path="/dashboard/test-email" element={<TestEmail />} />
              <Route path="/dashboard/revenus" element={<AdminRevenus />} />
              <Route path="/dashboard/guest-orders" element={<GuestOrders />} />
              <Route path="/dashboard/guest-order/:id" element={<GuestOrderDetail />} />
              <Route path="/dashboard/guest-actions" element={<ManageGuestActions />} />
              <Route path="/dashboard/payment-links" element={<PaymentLinkCreator />} />
              <Route path="/dashboard/create-demarche" element={<CreateDemarche />} />
              <Route path="/dashboard/admin-creer-demarche" element={<AdminCreerDemarche />} />
              <Route path="/dashboard/subscriptions" element={<ManageSubscriptions />} />
              <Route path="/payer/:shortCode" element={<PayerLink />} />
              <Route path="/completer-demarche/:linkId" element={<CompleterDemarchePro />} />
              <Route path="/sivflow" element={<SIVFlowLanding />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/cgv" element={<CGV />} />
              <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
