export default function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4">
      {Array.from({ length: totalSteps }).map((_, idx) => {
        const isActive = idx === currentStep;
        const isDone = idx < currentStep;
        return (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-500 ${
              isActive
                ? 'w-8 bg-[#2563eb]'
                : isDone
                  ? 'w-4 bg-[#60a5fa]'
                  : 'w-4 bg-slate-200'
            }`}
          ></div>
        );
      })}
    </div>
  );
}
