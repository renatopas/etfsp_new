const PARTICLES = new Set(["da", "das", "de", "do", "dos", "e"]);

/**
 * Iniciais de um nome para avatares sem foto: primeira letra do primeiro e do
 * último nome, ignorando partículas como “da” e “dos” e palavras sem letras.
 * Ex.: “Maria da Silva” → “MS”.
 */
export function initials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(
      (word) =>
        /\p{L}/u.test(word) && !PARTICLES.has(word.toLocaleLowerCase("pt-BR")),
    );
  if (words.length === 0) return "";
  const first = words[0];
  const last = words.length > 1 ? words[words.length - 1] : "";
  return (
    Array.from(first)[0] + (last ? Array.from(last)[0] : "")
  ).toLocaleUpperCase("pt-BR");
}
