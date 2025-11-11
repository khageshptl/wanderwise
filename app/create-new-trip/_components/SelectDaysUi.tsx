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
    <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-md text-center">
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
              "w-12 h-12 rounded-full border flex items-center justify-center text-2xl transition " +
              (count === 1 ? "opacity-40 cursor-not-allowed" : "hover:scale-105 hover:shadow-lg")
            }
          >
            ➖
          </button>

          <div className="text-center">
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-sm text-gray-500">{count === 1 ? "Day" : "Days"}</div>
          </div>

          <button
            aria-label="increase days"
            onClick={increase}
            className="w-12 h-12 rounded-full border flex items-center justify-center text-2xl hover:shadow-lg hover:scale-105 transition"
          >
            ➕
          </button>
        </div>

        <button
          onClick={confirm}
          className="mt-2 bg-primary hover:shadow-lg hover:scale-105 text-white px-6 py-2 rounded-full transition-shadow shadow-sm"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
