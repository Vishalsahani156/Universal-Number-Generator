import { create } from "zustand";
import type { ExportFormat, GenerationMode } from "@/types/api";

interface GenerateState {
  countryCode: string | null;
  quantity: number;
  mode: GenerationMode;
  columnName: string;
  includeCountryCode: boolean;
  includeSerial: boolean;
  format: ExportFormat;
  setCountryCode: (code: string) => void;
  setQuantity: (quantity: number) => void;
  setMode: (mode: GenerationMode) => void;
  setColumnName: (name: string) => void;
  setIncludeCountryCode: (value: boolean) => void;
  setIncludeSerial: (value: boolean) => void;
  setFormat: (format: ExportFormat) => void;
  applyCountryDefaults: (defaults: {
    column_name: string;
    include_country_code: boolean;
    include_serial: boolean;
  }) => void;
  reset: () => void;
}

const initialState = {
  countryCode: null as string | null,
  quantity: 1,
  mode: "random" as GenerationMode,
  columnName: "mobile_number",
  includeCountryCode: false,
  includeSerial: true,
  format: "csv" as ExportFormat,
};

export const useGenerateStore = create<GenerateState>((set) => ({
  ...initialState,
  setCountryCode: (code) => set({ countryCode: code }),
  setQuantity: (quantity) => set({ quantity }),
  setMode: (mode) => set({ mode }),
  setColumnName: (name) => set({ columnName: name }),
  setIncludeCountryCode: (value) => set({ includeCountryCode: value }),
  setIncludeSerial: (value) => set({ includeSerial: value }),
  setFormat: (format) => set({ format }),
  applyCountryDefaults: (defaults) =>
    set({
      columnName: defaults.column_name,
      includeCountryCode: defaults.include_country_code,
      includeSerial: defaults.include_serial,
    }),
  reset: () => set(initialState),
}));
