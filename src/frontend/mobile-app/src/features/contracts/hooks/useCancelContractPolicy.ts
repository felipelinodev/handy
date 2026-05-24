import { useState } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  fetchContrato,
  updateContractStatus,
} from '@/features/contracts/services/contractService';
import { isWithinFreeWindow } from '@/features/contracts/utils/freeCancelWindow';
import { buildCancellationTicketDescription } from '@/features/contracts/utils/contractText';
import { createSupportTicket } from '@/services/supportService';

export type CancelContractPolicyParams = {
  contratoId?: string;
  motivo?: string;
  detalhes?: string;
  prestadorNome?: string;
  prestadorFoto?: string;
  prestadorCategoria?: string;
  prestadorRating?: string;
  prestadorClientes?: string;
};

export function useCancelContractPolicy() {
  const router = useRouter();
  const params = useLocalSearchParams<CancelContractPolicyParams>();

  const [submitting, setSubmitting] = useState(false);

  async function handleProceed() {
    const idStr = params.contratoId;
    const id = Number(idStr);
    if (!idStr || !Number.isFinite(id) || id <= 0) {
      Alert.alert('Erro', 'Contrato inválido.');
      return;
    }
    const motivo = (params.motivo ?? '').trim();
    if (!motivo) {
      Alert.alert('Erro', 'O motivo do cancelamento não foi informado.');
      return;
    }

    setSubmitting(true);
    try {
      const contrato = await fetchContrato(id);

      const status = (contrato.status ?? '').toLowerCase();
      if (status.startsWith('conclu')) {
        Alert.alert(
          'Não permitido',
          'Este contrato já foi concluído e não pode ser cancelado.',
        );
        return;
      }
      if (status === 'cancelada') {
        Alert.alert('Não permitido', 'Este contrato já foi cancelado.');
        return;
      }

      if (isWithinFreeWindow(contrato.created_at)) {
        await updateContractStatus(id, 'Cancelada');
        Alert.alert(
          'Contrato cancelado',
          'Seu cancelamento foi processado sem custos.',
          [{ text: 'OK', onPress: () => router.replace('/contratations' as any) }],
        );
        return;
      }

      const descricao = buildCancellationTicketDescription({
        contractId: id,
        motivo,
        detalhes: params.detalhes,
      });

      await createSupportTicket({
        titulo: `Cancelamento do contrato #${id}`,
        descricao,
        categoria: 'cancelamento',
      });

      Alert.alert(
        'Solicitação enviada',
        'Sua solicitação foi encaminhada à equipe de suporte e será analisada em até 24 horas.',
        [{ text: 'OK', onPress: () => router.replace('/contratations' as any) }],
      );
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error?.message ?? 'Não foi possível concluir a solicitação.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return {
    params,
    submitting,
    handleProceed,
  };
}
