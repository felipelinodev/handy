import { BASE_URL, getHeaders } from '@/services/apiConfig';

export interface AvailabilitySlot {
  agenda_id: number;
  prestador_id: number;
  data_disponivel: string;
  hora_inicio: string | null;
  hora_fim: string | null;
  status: string;
  contratacao_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAvailabilityPayload {
  prestador_id: number;
  data_disponivel: string;
  hora_inicio?: string;
  hora_fim?: string;
  status?: string;
}

export async function fetchProviderSchedule(
  providerId: number,
): Promise<AvailabilitySlot[]> {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/provider-availability/provider/${providerId}`,
    { method: 'GET', headers },
  );
  if (!response.ok) {
    throw new Error('Não foi possível carregar a agenda.');
  }
  return (await response.json()) as AvailabilitySlot[];
}

export async function fetchProviderFreeSlots(
  providerId: number,
): Promise<AvailabilitySlot[]> {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/provider-availability/provider/${providerId}/free`,
    { method: 'GET', headers },
  );
  if (!response.ok) {
    throw new Error('Não foi possível carregar os horários disponíveis.');
  }
  return (await response.json()) as AvailabilitySlot[];
}

export async function createAvailabilitySlots(
  slots: CreateAvailabilityPayload[],
): Promise<void> {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/provider-availability/create-many`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(slots),
    },
  );
  if (!response.ok) {
    let msg = 'Não foi possível criar as disponibilidades.';
    try {
      const data = await response.json();
      if (typeof data?.message === 'string') msg = data.message;
    } catch {}
    throw new Error(msg);
  }
}

export async function deleteAvailabilitySlot(
  slotId: number,
): Promise<void> {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/provider-availability/delete/${slotId}`,
    { method: 'DELETE', headers },
  );
  if (!response.ok) {
    let msg = 'Não foi possível remover a disponibilidade.';
    try {
      const data = await response.json();
      if (typeof data?.message === 'string') msg = data.message;
    } catch {}
    throw new Error(msg);
  }
}

export async function reserveAvailabilitySlot(
  slotId: number,
  contractId: number,
): Promise<void> {
  const headers = await getHeaders();
  const response = await fetch(
    `${BASE_URL}/provider-availability/reserve/${slotId}`,
    {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ contratacao_id: contractId }),
    },
  );
  if (!response.ok) {
    let msg = 'Não foi possível reservar o horário.';
    try {
      const data = await response.json();
      if (typeof data?.message === 'string') msg = data.message;
    } catch {}
    throw new Error(msg);
  }
}
