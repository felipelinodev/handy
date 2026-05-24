import * as readline from 'node:readline/promises';
import { theme, clearConsole, drawHeader, isCancelCommand } from '../core/theme.js';
import { handleApiRequest, API_BASE_URL, resolveEmailsForIds, userCache } from '../api/client.js';

export async function deleteReviewFlow(rl: readline.Interface) {
  clearConsole();
  drawHeader();
  console.log(`\n  ${theme.error.bold('DELETAR UMA AVALIAÇÃO')}`);
  
  const email = await rl.question(`\n  ${theme.primary('Pesquisar pelo Email do usuário')} ${theme.dim('(ou /v para cancelar):')} `);
  if (isCancelCommand(email)) return;

  console.log(`\n  ${theme.secondary('⌛ Cruzando dados de Contratos e Avaliações na API...')}`);
  const listResult = await handleApiRequest('GET', `${API_BASE_URL}/contratations/view-all-contracts`);
  
  if (listResult.success && Array.isArray(listResult.data)) {
    const contracts = listResult.data;
    
    const idsToResolve: number[] = [];
    for (const c of contracts) {
      if (c.avaliacao) {
        if (c.cliente_id) idsToResolve.push(c.cliente_id);
        if (c.prestador_id) idsToResolve.push(c.prestador_id);
      }
    }
    
    await resolveEmailsForIds(idsToResolve);
    
    const filteredContracts = contracts.filter(c => {
      if (!c.avaliacao) return false;
      const cliEmail = userCache.get(c.cliente_id) || '';
      const presEmail = userCache.get(c.prestador_id) || '';
      return cliEmail.toLowerCase() === email.trim().toLowerCase() || 
             presEmail.toLowerCase() === email.trim().toLowerCase();
    });

    if (filteredContracts.length > 0) {
      console.log(`\n  ${theme.dim(`--- AVALIAÇÕES LIGADAS A ${email.toUpperCase()} ---`)}`);
      filteredContracts.forEach((c: any) => {
        const rev = c.avaliacao;
        console.log(`  ${theme.primary.bold(`[ID Avaliação: ${rev.avaliacao_id}]`)} ${theme.text(`Nota ${rev.nota}/5`)} ${theme.dim(`(Referente ao Contrato: ${c.titulo})`)}`);
      });
      console.log(`  ${theme.dim('----------------------------------------------------')}\n`);
    } else {
      console.log(`\n  ${theme.error(`✖ Nenhuma avaliação encontrada para o email: ${email}`)}\n`);
      await rl.question(`  ${theme.dim('Pressione Enter para voltar...')}`);
      return;
    }
  } else {
    console.log(`\n  ${theme.error('✖ Erro ao buscar dados na API.')}`);
    await rl.question(`  ${theme.dim('Pressione Enter para voltar...')}`);
    return;
  }

  const id = await rl.question(`  ${theme.primary('Digite o ID numérico da avaliação')} ${theme.dim('(ou /v para cancelar):')} `);
  if (isCancelCommand(id)) return;

  const confirm = await rl.question(`\n  ${theme.error(`Tem certeza que deseja deletar a avaliação #${id}? (S/N): `)}`);
  if (confirm.trim().toLowerCase() !== 's') return;

  console.log(`\n  ${theme.secondary('⌛ Enviando requisição para a API...')}`);
  const result = await handleApiRequest('DELETE', `${API_BASE_URL}/review/delete-a-review/${encodeURIComponent(id.trim())}`);
  
  if (result.success) {
    console.log(`\n  ${theme.success('✔ Avaliação deletada com sucesso!')}`);
    if (result.data) console.log(`  ${theme.dim(JSON.stringify(result.data, null, 2))}`);
  } else {
    console.log(`\n  ${theme.error(`✖ Erro ao deletar avaliação:`)} ${result.error}`);
  }
  await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
}

export async function cancelContratationFlow(rl: readline.Interface) {
  clearConsole();
  drawHeader();
  console.log(`\n  ${theme.error.bold('CANCELAR UMA CONTRATAÇÃO')}`);
  
  const email = await rl.question(`\n  ${theme.primary('Pesquisar pelo Email do usuário')} ${theme.dim('(ou /v para cancelar):')} `);
  if (isCancelCommand(email)) return;
  
  console.log(`\n  ${theme.secondary('⌛ Resolvendo usuários e buscando contratações na API...')}`);
  const listResult = await handleApiRequest('GET', `${API_BASE_URL}/contratations/view-all-contracts`);
  
  if (listResult.success && Array.isArray(listResult.data)) {
    const contracts = listResult.data;
    
    const idsToResolve: number[] = [];
    for (const c of contracts) {
      if (c.cliente_id) idsToResolve.push(c.cliente_id);
      if (c.prestador_id) idsToResolve.push(c.prestador_id);
    }
    
    await resolveEmailsForIds(idsToResolve);
    
    const filteredContracts = contracts.filter(c => {
      const cliEmail = userCache.get(c.cliente_id) || '';
      const presEmail = userCache.get(c.prestador_id) || '';
      return cliEmail.toLowerCase() === email.trim().toLowerCase() || 
             presEmail.toLowerCase() === email.trim().toLowerCase();
    });

    if (filteredContracts.length > 0) {
      console.log(`\n  ${theme.dim(`--- CONTRATAÇÕES LIGADAS A ${email.toUpperCase()} ---`)}`);
      filteredContracts.forEach((c: any) => {
        console.log(`  ${theme.primary.bold(`[ID Contrato: ${c.contratacao_id}]`)} ${theme.text(c.titulo)} ${theme.dim(`- Status: ${c.status}`)}`);
      });
      console.log(`  ${theme.dim('-------------------------------------------------------')}\n`);
    } else {
      console.log(`\n  ${theme.error(`✖ Nenhuma contratação encontrada para o email: ${email}`)}\n`);
      await rl.question(`  ${theme.dim('Pressione Enter para voltar...')}`);
      return;
    }
  } else {
    console.log(`\n  ${theme.error('✖ Erro ao buscar dados na API.')}`);
    await rl.question(`  ${theme.dim('Pressione Enter para voltar...')}`);
    return;
  }

  const id = await rl.question(`  ${theme.primary('Digite o ID numérico da contratação a cancelar')} ${theme.dim('(ou /v para sair):')} `);
  if (isCancelCommand(id)) return;

  const confirm = await rl.question(`\n  ${theme.error(`Tem certeza que deseja cancelar a contratação #${id}? (S/N): `)}`);
  if (confirm.trim().toLowerCase() !== 's') return;

  console.log(`\n  ${theme.secondary('⌛ Enviando requisição para a API...')}`);
  const result = await handleApiRequest('DELETE', `${API_BASE_URL}/contratations/cancel-a-contratation/${encodeURIComponent(id.trim())}`);
  
  if (result.success) {
    console.log(`\n  ${theme.success('✔ Contratação cancelada com sucesso!')}`);
    if (result.data) console.log(`  ${theme.dim(JSON.stringify(result.data, null, 2))}`);
  } else {
    console.log(`\n  ${theme.error(`✖ Erro ao cancelar contratação:`)} ${result.error}`);
  }
  await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
}
