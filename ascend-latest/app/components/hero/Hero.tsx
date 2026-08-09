import Compass from "@/app/components/compass/";

import HeroBackground from "./HeroBackground";
import HeroJourneyActions from "./HeroJourneyActions";
import ScrollIndicator from "./ScrollIndicator";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#05070B]">
      <HeroBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col-reverse items-center justify-center gap-14 px-6 pt-20 lg:flex-row lg:px-10">
        {/* LEFT */}

        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl font-black leading-[0.98] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your life
            <br />
            doesn&apos;t come
            <br />
            with a{" "}
            <span className="text-blue-500">
              map.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            ASCEND helps you understand who you are,
            define your North Star, take strategic
            action, discover relevant opportunities
            and build evidence of meaningful growth.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-500 lg:justify-start">
            <span>Direction</span>
            <span className="text-blue-500">•</span>
            <span>Atlas Intelligence</span>
            <span className="text-blue-500">•</span>
            <span>Real Opportunities</span>
            <span className="text-blue-500">•</span>
            <span>Measurable Growth</span>
          </div>

          <HeroJourneyActions />

          <div className="mt-9">
            <ScrollIndicator />
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex flex-1 items-center justify-center">
          <Compass
            size={410}
          />
        </div>
      </div>
    </section>
  );
}
