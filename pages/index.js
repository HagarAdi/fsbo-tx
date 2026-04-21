import { useState } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import SavingsCalculator from "@/components/SavingsCalculator";
import StepCard from "@/components/StepCard";
import steps from "@/data/steps";

export default function Home() {
  const [completedIds, setCompletedIds] = useState(new Set());

  function handleToggleComplete(id) {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <>
      <Head>
        <title>FSBO Texas Guide</title>
        <meta name="description" content="Sell your Texas home without a realtor and save the commission." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <ProgressBar completed={completedIds.size} total={steps.length} />
          <SavingsCalculator homeValue={600000} commissionRate={0.03} />

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your 9-Step FSBO Checklist
            </h2>
            <div className="space-y-3">
              {steps.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  completed={completedIds.has(step.id)}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
