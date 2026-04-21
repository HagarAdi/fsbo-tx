import { useState } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import SavingsCalculator from "@/components/SavingsCalculator";
import StepCard from "@/components/StepCard";
import StepPanel from "@/components/StepPanel";
import steps from "@/data/steps";

export default function Home() {
  const [completedIds, setCompletedIds] = useState(new Set());
  const [selectedStep, setSelectedStep] = useState(null);

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

  function handleSelectStep(step) {
    setSelectedStep((prev) => (prev?.id === step.id ? null : step));
  }

  return (
    <>
      <Head>
        <title>FSBO Texas Guide</title>
        <meta name="description" content="Sell your Texas home without a realtor and save the commission." />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        <div className="flex flex-1 overflow-hidden">
          {/* Left: checklist */}
          <main className="flex-1 min-w-0 overflow-y-auto px-4 py-8">
            <div className="max-w-3xl mx-auto space-y-6">
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
                      selected={selectedStep?.id === step.id}
                      onToggleComplete={handleToggleComplete}
                      onSelect={handleSelectStep}
                    />
                  ))}
                </div>
              </div>
            </div>
          </main>

          {/* Right: slide-in panel */}
          <div
            style={{
              width: selectedStep ? "480px" : "0",
              transition: "width 300ms ease-in-out",
              overflow: "hidden",
              flexShrink: 0,
            }}
            className={selectedStep ? "border-l border-gray-200 bg-white shadow-xl" : ""}
          >
            <div style={{ width: "480px", height: "100%" }}>
              <StepPanel
                step={selectedStep}
                completed={selectedStep ? completedIds.has(selectedStep.id) : false}
                onClose={() => setSelectedStep(null)}
                onToggleComplete={handleToggleComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
