import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ProjectFinished } from './ProjectFinished';
import { RateService } from './RateService';
import { fetchConcludedContracts, Contratacao } from '../services/contractService';
import { AuthUser } from '../types/auth';

export const ConcludedContractChecker: React.FC = () => {
  const [showFinished, setShowFinished] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [concludedContract, setConcludedContract] = useState<Contratacao | null>(null);

  useEffect(() => {
    async function checkConcludedContracts() {
      try {
        const userDataString = await AsyncStorage.getItem('@auth_user');
        if (!userDataString) return;

        const userData: AuthUser = JSON.parse(userDataString);
        if (!userData?.user_id) return;

        const concluded = await fetchConcludedContracts(userData.user_id);
        if (concluded.length > 0) {
          setConcludedContract(concluded[0]);
          setShowFinished(true);
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
        prestadorNome={undefined}
      />
    </>
  );
};
