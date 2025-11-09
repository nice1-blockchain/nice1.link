// utils/asString.ts
export const asString = (v: any): string => {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "bigint") return String(v);

  // Muchos tipos Antelope/Greymass exponen toString() válido
  if (typeof v.toString === "function") {
    const s = v.toString();
    if (s && s !== "[object Object]") return s;
  }

  // Estructuras encadenadas .value.value...
  if (typeof v === "object" && "value" in v) {
    // @ts-ignore - navegación recursiva
    return asString(v.value);
  }

  return "";
};
