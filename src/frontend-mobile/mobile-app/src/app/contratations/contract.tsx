import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ContractCard, PrestadorInfo } from '../../components/Contract';
import { fetchContrato, Contratacao } from '../../services/contractService';
import { fetchProviderProfile } from '../../provider/services/providerService';

export default function ContractScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const contratacaoId = parseInt(id ?? '0', 10);

  const [contrato, setContrato] = useState<Contratacao | null>(null);
  const [prestador, setPrestador] = useState<PrestadorInfo | null>(null);
  const [valorServico, setValorServico] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //inicio de teste1
  useEffect(() => {
    if (id === 'test') {
      loadMockData();
      return;
    }
    //fim de teste 1
    if (!contratacaoId) {
      setError('ID do contrato inválido.');
      setIsLoading(false);
      return;
    }

    loadContractData(); //inicio de teste 2
  }, [id, contratacaoId]);

  function loadMockData() {
    setContrato({
      contratacao_id: 999,
      cliente_id: 1,
      prestador_id: 2,
      servico_id: 3,
      titulo: 'Criação landing Page',
      detalhes: 'Crie uma landing page com design clean e moderno nas cores da marca, com o objetivo central de captar leads. A página deve ter uma headline de alto impacto focada no benefício principal, uma seção com 3 a 4 bullet points explicando o que o usuário vai receber, um bloco de prova social com depoimentos reais.',
      endereco: 'Plataforma',
      status: 'Em Andamento',
      inicio: '2026-06-20T10:00:00.000Z',
      conclusao: null,
      vencimento: '2026-06-28T10:00:00.000Z',
      created_at: '2026-06-15T10:00:00.000Z',
      updated_at: '2026-06-15T10:00:00.000Z',
    });
    setPrestador({
      nome: 'Marissol Soares',
      photo_url: 'https://i.pravatar.cc/150?img=47',
      media_avaliacao: 4.8,
      total_clientes: 89,
      especialidade: 'Desenvolvedor',
    });
    setValorServico(350.00);
    setIsLoading(false);
  }
  //fim de teste 2
  async function loadContractData() {
    try {
      setIsLoading(true);
      setError(null);

      const contratoData = await fetchContrato(contratacaoId);
      setContrato(contratoData);

      const providerData = await fetchProviderProfile(contratoData.prestador_id);

      const especialidade: string | undefined =
        providerData?.prestador?.prestador_especialidade?.[0]
          ?.especialidade?.nome_especialidade ?? undefined;

      const prestadorInfo: PrestadorInfo = {
        nome: providerData?.nome ?? '—',
        photo_url: providerData?.photo_url ?? null,
        media_avaliacao: providerData?.prestador?.media_avaliacao ?? null,
        total_clientes: providerData?.prestador?.total_clientes ?? null,
        especialidade: especialidade ?? null,
      };
      setPrestador(prestadorInfo);

      const servicos: any[] = providerData?.prestador?.servicos ?? [];
      const servicoMatch = servicos.find(
        (s: any) => s.servico_id === contratoData.servico_id,
      );
      if (servicoMatch?.preco != null) {
        setValorServico(Number(servicoMatch.preco));
      }
    } catch (err: any) {
      setError(err.message ?? 'Erro ao carregar o contrato.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!contrato && !isLoading && !error) return null;

  return (
    <ContractCard
      contrato={
        contrato ?? {
          contratacao_id: contratacaoId,
          cliente_id: 0,
          prestador_id: 0,
          servico_id: 0,
          titulo: '',
          detalhes: null,
          endereco: null,
          status: 'Pendente',
          inicio: null,
          conclusao: null,
          vencimento: null,
          created_at: '',
          updated_at: '',
        }
      }
      prestador={prestador ?? { nome: '' }}
      valorServico={valorServico}
      isLoading={isLoading}
      error={error}
    />
  );
}
