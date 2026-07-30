import type {
  Metadata,
} from "next";

import Link from "next/link";

import PublicPageShell from "@/app/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Terms of Service",

  description:
    "Review the terms governing access to and use of the ASCEND platform.",

  alternates: {
    canonical:
      "https://ascendai.space/terms",
  },
};

const sections = [
  {
    title: "1. Acceptance of These Terms",
    paragraphs: [
      "By accessing or using ASCEND, you agree to these Terms of Service and the ASCEND Privacy Policy. If you do not agree, do not use the platform.",
      "If you use ASCEND on behalf of an organization, you confirm that you have authority to accept these terms for that organization.",
    ],
  },
  {
    title: "2. What ASCEND Provides",
    paragraphs: [
      "ASCEND is an Operating System for Human Potential. It provides purpose discovery, North Star direction, strategic missions, opportunity discovery, progress tracking, Atlas intelligence and product support.",
      "ASCEND is designed to support reflection, judgment and meaningful action. It does not guarantee a particular career, financial, academic, personal or professional outcome.",
    ],
  },
  {
    title: "3. Account Responsibilities",
    paragraphs: [
      "You are responsible for providing accurate account information, protecting your authentication credentials and all activity performed through your account.",
      "Notify ASCEND Support if you believe your account has been accessed without authorization.",
      "You may not share authentication codes, attempt to access another person's account or bypass platform security.",
    ],
  },
  {
    title: "4. Artificial Intelligence",
    paragraphs: [
      "Atlas and Support AI generate responses using artificial intelligence. AI output may be incomplete, inaccurate, outdated or unsuitable for your circumstances.",
      "You remain responsible for reviewing information and making your own decisions. ASCEND does not replace qualified legal, medical, financial, mental-health, academic or other professional advice.",
      "Atlas guides the user but does not control the user. Support AI addresses product issues and should not influence personal strategy.",
    ],
  },
  {
    title: "5. Missions, Opportunities and External Information",
    paragraphs: [
      "ASCEND may recommend missions or display third-party jobs, internships, scholarships, grants, fellowships, courses, competitions and other opportunities.",
      "Opportunity information may change, expire or contain errors. Verify deadlines, eligibility, costs, requirements and legitimacy directly with the original provider before applying or making commitments.",
      "ASCEND does not guarantee selection, acceptance, employment, funding, admission or any other outcome from an external opportunity.",
    ],
  },
  {
    title: "6. Acceptable Use",
    paragraphs: [
      "You may not use ASCEND to violate the law, harm another person, distribute malicious software, interfere with platform operation, scrape the service improperly or attempt unauthorized access.",
      "You may not use ASCEND to impersonate another person, submit deceptive information, exploit support systems or generate content intended to facilitate abuse.",
      "We may restrict activity that creates security, legal, operational or user-safety risks.",
    ],
  },
  {
    title: "7. Your Content",
    paragraphs: [
      "You retain ownership of the original information and content you submit to ASCEND.",
      "You grant ASCEND permission to process that content only as reasonably necessary to operate, personalize, secure and improve the service.",
      "You are responsible for ensuring that content you submit does not violate another person's rights or applicable law.",
    ],
  },
  {
    title: "8. ASCEND Intellectual Property",
    paragraphs: [
      "ASCEND's name, logo, visual identity, software, interfaces, written materials, systems and original content are protected by applicable intellectual-property laws.",
      "These terms do not transfer ownership of ASCEND intellectual property to users.",
      "You may not copy, sell, reverse engineer, reproduce or distribute protected ASCEND materials except where permitted by law or written authorization.",
    ],
  },
  {
    title: "9. Third-Party Services",
    paragraphs: [
      "ASCEND relies on third-party services for authentication, hosting, databases, AI processing, notifications and external opportunity links.",
      "Those services may be governed by their own terms and privacy policies. ASCEND is not responsible for third-party websites, services or decisions outside its control.",
    ],
  },
  {
    title: "10. Availability and Changes",
    paragraphs: [
      "We may add, modify, suspend or discontinue features as ASCEND evolves.",
      "We aim to provide a reliable service but cannot guarantee uninterrupted availability, permanent storage, error-free operation or compatibility with every device.",
    ],
  },
  {
    title: "11. Suspension and Termination",
    paragraphs: [
      "We may suspend or terminate access when reasonably necessary to protect users, enforce these terms, comply with law or address security and abuse.",
      "Users may stop using ASCEND at any time and may request account or personal-data deletion through ASCEND Support, subject to applicable retention requirements.",
    ],
  },
  {
    title: "12. Disclaimers",
    paragraphs: [
      "ASCEND is provided on an as-available basis. To the extent permitted by applicable law, we disclaim warranties that are not expressly stated in these terms.",
      "No information generated by ASCEND should be treated as a guarantee of accuracy, suitability, availability or outcome.",
    ],
  },
  {
    title: "13. Limitation of Responsibility",
    paragraphs: [
      "To the extent permitted by applicable law, ASCEND is not responsible for indirect, incidental or consequential loss resulting from reliance on AI output, third-party opportunities, external websites or unauthorized account activity outside ASCEND's reasonable control.",
      "Nothing in these terms excludes rights or responsibilities that cannot legally be excluded.",
    ],
  },
  {
    title: "14. Changes to These Terms",
    paragraphs: [
      "We may update these terms as ASCEND develops. Material changes will be reflected by updating the effective date and, where appropriate, providing additional notice.",
      "Continued use after updated terms become effective means you accept the revised terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <PublicPageShell
      eyebrow="Terms of Service"
      title="Clear expectations for using ASCEND."
      description="These terms explain the responsibilities, limitations and principles governing access to the ASCEND platform."
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6">
          <p className="text-sm font-semibold text-cyan-300">
            Effective date: July 30, 2026
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            These terms are written to reflect
            ASCEND’s current early-stage platform
            and may evolve as the service expands.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {sections.map(
            (section) => (
              <section
                key={section.title}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9"
              >
                <h2 className="text-2xl font-bold text-white">
                  {section.title}
                </h2>

                <div className="mt-5 space-y-4">
                  {section.paragraphs.map(
                    (paragraph) => (
                      <p
                        key={paragraph}
                        className="leading-8 text-slate-400"
                      >
                        {paragraph}
                      </p>
                    )
                  )}
                </div>
              </section>
            )
          )}
        </div>

        <section className="mt-10 rounded-3xl border border-blue-400/20 bg-blue-400/[0.05] p-7 sm:p-9">
          <h2 className="text-2xl font-bold text-white">
            Questions about these terms?
          </h2>

          <p className="mt-4 leading-8 text-slate-400">
            Contact ASCEND through the Support
            system.
          </p>

          <Link
            href="/support"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Contact ASCEND Support
          </Link>
        </section>
      </div>
    </PublicPageShell>
  );
}