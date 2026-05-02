import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contratacao } from './contractService';

export interface AppNotification {
  id: string;
  contratoId: number;
  status: string;
  message: string;
  servicoNome?: string;
  prestadorNome?: string;
  read: boolean;
  createdAt: number;
}

const STATUSES_KEY = '@contract_statuses';
const NOTIFICATIONS_KEY = '@notifications';
const MAX_NOTIFICATIONS = 100;

export function statusFriendlyMessage(
  status: string,
  servicoNome?: string,
  prestadorNome?: string,
): string {
  const s = servicoNome && servicoNome.trim().length > 0 ? servicoNome : 'serviço';
  const p =
    prestadorNome && prestadorNome.trim().length > 0 ? prestadorNome : 'o prestador';

  switch (status) {
    case 'Pendente':
      return `Seu pedido de "${s}" foi enviado e aguarda a confirmação de ${p}.`;
    case 'Aceita':
      return `Boa notícia! ${p} aceitou o seu contrato de "${s}". 🎉`;
    case 'Em_Andamento':
    case 'Em Andamento':
      return `${p} começou o serviço de "${s}". Acompanhe o andamento por aqui.`;
    case 'Concluida':
    case 'Concluída':
      return `${p} concluiu o serviço de "${s}". Que tal deixar uma avaliação?`;
    case 'Cancelada':
      return `O contrato de "${s}" com ${p} foi cancelado.`;
    default:
      return `O status do contrato de "${s}" foi atualizado para "${status}".`;
  }
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function loadNotifications(): Promise<AppNotification[]> {
  return readJson<AppNotification[]>(NOTIFICATIONS_KEY, []);
}

async function saveNotifications(list: AppNotification[]): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
}

export async function getUnreadCount(): Promise<number> {
  const list = await loadNotifications();
  return list.filter((n) => !n.read).length;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const list = await loadNotifications();
  if (list.every((n) => n.read)) return;
  const updated = list.map((n) => ({ ...n, read: true }));
  await saveNotifications(updated);
}

export async function clearAllNotifications(): Promise<void> {
  await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
}

export interface ContractMeta {
  servicoNome?: string;
  prestadorNome?: string;
}

export async function syncContractNotifications(
  contratos: Contratacao[],
  metaResolver?: (c: Contratacao) => ContractMeta | undefined,
): Promise<AppNotification[]> {
  const lastStatuses = await readJson<Record<string, string>>(STATUSES_KEY, {});
  const list = await loadNotifications();

  const newOnes: AppNotification[] = [];
  const updated = { ...lastStatuses };

  for (const c of contratos) {
    const id = String(c.contratacao_id);
    const current = c.status ?? 'Pendente';
    const prev = updated[id];

    if (prev === undefined) {
      updated[id] = current;
      continue;
    }

    if (prev !== current) {
      const meta = metaResolver?.(c) ?? {};
      newOnes.push({
        id: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        contratoId: c.contratacao_id,
        status: current,
        message: statusFriendlyMessage(current, meta.servicoNome, meta.prestadorNome),
        servicoNome: meta.servicoNome,
        prestadorNome: meta.prestadorNome,
        read: false,
        createdAt: Date.now(),
      });
      updated[id] = current;
    }
  }

  if (newOnes.length > 0) {
    const merged = [...newOnes, ...list].slice(0, MAX_NOTIFICATIONS);
    await saveNotifications(merged);
  }

  await AsyncStorage.setItem(STATUSES_KEY, JSON.stringify(updated));
  return newOnes;
}
