import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ProjectFinished } from '@/features/contracts/components/ProjectFinished';
import { RateService } from '@/features/contracts/components/RateService';
import { fetchConcludedContracts, Contratacao } from '@/features/contracts/services/contractService';
import { AuthUser } from '@/features/auth/types';

export const ConcludedContractChecker: React.FC = () => {
  const [showFinished, setShowFinished] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [concludedContract, setConcludedContract] = useState<Contratacao | null>(null);
  const [clienteId, setClienteId] = useState<number | undefined>(undefined);

  useEffect(() => {
    async function checkConcludedContracts() {
      try {
        const userDataString = await AsyncStorage.getItem('@auth_user');
        if (!userDataString) return;

        const userData: AuthUser = JSON.parse(userDataString);
        if (!userData?.user_id) return;

        setClienteId(userData.user_id);

        const concluded = await fetchConcludedContracts(userData.user_id);
        console.log('ConcludedContractChecker: contratos encontrados:', concluded.length);
        
        if (concluded.length > 0) {
          setConcludedContract(concluded[0]);
          setShowFinished(true);
        } else {
          // Temporário para debug: remove isso depois que funcionar
          console.log('ConcludedContractChecker: Nenhum contrato pendente de avaliação encontrado para este usuário.');
        }
      } catch (error) {
        console.error('ConcludedContractChecker: erro ao verificar contratos', error);
      }
    }

    checkConcludedContracts();
  }, []);

  return (
    <>
      <ProjectFinished
        visible={showFinished}
        onDismiss={() => setShowFinished(false)}
        onAvaliar={() => {
          setShowFinished(false);
          setShowRating(true);
        }}
      />
      <RateService
        visible={showRating}
        onDismiss={() => setShowRating(false)}
        contratacaoId={concludedContract?.contratacao_id}
        prestadorId={concludedContract?.prestador_id}
        clienteId={clienteId}
        prestadorNome={undefined}
      />
    </>
  );
};
