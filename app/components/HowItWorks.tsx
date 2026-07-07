export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Understand Yourself",
      text: "Answer a few guided questions so ASCEND understands your goals and interests.",
    },
    {
      number: "02",
      title: "Receive Guidance",
      text: "Our platform analyzes your responses and recommends possible paths.",
    },
    {
      number: "03",
      title: "Start Growing",
      text: "Follow personalized action plans and keep improving every day.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="max-w-6xl mx-auto py-24 px-6"
    >
      <div className="text-center mb-16">
        <p className="uppercase tracking-[0.3em] text-gray-500 text-sm">
          How It Works
        </p>

        <h2 className="text-4xl font-bold mt-3">
          Three simple steps
        </h2>
      </div>

      <div className="space-y-10">
        {steps.map((step) => (
          <div
            key={step.number}
            className="flex gap-8 items-start border rounded-2xl p-8 hover:shadow-lg transition"
          >
            <div className="text-5xl font-bold text-gray-300">
              {step.number}
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-3">
                {step.title}
              </h3>

              <p className="text-gray-600 leading-7">
                {step.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}