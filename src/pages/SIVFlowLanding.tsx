import SIVFlowHero from "@/components/sivflow/SIVFlowHero";
import SIVFlowProblemSolution from "@/components/sivflow/SIVFlowProblemSolution";
import SIVFlowFeatures from "@/components/sivflow/SIVFlowFeatures";
import SIVFlowPricing from "@/components/sivflow/SIVFlowPricing";
import SIVFlowTestimonials from "@/components/sivflow/SIVFlowTestimonials";
import SIVFlowFAQ from "@/components/sivflow/SIVFlowFAQ";
import SIVFlowCTA from "@/components/sivflow/SIVFlowCTA";
import SIVFlowFooter from "@/components/sivflow/SIVFlowFooter";
import SIVFlowNavbar from "@/components/sivflow/SIVFlowNavbar";

const SIVFlowLanding = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <SIVFlowNavbar />
      <SIVFlowHero />
      <SIVFlowProblemSolution />
      <SIVFlowFeatures />
      <SIVFlowPricing />
      <SIVFlowTestimonials />
      <SIVFlowFAQ />
      <SIVFlowCTA />
      <SIVFlowFooter />
    </div>
  );
};

export default SIVFlowLanding;
