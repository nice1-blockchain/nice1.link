// src/data/storeMetadata.ts
export interface GameMetadata {
  shortDescription: string;
  longDescription: string; // Soporta Markdown
  previews: string[];      // Array de 4 URLs de imagen
  videoUrl?: string;       // URL de YouTube o MP4
}

// Clave: nombre del producto (columna 'product' en la tabla)
export const STORE_DB: Record<string, GameMetadata> = {
  "Mi Juego Pro": {
    shortDescription: "Un RPG épico de fantasía.",
    longDescription: "### Sobre el juego\nExplora un mundo vasto...",
    previews: ["url1", "url2", "url3", "url4"],
    videoUrl: "https://youtube.com/..."
  }
};