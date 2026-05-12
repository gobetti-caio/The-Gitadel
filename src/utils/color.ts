export function withAlpha(color: string | undefined | null, alpha: number): string {
  if (!color) return `rgba(0, 0, 0, ${alpha})`;

  const value = color.trim();
  const clampedAlpha = Math.max(0, Math.min(1, alpha));

  const rgbMatch = value.match(
    /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/i,
  );

  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);

    if ([r, g, b].some((n) => Number.isNaN(n))) return value;

    const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
    return `rgba(${clamp255(r)}, ${clamp255(g)}, ${clamp255(b)}, ${clampedAlpha})`;
  }

  if (!value.startsWith('#')) return value;

  const hex = value.slice(1);

  const expand = (s: string) =>
    s
      .split('')
      .map((ch) => ch + ch)
      .join('');

  let rHex = '';
  let gHex = '';
  let bHex = '';

  if (hex.length === 3 || hex.length === 4) {
    const full = expand(hex.slice(0, 3));
    rHex = full.slice(0, 2);
    gHex = full.slice(2, 4);
    bHex = full.slice(4, 6);
  } else if (hex.length === 6 || hex.length === 8) {
    rHex = hex.slice(0, 2);
    gHex = hex.slice(2, 4);
    bHex = hex.slice(4, 6);
  } else {
    return value;
  }

  const r = Number.parseInt(rHex, 16);
  const g = Number.parseInt(gHex, 16);
  const b = Number.parseInt(bHex, 16);

  if ([r, g, b].some((n) => Number.isNaN(n))) return value;

  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}
