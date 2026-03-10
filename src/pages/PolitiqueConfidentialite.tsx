import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/config/site.config";

const PolitiqueConfidentialite = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-serif font-bold text-[#1B2A4A] mb-4">
          Politique de confidentialite
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Derniere mise a jour : [DATE]
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            1. Responsable du traitement
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Le responsable du traitement des donnees a caractere personnel
            collectees sur le site {siteConfig.baseUrl} est :
          </p>
          <ul className="mt-3 space-y-1 text-gray-700">
            <li><strong>Raison sociale :</strong> {siteConfig.legalName}</li>
            <li><strong>Siege social :</strong> [ADRESSE COMPLETE]</li>
            <li><strong>E-mail :</strong> {siteConfig.emails.contact}</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            2. Donnees collectees
          </h2>
          <p className="text-gray-700 mb-3 leading-relaxed">
            Dans le cadre de l'utilisation du site et des services proposes, nous
            sommes amenes a collecter les donnees suivantes :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Nom et prenom</li>
            <li>Adresse postale</li>
            <li>Adresse e-mail</li>
            <li>Numero de telephone</li>
            <li>Numero d'immatriculation du vehicule</li>
            <li>Documents justificatifs (piece d'identite, justificatif de domicile, carte grise, etc.)</li>
            <li>Donnees de connexion et de navigation (adresse IP, cookies)</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            3. Finalites du traitement
          </h2>
          <p className="text-gray-700 mb-3">
            Les donnees collectees sont utilisees pour les finalites suivantes :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Traitement et suivi des demarches d'immatriculation</li>
            <li>Facturation et gestion comptable</li>
            <li>Communication avec le Client (suivi de dossier, notifications)</li>
            <li>Amelioration de nos services et de l'experience utilisateur</li>
            <li>Respect des obligations legales et reglementaires</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            4. Base legale du traitement
          </h2>
          <p className="text-gray-700 mb-3">
            Le traitement des donnees repose sur les bases legales suivantes :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>
              <strong>Execution du contrat :</strong> le traitement est necessaire
              a l'execution de la prestation commandee par le Client
            </li>
            <li>
              <strong>Obligation legale :</strong> conservation des documents et
              donnees exigees par la reglementation (obligations fiscales,
              habilitation ANTS)
            </li>
            <li>
              <strong>Interet legitime :</strong> amelioration des services,
              securite du site
            </li>
            <li>
              <strong>Consentement :</strong> pour l'envoi de communications
              commerciales et le depot de cookies non essentiels
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            5. Duree de conservation
          </h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>
              <strong>Donnees de demarches :</strong> 3 ans apres la derniere
              demarche effectuee
            </li>
            <li>
              <strong>Documents justificatifs :</strong> supprimes 6 mois apres
              la finalisation de la demarche
            </li>
            <li>
              <strong>Donnees de facturation :</strong> 10 ans (obligation legale
              comptable)
            </li>
            <li>
              <strong>Cookies :</strong> 13 mois maximum
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            6. Destinataires des donnees
          </h2>
          <p className="text-gray-700 mb-3 leading-relaxed">
            Les donnees collectees peuvent etre transmises aux destinataires
            suivants :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>L'Agence Nationale des Titres Securises (ANTS) pour le traitement des demarches</li>
            <li>Notre prestataire d'hebergement (Vercel, Supabase)</li>
            <li>Notre prestataire de paiement (Stripe)</li>
            <li>Les autorites competentes en cas d'obligation legale</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            7. Droits des personnes
          </h2>
          <p className="text-gray-700 mb-3 leading-relaxed">
            Conformement au Reglement General sur la Protection des Donnees
            (RGPD) et a la loi Informatique et Libertes, vous disposez des droits
            suivants :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>Droit d'acces :</strong> obtenir une copie de vos donnees personnelles</li>
            <li><strong>Droit de rectification :</strong> corriger des donnees inexactes ou incompletes</li>
            <li><strong>Droit de suppression :</strong> demander l'effacement de vos donnees</li>
            <li><strong>Droit a la portabilite :</strong> recevoir vos donnees dans un format structure</li>
            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos donnees</li>
            <li><strong>Droit a la limitation :</strong> demander la limitation du traitement</li>
          </ul>
          <p className="text-gray-700 mt-3 leading-relaxed">
            Pour exercer vos droits, adressez votre demande par e-mail a{" "}
            <a
              href={`mailto:${siteConfig.emails.contact}`}
              className="text-blue-600 hover:underline"
            >
              {siteConfig.emails.contact}
            </a>{" "}
            en joignant une copie de votre piece d'identite.
          </p>
          <p className="text-gray-700 mt-2 leading-relaxed">
            Vous pouvez egalement introduire une reclamation aupres de la CNIL
            (Commission Nationale de l'Informatique et des Libertes) :{" "}
            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              www.cnil.fr
            </a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            8. Cookies
          </h2>
          <p className="text-gray-700 mb-3 leading-relaxed">
            Le site utilise des cookies pour assurer son bon fonctionnement et
            ameliorer l'experience utilisateur. Les types de cookies utilises
            sont :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>
              <strong>Cookies essentiels :</strong> necessaires au fonctionnement
              du site (authentification, session)
            </li>
            <li>
              <strong>Cookies analytiques :</strong> mesure d'audience et
              statistiques de navigation (avec consentement)
            </li>
          </ul>
          <p className="text-gray-700 mt-3 leading-relaxed">
            Vous pouvez configurer votre navigateur pour refuser les cookies ou
            etre averti lorsqu'un cookie est depose. Le refus des cookies
            essentiels peut alterer le fonctionnement du site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            9. Delegue a la Protection des Donnees (DPO)
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Pour toute question relative a la protection de vos donnees
            personnelles, vous pouvez contacter notre DPO :
          </p>
          <ul className="mt-3 space-y-1 text-gray-700">
            <li><strong>Nom :</strong> [NOM DU DPO]</li>
            <li>
              <strong>E-mail :</strong>{" "}
              <a
                href={`mailto:${siteConfig.emails.contact}`}
                className="text-blue-600 hover:underline"
              >
                {siteConfig.emails.contact}
              </a>
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PolitiqueConfidentialite;
