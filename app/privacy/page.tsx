import type {
  Metadata,
} from "next";

import Link from "next/link";

import PublicPageShell from "@/app/components/PublicPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",

  description:
    "Learn how ASCEND collects, uses, protects and manages personal information.",

  alternates: {
    canonical:
      "https://ascendai.space/privacy",
  },
};

const sections = [
  {
    title: "1. Information We Collect",
    paragraphs: [
      "We may collect account information such as your name, email address, user identifier and authentication details when you create or access an ASCEND account.",
      "We collect information you voluntarily provide through onboarding, Compass answers, North Star statements, goals, challenges, reflections, Atlas conversations, missions, opportunity activity and support requests.",
      "We may collect technical information such as device type, browser, approximate location derived from network information, application activity, error information and pages used.",
    ],
  },
  {
    title: "2. How We Use Information",
    paragraphs: [
      "We use information to authenticate users, provide ASCEND features, personalize strategic guidance, generate relevant missions, recommend opportunities, track progress and maintain long-term journey context.",
      "We also use information to provide support, investigate technical problems, prevent abuse, protect the platform, understand product performance and improve ASCEND.",
      "Support AI operates separately from Atlas strategy and does not intentionally modify your North Star, missions, XP, identity or strategic memory.",
    ],
  },
  {
    title: "3. Artificial Intelligence",
    paragraphs: [
      "ASCEND uses artificial intelligence to provide Atlas conversations, mission generation, opportunity intelligence and Support AI responses.",
      "Information submitted to AI features may be processed by ASCEND's configured AI service providers to generate requested responses.",
      "AI-generated information may be incomplete or incorrect. ASCEND is designed to support your judgment, not replace professional advice or make important decisions on your behalf.",
    ],
  },
  {
    title: "4. Service Providers",
    paragraphs: [
      "ASCEND relies on service providers that help operate the platform. These currently include Clerk for authentication, Supabase for database services, Groq for AI processing, Vercel for hosting and Resend for support notification emails.",
      "These providers may process information only as necessary to deliver their respective services and are governed by their own contractual and privacy obligations.",
      "ASCEND does not sell your personal information.",
    ],
  },
  {
    title: "5. Cookies and Essential Technologies",
    paragraphs: [
      "ASCEND and its service providers may use cookies, local storage and similar technologies required for authentication, security, session continuity, launch preferences and application functionality.",
      "Additional analytics technologies may be introduced to understand platform performance and improve the user experience. This policy will be updated when material practices change.",
    ],
  },
  {
    title: "6. Data Retention",
    paragraphs: [
      "We retain information for as long as reasonably necessary to provide ASCEND, maintain account history, support the user's journey, resolve disputes, protect the platform and meet applicable obligations.",
      "Retention periods may differ depending on the type of information, its purpose and whether the user has requested deletion.",
    ],
  },
  {
    title: "7. Security",
    paragraphs: [
      "ASCEND uses reasonable technical and organizational safeguards intended to protect information from unauthorized access, alteration, disclosure or destruction.",
      "No internet service can guarantee absolute security. Users should protect their authentication credentials and never submit passwords, one-time codes, private API keys or complete payment information through Atlas or Support AI.",
    ],
  },
  {
    title: "8. International Processing",
    paragraphs: [
      "ASCEND and its service providers may process information in countries other than the country where you live. Those countries may apply different data-protection rules.",
      "Where required, appropriate legal and contractual mechanisms may be used for international processing.",
    ],
  },
  {
    title: "9. Your Choices and Rights",
    paragraphs: [
      "Depending on your location and applicable law, you may have rights to request access, correction, deletion, restriction, objection or portability of personal information.",
      "You may also be entitled to withdraw consent where processing relies on consent or complain to an appropriate data-protection authority.",
      "Requests can be submitted through ASCEND Support. We may need to verify your identity before completing a request.",
    ],
  },
  {
    title: "10. Children",
    paragraphs: [
      "ASCEND is not designed for children who are unable to provide valid consent under applicable law. We do not knowingly seek to collect personal information from children without appropriate authorization.",
      "If you believe a child has provided personal information improperly, contact ASCEND Support.",
    ],
  },
  {
    title: "11. Third-Party Opportunities",
    paragraphs: [
      "ASCEND may link to jobs, scholarships, grants, courses, fellowships and other opportunities operated by third parties.",
      "ASCEND does not control those external websites or their privacy practices. Review the relevant third party's policies before providing information or submitting an application.",
    ],
  },
  {
    title: "12. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy as ASCEND evolves. Material changes will be reflected by updating the effective date and, where appropriate, providing additional notice.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PublicPageShell
      eyebrow="Privacy Policy"
      title="Your journey deserves responsible data practices."
      description="This policy explains what information ASCEND collects, why it is used and the choices available to users."
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.05] p-6">
          <p className="text-sm font-semibold text-cyan-300">
            Effective date: July 30, 2026
          </p>

          <p className="mt-3 text-sm leading-7 text-slate-400">
            ASCEND is continuing to evolve.
            This policy should be reviewed
            periodically as features, providers
            and legal requirements change.
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
            Contact ASCEND
          </h2>

          <p className="mt-4 leading-8 text-slate-400">
            For privacy questions, requests or
            concerns, contact us through ASCEND
            Support.
          </p>

          <Link
            href="/support"
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Open ASCEND Support
          </Link>
        </section>
      </div>
    </PublicPageShell>
  );
}