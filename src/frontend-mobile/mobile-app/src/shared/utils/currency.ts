export function formatBrlMaskFromDigits(digits: string): string {
  const cleaned = (digits || '').replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  const padded = cleaned.padStart(3, '0');
  const cents = padded.slice(-2);
  const intPart = padded.slice(0, -2).replace(/^0+(?=\d)/, '');
  const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${intWithDots},${cents}`;
}

export function maskBrlInput(rawInput: string): string {
  const onlyDigits = (rawInput || '').replace(/\D/g, '');
  return formatBrlMaskFromDigits(onlyDigits);
}

export function brlMaskToNumber(masked: string): number {
  if (!masked) return 0;
  const onlyDigits = masked.replace(/\D/g, '');
  if (!onlyDigits) return 0;
  return Number(onlyDigits) / 100;
}

export function numberToBrlMask(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '';
  const cents = Math.round(value * 100);
  return formatBrlMaskFromDigits(String(cents));
}

export function formatBrlDisplay(value: number): string {
  return `R$ ${(Number(value) || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
