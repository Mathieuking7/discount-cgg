import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { siteConfig } from "@/config/site.config";

const CGV = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-serif font-bold text-[#1B2A4A] mb-4">
          Conditions Generales de Vente
        </h1>
        <p className="text-sm text-gray-500 mb-10">
          Derniere mise a jour : [DATE]
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            Article 1 — Objet
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Les presentes Conditions Generales de Vente (CGV) regissent les
            relations contractuelles entre {siteConfig.legalName}, editeur du
            site {siteConfig.baseUrl}, et toute personne physique ou morale
            (ci-apres « le Client ») souhaitant recourir aux services de
            demarches d'immatriculation en ligne proposes sur le site.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            Article 2 — Services proposes
          </h2>
          <p className="text-gray-700 mb-3">
            {siteConfig.siteName} propose les services suivants :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Demande de carte grise (certificat d'immatriculation)</li>
            <li>Changement de titulaire (achat de vehicule)</li>
            <li>Declaration de cession (vente de vehicule)</li>
            <li>Changement d'adresse sur carte grise</li>
            <li>Demande de duplicata de carte grise</li>
            <li>Immatriculation de vehicule importe</li>
            <li>Passage en collection</li>
            <li>Declaration de perte ou vol</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            Article 3 — Tarifs
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Les prix affiches sur le site sont exprimes en euros TTC. Ils
            comprennent :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 mb-3">
            <li>
              <strong>Frais de service {siteConfig.siteName} :</strong> remuneration
              pour le traitement administratif de la demarche
            </li>
            <li>
              <strong>Taxes gouvernementales :</strong> taxe regionale, taxe de
              gestion, redevance d'acheminement (reversees integralement a
              l'Etat)
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Le detail du calcul est presente au Client avant la validation de sa
            commande. {siteConfig.legalName} se reserve le droit de modifier ses
            tarifs a tout moment. Les tarifs applicables sont ceux en vigueur au
            moment de la validation de la commande.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            Article 4 — Commande et paiement
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Le Client passe commande en ligne en suivant les etapes suivantes :
          </p>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 mb-3">
            <li>Selection du type de demarche</li>
            <li>Saisie des informations du vehicule et du titulaire</li>
            <li>Telechargement des documents justificatifs</li>
            <li>Verification du recapitulatif et du montant total</li>
            <li>Paiement securise par carte bancaire</li>
          </ol>
          <p className="text-gray-700 leading-relaxed">
            Le paiement est exigible a la commande. La commande est consideree
            comme validee apres confirmation du paiement. Un e-mail de
            confirmation est envoye au Client.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            Article 5 — Delais de traitement
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Les demarches sont traitees dans un delai indicatif de 24 a 48 heures
            ouvrees apres reception du dossier complet. Ce delai peut varier en
            fonction de la complexite de la demarche et des delais de reponse de
            l'administration (ANTS / Prefecture). {siteConfig.legalName} ne peut
            etre tenue responsable des retards imputables aux services de l'Etat.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            Article 6 — Documents requis
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Le Client s'engage a fournir des documents conformes, lisibles et en
            cours de validite. Les documents couramment demandes incluent :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Piece d'identite en cours de validite</li>
            <li>Justificatif de domicile de moins de 6 mois</li>
            <li>Certificat d'immatriculation (carte grise) du vehicule</li>
            <li>Certificat de cession (Cerfa n°15776)</li>
            <li>Controle technique en cours de validite (le cas echeant)</li>
            <li>Mandat d'immatriculation signe</li>
          </ul>
          <p className="text-gray-700 mt-3 leading-relaxed">
            En cas de dossier incomplet, le Client sera contacte pour fournir les
            pieces manquantes. Le delai de traitement est suspendu jusqu'a
            reception du dossier complet.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            Article 7 — Droit de retractation
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Conformement aux articles L.221-18 et suivants du Code de la
            consommation, le Client dispose d'un delai de 14 jours a compter de
            la validation de la commande pour exercer son droit de retractation,
            sans avoir a justifier de motifs ni a payer de penalites.
          </p>
          <p className="text-gray-700 leading-relaxed mb-3">
            <strong>Exception :</strong> conformement a l'article L.221-28 du
            Code de la consommation, le droit de retractation ne peut etre exerce
            lorsque le service a ete pleinement execute avant la fin du delai de
            retractation et que l'execution a commence avec l'accord prealable et
            expres du Client.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Pour exercer ce droit, le Client peut adresser sa demande a :{" "}
            <a
              href={`mailto:${siteConfig.emails.contact}`}
              className="text-blue-600 hover:underline"
            >
              {siteConfig.emails.contact}
            </a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            Article 8 — Responsabilite
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            {siteConfig.legalName} s'engage a traiter les demarches avec
            diligence et professionnalisme. Toutefois, sa responsabilite ne
            saurait etre engagee en cas de :
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>
              Fourniture d'informations erronees ou de documents non conformes
              par le Client
            </li>
            <li>Refus de la demarche par l'administration competente</li>
            <li>
              Retard de traitement imputable aux services de l'Etat
            </li>
            <li>Force majeure au sens de l'article 1218 du Code civil</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            Article 9 — Reclamations
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Toute reclamation peut etre adressee par e-mail a{" "}
            <a
              href={`mailto:${siteConfig.emails.support}`}
              className="text-blue-600 hover:underline"
            >
              {siteConfig.emails.support}
            </a>{" "}
            ou par courrier a l'adresse du siege social.
          </p>
          <p className="text-gray-700 leading-relaxed">
            En cas de litige non resolu a l'amiable, le Client peut recourir
            gratuitement au service de mediation de la consommation. Le mediateur
            competent est : [NOM ET COORDONNEES DU MEDIATEUR].
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-[#1B2A4A] mb-4">
            Article 10 — Droit applicable
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Les presentes CGV sont soumises au droit francais. En cas de litige,
            et apres tentative de resolution amiable, competence est attribuee
            aux tribunaux competents du ressort du siege social de{" "}
            {siteConfig.legalName}.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CGV;
