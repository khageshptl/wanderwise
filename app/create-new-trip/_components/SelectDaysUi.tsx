"use client";
import React from "react";

type SelectDaysUiProps = {
  initial?: number;
  onConfirm?: (value: string) => void;
};

export default function SelectDaysUi({ initial = 1, onConfirm }: SelectDaysUiProps) {
  const [count, setCount] = React.useState<number>(Math.max(1, initial));

  const increase = () => setCount((c) => c + 1);
  const decrease = () => setCount((c) => Math.max(1, c - 1));

  const confirm = () => onConfirm?.(String(count));

  return (
    <div className='flex flex-col items-center justify-center mt-6 p-6 glass-container rounded-2xl mb-2'>
      <h3 className="text-lg font-semibold mb-4">
        How many days do you want to travel?
      </h3>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <button
            aria-label="decrease days"
            onClick={decrease}
            disabled={count === 1}
            className={
              "w-12 h-12 rounded-full glass-chip flex items-center justify-center text-2xl transition " +
              (count === 1 ? "opacity-40 cursor-not-allowed" : "")
            }
          >
            ➖
          </button>

          <div className="text-center">
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm text-muted-foreground">{count === 1 ? "Day" : "Days"}</div>
          </div>

          <button
            aria-label="increase days"
            onClick={increase}
            className="w-12 h-12 rounded-full glass-chip flex items-center justify-center text-2xl transition"
          >
            ➕
          </button>
        </div>

        <button
          onClick={confirm}
          className="mt-2 glass-button text-primary-foreground px-6 py-2 rounded-full transition-shadow shadow-sm"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
