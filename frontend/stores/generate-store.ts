import { create } from "zustand";
import type { ExportFormat, GenerationMode } from "@/types/api";
import { MIN_QUANTITY } from "@/lib/constants";

interface GenerateState {
  countryCode: string;
  quantity: number;
  generationMode: GenerationMode;
  columnName: string;
  includeCountryCode: boolean;
  includeSerial: boolean;
  exportFormat: ExportFormat;
  setCountryCode: (code: string) => void;
  setQuantity: (quantity: number) => void;
  setGenerationMode: (mode: GenerationMode) => void;
  setColumnName: (name: string) => void;
  setIncludeCountryCode: (value: boolean) => void;
  setIncludeSerial: (value: boolean) => void;
  setExportFormat: (format: ExportFormat) => void;
  reset: () => void;
}

const initialState = {
  countryCode: "IN",
  quantity: MIN_QUANTITY,
  generationMode: "random" as GenerationMode,
  columnName: "mobile_number",
  includeCountryCode: false,
  includeSerial: true,
  exportFormat: "csv" as ExportFormat,
};

export const useGenerateStore = create<GenerateState>((set) => ({
  ...initialState,
  setCountryCode: (countryCode) => set({ countryCode }),
  setQuantity: (quantity) => set({ quantity }),
  setGenerationMode: (generationMode) => set({ generationMode }),
  setColumnName: (columnName) => set({ columnName }),
  setIncludeCountryCode: (includeCountryCode) => set({ includeCountryCode }),
  setIncludeSerial: (includeSerial) => set({ includeSerial }),
  setExportFormat: (exportFormat) => set({ exportFormat }),
  reset: () => set(initialState),
}));
