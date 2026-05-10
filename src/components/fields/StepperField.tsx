interface StepperFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function StepperField({ label, value, onChange, min = 1, max = 99 }: StepperFieldProps) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-2xl md:text-3xl font-semibold text-gray-900 text-center leading-tight">
        {label}
      </p>
      <div className="flex items-center gap-6">
        <button
          onClick={decrement}
          disabled={value <= min}
          className="w-14 h-14 rounded-full border-2 border-gray-200 text-2xl font-light text-gray-600 flex items-center justify-center hover:border-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          −
        </button>
        <span className="text-6xl font-bold text-gray-900 w-20 text-center tabular-nums">
          {value}
        </span>
        <button
          onClick={increment}
          disabled={value >= max}
          className="w-14 h-14 rounded-full border-2 border-gray-200 text-2xl font-light text-gray-600 flex items-center justify-center hover:border-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          +
        </button>
      </div>
    </div>
  );
}
