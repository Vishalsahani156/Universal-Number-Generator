"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { useGenerateStore } from "@/stores/generate-store";
import { MAX_QUANTITY, MIN_QUANTITY } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

export function QuantityInput() {
  const { quantity, setQuantity } = useGenerateStore();
  const [error, setError] = useState<string>();

  function handleChange(value: string) {
    const num = parseInt(value.replace(/,/g, ""), 10);
    if (isNaN(num)) {
      setError("Enter a valid number");
      return;
    }
    if (num < MIN_QUANTITY) {
      setError(`Minimum is ${formatNumber(MIN_QUANTITY)}`);
      setQuantity(num);
      return;
    }
    if (num > MAX_QUANTITY) {
      setError(`Maximum is ${formatNumber(MAX_QUANTITY)}`);
      setQuantity(num);
      return;
    }
    setError(undefined);
    setQuantity(num);
  }

  return (
    <Input
      label="Quantity"
      type="text"
      inputMode="numeric"
      value={formatNumber(quantity)}
      onChange={(e) => handleChange(e.target.value)}
      error={error}
      hint={`Range: ${formatNumber(MIN_QUANTITY)} – ${formatNumber(MAX_QUANTITY)}`}
    />
  );
}
