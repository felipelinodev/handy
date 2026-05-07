import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contratacao, fetchClientContracts } from '@/features/contracts/services/contractService';
import { fetchProfessionalById } from '@/features/professionals/services/professionalService';

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

const LEGACY_STATUSES_KEY = '@contract_statuses';
const LEGACY_NOTIFICATIONS_KEY = '@notifications';
const LEGACY_PROVIDER_STATUSES_KEY = '@provider_contract_statuses';

const MAX_NOTIFICATIONS = 100;

async function getCurrentUserId(): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem('@auth_user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    const id = Number(u?.user_id);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

function notificationsKey(userId: number): string {
  return `@notifications:user_${userId}`;
}
function clientStatusesKey(userId: number): string {
  return `@contract_statuses:user_${userId}`;
}
function providerStatusesKey(userId: number): string {
  return `@provider_contract_statuses:user_${userId}`;
}

export async function clearLegacyGlobalNotifications(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(LEGACY_NOTIFICATIONS_KEY),
      AsyncStorage.removeItem(LEGACY_STATUSES_KEY),
      AsyncStorage.removeItem(LEGACY_PROVIDER_STATUSES_KEY),
    ]);
  } catch {}
}

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
      return `Boa notícia! ${p} aceitou o seu contrato de "${s}".`;
    case 'Em_Andamento':
    case 'Em Andamento':
      return `${p} Começou o serviço de "${s}". Acompanhe o andamento por aqui.`;
    case 'Concluida':
    case 'Concluída':
      return `${p} Concluiu o serviço de "${s}". Que tal deixar uma avaliação?`;
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
  const userId = await getCurrentUserId();
  if (!userId) return [];
  return readJson<AppNotification[]>(notificationsKey(userId), []);
}

async function saveNotificationsForUser(userId: number, list: AppNotification[]): Promise<void> {
  await AsyncStorage.setItem(notificationsKey(userId), JSON.stringify(list));
}

type NotificationListener = (n: AppNotification) => void;
const notificationListeners = new Set<NotificationListener>();

export function subscribeToNotifications(
  listener: NotificationListener,
): () => void {
  notificationListeners.add(listener);
  return () => {
    notificationListeners.delete(listener);
  };
}

function emitNotification(n: AppNotification): void {
  for (const fn of Array.from(notificationListeners)) {
    try {
      fn(n);
    } catch {}
  }
}

export async function getUnreadCount(): Promise<number> {
  const list = await loadNotifications();
  return list.filter((n) => !n.read).length;
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const list = await readJson<AppNotification[]>(notificationsKey(userId), []);
  if (list.every((n) => n.read)) return;
  const updated = list.map((n) => ({ ...n, read: true }));
  await saveNotificationsForUser(userId, updated);
}

export async function clearAllNotifications(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;
  await AsyncStorage.removeItem(notificationsKey(userId));
}

export interface ContractMeta {
  servicoNome?: string;
  prestadorNome?: string;
}

export async function recordContractNotification(
  contratoId: number,
  status: string,
  meta?: ContractMeta,
): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const lastStatuses = await readJson<Record<string, string>>(clientStatusesKey(userId), {});
  const list = await readJson<AppNotification[]>(notificationsKey(userId), []);

  const notification: AppNotification = {
    id: `${contratoId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    contratoId,
    status,
    message: statusFriendlyMessage(status, meta?.servicoNome, meta?.prestadorNome),
    servicoNome: meta?.servicoNome,
    prestadorNome: meta?.prestadorNome,
    read: false,
    createdAt: Date.now(),
  };

  const merged = [notification, ...list].slice(0, MAX_NOTIFICATIONS);
  await saveNotificationsForUser(userId, merged);

  lastStatuses[String(contratoId)] = status;
  await AsyncStorage.setItem(clientStatusesKey(userId), JSON.stringify(lastStatuses));

  emitNotification(notification);
}

export async function syncContractNotifications(
  contratos: Contratacao[],
  metaResolver?: (c: Contratacao) => ContractMeta | undefined,
): Promise<AppNotification[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const statusesKey = clientStatusesKey(userId);
  const lastStatuses = await readJson<Record<string, string>>(statusesKey, {});
  const list = await readJson<AppNotification[]>(notificationsKey(userId), []);

  const isFirstSync = Object.keys(lastStatuses).length === 0;

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
      const entry: AppNotification = {
        id: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        contratoId: c.contratacao_id,
        status: current,
        message: statusFriendlyMessage(current, meta.servicoNome, meta.prestadorNome),
        servicoNome: meta.servicoNome,
        prestadorNome: meta.prestadorNome,
        read: false,
        createdAt: Date.now(),
      };
      newOnes.push(entry);
      updated[id] = current;
    }
  }

  if (newOnes.length > 0) {
    const merged = [...newOnes, ...list].slice(0, MAX_NOTIFICATIONS);
    await saveNotificationsForUser(userId, merged);
    if (!isFirstSync) {
      for (const n of newOnes) emitNotification(n);
    }
  }

  await AsyncStorage.setItem(statusesKey, JSON.stringify(updated));
  return newOnes;
}

const prestadorNameCache = new Map<number, string>();

export async function performClientNotificationSync(): Promise<AppNotification[]> {
  try {
    const userDataStr = await AsyncStorage.getItem('@auth_user');
    if (!userDataStr) return [];
    const u = JSON.parse(userDataStr);
    const tipo = String(u?.tipo_usuario ?? '').toLowerCase();
    if (tipo === 'prestador') return [];
    const clienteId = Number(u?.user_id);
    if (!clienteId) return [];

    const contratos = await fetchClientContracts(clienteId);

    const pending = contratos
      .map((c) => c.prestador_id)
      .filter((id) => !prestadorNameCache.has(id));
    for (const id of Array.from(new Set(pending))) {
      try {
        const p = await fetchProfessionalById(id);
        prestadorNameCache.set(id, p.name);
      } catch {
        prestadorNameCache.set(id, '');
      }
    }

    return await syncContractNotifications(contratos, (c) => ({
      servicoNome: c.titulo,
      prestadorNome: prestadorNameCache.get(c.prestador_id) || undefined,
    }));
  } catch {
    return [];
  }
}

export function providerStatusFriendlyMessage(
  status: string,
  servicoNome?: string,
  clienteNome?: string,
): string {
  const s = servicoNome && servicoNome.trim().length > 0 ? servicoNome : 'serviço';
  const c = clienteNome && clienteNome.trim().length > 0 ? clienteNome : 'um cliente';

  switch (status) {
    case 'Pendente':
      return `${c} solicitou o serviço "${s}". Confira os detalhes e aceite o contrato.`;
    case 'Aceita':
      return `Você aceitou o contrato de "${s}" com ${c}.`;
    case 'Em_Andamento':
    case 'Em Andamento':
      return `O serviço "${s}" para ${c} está em andamento.`;
    case 'Concluida':
    case 'Concluída':
      return `O serviço "${s}" para ${c} foi concluído.`;
    case 'Cancelada':
      return `O contrato de "${s}" com ${c} foi cancelado.`;
    default:
      return `O status do contrato "${s}" foi atualizado para "${status}".`;
  }
}

export async function syncProviderContractNotifications(
  contratos: Contratacao[],
  metaResolver?: (c: Contratacao) => { servicoNome?: string; clienteNome?: string } | undefined,
): Promise<AppNotification[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const statusesKey = providerStatusesKey(userId);
  const lastStatuses = await readJson<Record<string, string>>(statusesKey, {});
  const list = await readJson<AppNotification[]>(notificationsKey(userId), []);

  const isFirstSync = Object.keys(lastStatuses).length === 0;

  const newOnes: AppNotification[] = [];
  const updated = { ...lastStatuses };

  for (const c of contratos) {
    const id = String(c.contratacao_id);
    const current = c.status ?? 'Pendente';
    const prev = updated[id];

    if (prev === undefined) {
      if (!isFirstSync) {
        const meta = metaResolver?.(c) ?? {};
        newOnes.push({
          id: `prov-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          contratoId: c.contratacao_id,
          status: current,
          message: providerStatusFriendlyMessage(current, meta.servicoNome, meta.clienteNome),
          servicoNome: meta.servicoNome,
          prestadorNome: meta.clienteNome,
          read: false,
          createdAt: Date.now(),
        });
      }
      updated[id] = current;
      continue;
    }

    if (prev !== current) {
      const meta = metaResolver?.(c) ?? {};
      newOnes.push({
        id: `prov-${id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        contratoId: c.contratacao_id,
        status: current,
        message: providerStatusFriendlyMessage(current, meta.servicoNome, meta.clienteNome),
        servicoNome: meta.servicoNome,
        prestadorNome: meta.clienteNome,
        read: false,
        createdAt: Date.now(),
      });
      updated[id] = current;
    }
  }

  if (newOnes.length > 0) {
    const merged = [...newOnes, ...list].slice(0, MAX_NOTIFICATIONS);
    await saveNotificationsForUser(userId, merged);
    for (const n of newOnes) emitNotification(n);
  }

  await AsyncStorage.setItem(statusesKey, JSON.stringify(updated));
  return newOnes;
}
