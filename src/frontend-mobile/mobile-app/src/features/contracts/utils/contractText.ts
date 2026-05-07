type ContractDetailsInput = {
  modo?: 'presencial' | 'digital';
  data?: string;
  hora?: string;
  endereco?: string;
  observacoes?: string;
};

export function buildContractDetails(p: ContractDetailsInput): string {
  const lines: string[] = [];
  lines.push(`Tipo de serviço: ${p.modo === 'digital' ? 'Digital' : 'Presencial'}`);
  if (p.data && p.hora) lines.push(`Agendamento: ${p.data} às ${p.hora}`);
  if (p.modo === 'presencial' && p.endereco) lines.push(`Endereço: ${p.endereco}`);
  if (p.observacoes && p.observacoes.trim().length > 0) {
    lines.push('');
    lines.push('Observações do cliente:');
    lines.push(p.observacoes);
  }
  return lines.join('\n');
}

type CancellationTicketInput = {
  contractId: number;
  motivo: string;
  detalhes?: string;
};

export function buildCancellationTicketDescription(p: CancellationTicketInput): string {
  const detalhes = (p.detalhes ?? '').trim();
  return [
    `Contrato #${p.contractId}`,
    `Motivo: ${p.motivo}`,
    detalhes ? `Detalhes: ${detalhes}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}
