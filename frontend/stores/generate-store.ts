import { create } from "zustand";
import type { ExportColumn, ExportFormat, ExtraField, GenerationMode } from "@/types/api";

interface GenerateState {
  countryCode: string | null;
  quantity: number;
  mode: GenerationMode;
  columns: ExportColumn[];
  extraFields: ExtraField[];
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
  addExtraField: () => void;
  removeExtraField: (index: number) => void;
  updateExtraField: (index: number, field: string, value: string | boolean) => void;
  toggleExtraFieldGenerateDifferent: (index: number) => void;
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
  extraFields: [] as ExtraField[],
  includeCountryCode: false,
  includeSerial: true,
  format: "csv" as ExportFormat,
};

function labelToKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    || `field_${Date.now()}`;
}

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
  addExtraField: () =>
    set((state) => ({
      extraFields: [...state.extraFields, { key: "", label: "", value: "", generate_different: false }],
    })),
  removeExtraField: (index) =>
    set((state) => ({
      extraFields: state.extraFields.filter((_, i) => i !== index),
    })),
  updateExtraField: (index, field, value) =>
    set((state) => ({
      extraFields: state.extraFields.map((ef, i) => {
        if (i !== index) return ef;
        const updated = { ...ef, [field]: value };
        if (field === "label") {
          updated.key = labelToKey(value as string);
        }
        return updated;
      }),
    })),
  toggleExtraFieldGenerateDifferent: (index) =>
    set((state) => ({
      extraFields: state.extraFields.map((ef, i) =>
        i === index ? { ...ef, generate_different: !ef.generate_different } : ef,
      ),
    })),
  setIncludeCountryCode: (value) => set({ includeCountryCode: value }),
  setIncludeSerial: (value) => set({ includeSerial: value }),
  setFormat: (format) => set({ format }),
  applyCountryDefaults: (defaults) =>
    set({
      columns: [{ header: defaults.column_name, static_value: "" }],
      extraFields: [],
      includeCountryCode: defaults.include_country_code,
      includeSerial: defaults.include_serial,
    }),
  reset: () => set(initialState),
}));
