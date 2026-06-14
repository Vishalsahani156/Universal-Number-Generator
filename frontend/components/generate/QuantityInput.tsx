"use client";

import { useState } from "react";
import { useGenerateStore } from "@/stores/generate-store";
import { Input } from "@/components/ui/Input";
import { MAX_QUANTITY, MIN_QUANTITY } from "@/lib/constants";
import { formatCompact, formatNumber, parseQuantityInput } from "@/lib/utils";

export function QuantityInput() {
  const { quantity, setQuantity } = useGenerateStore();
  const [displayValue, setDisplayValue] = useState(formatNumber(quantity));
  const [error, setError] = useState("");

  function handleChange(value: string) {
    setDisplayValue(value);

    if (!value.trim()) {
      setError("Enter a quantity");
      return;
    }

    const num = parseQuantityInput(value);
    if (num === null) {
      setError("Enter a valid number (e.g. 100, 1 lakh, 1 cr)");
      return;
    }
    if (num < MIN_QUANTITY) {
      setError(`Minimum is ${formatNumber(MIN_QUANTITY)}`);
      setQuantity(num);
      return;
    }
    if (num > MAX_QUANTITY) {
      setError(`Maximum is ${formatCompact(MAX_QUANTITY)} (${formatNumber(MAX_QUANTITY)})`);
      setQuantity(num);
      return;
    }
    setError("");
    setQuantity(num);
    setDisplayValue(formatNumber(num));
  }

  return (
    <Input
      label="Quantity"
      type="text"
      inputMode="numeric"
      placeholder="1, 1000, 1 lakh, 1 cr..."
      value={displayValue}
      onChange={(e) => handleChange(e.target.value)}
      error={error}
      hint={`${formatNumber(MIN_QUANTITY)} to ${formatCompact(MAX_QUANTITY)} numbers for selected country`}
    />
  );
}
