import { create } from "zustand";
import type { ExportColumn, ExportFormat, GenerationMode } from "@/types/api";

interface GenerateState {
  countryCode: string | null;
  quantity: number;
  mode: GenerationMode;
  columns: ExportColumn[];
  includeCountryCode: boolean;
  includeSerial: boolean;
  format: ExportFormat;
  setCountryCode: (code: string) => void;
  setQuantity: (quantity: number) => void;
  setMode: (mode: GenerationMode) => void;
  setColumns: (columns: ExportColumn[]) => void;
  addColumn: () => void;
  removeColumn: (index: number) => void;
  updateColumn: (index: number, field: keyof ExportColumn, value: string) => void;
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
  columns: [{ header: "", static_value: "" }] as ExportColumn[],
  includeCountryCode: false,
  includeSerial: true,
  format: "csv" as ExportFormat,
};

export const useGenerateStore = create<GenerateState>((set) => ({
  ...initialState,
  setCountryCode: (code) => set({ countryCode: code }),
  setQuantity: (quantity) => set({ quantity }),
  setMode: (mode) => set({ mode }),
  setColumns: (columns) => set({ columns }),
  addColumn: () =>
    set((state) => ({
      columns: [...state.columns, { header: "", static_value: "" }],
    })),
  removeColumn: (index) =>
    set((state) => ({
      columns: state.columns.filter((_, i) => i !== index),
    })),
  updateColumn: (index, field, value) =>
    set((state) => ({
      columns: state.columns.map((col, i) =>
        i === index ? { ...col, [field]: value } : col,
      ),
    })),
  setIncludeCountryCode: (value) => set({ includeCountryCode: value }),
  setIncludeSerial: (value) => set({ includeSerial: value }),
  setFormat: (format) => set({ format }),
  applyCountryDefaults: (defaults) =>
    set({
      columns: [{ header: defaults.column_name, static_value: "" }],
      includeCountryCode: defaults.include_country_code,
      includeSerial: defaults.include_serial,
    }),
  reset: () => set(initialState),
}));
