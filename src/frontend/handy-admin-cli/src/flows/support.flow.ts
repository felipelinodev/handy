import * as readline from 'node:readline/promises';
import { theme, clearConsole, drawHeader, isCancelCommand } from '../core/theme.js';
import { handleApiRequest, API_BASE_URL } from '../api/client.js';

export async function updateTicketFlow(rl: readline.Interface) {
  clearConsole();
  drawHeader();
  console.log(`\n  ${theme.error.bold('ATUALIZAR UM TICKET DE SUPORTE')}`);
  
  const id = await rl.question(`\n  ${theme.primary('ID numérico do Ticket')} ${theme.dim('(ou /v para sair):')} `);
  if (isCancelCommand(id)) return;

  console.log(`\n  ${theme.secondary('⌛ Buscando dados do ticket na API...')}`);
  const getResult = await handleApiRequest('GET', `${API_BASE_URL}/support/view-a-ticket/${encodeURIComponent(id.trim())}`);
  
  if (!getResult.success) {
    console.log(`\n  ${theme.error(`✖ Erro ao buscar ticket: ${getResult.error}`)}`);
    await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
    return;
  }
  
  const ticket = getResult.data as any;
  console.log(`\n  ${theme.dim('--- DADOS ATUAIS DO TICKET ---')}`);
  console.log(`  ${theme.primary('Título:')} ${ticket.titulo}`);
  console.log(`  ${theme.primary('Status Atual:')} ${ticket.status}`);
  console.log(`  ${theme.primary('Categoria:')} ${ticket.categoria}`);
  console.log(`  ${theme.dim('------------------------------')}\n`);

  console.log(`  ${theme.dim('O que você deseja atualizar? (Deixe em branco para manter o atual)')}`);
  
  const novoStatus = await rl.question(`  ${theme.primary('Novo Status')} ${theme.dim('(Aberto, Em Andamento, Resolvido, Fechado):')} `);
  if (isCancelCommand(novoStatus)) return;

  const updatePayload: any = {};
  if (novoStatus.trim()) updatePayload.status = novoStatus.trim();

  if (Object.keys(updatePayload).length === 0) {
    console.log(`\n  ${theme.dim('Nenhuma alteração foi feita.')}`);
    await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
    return;
  }

  console.log(`\n  ${theme.secondary('⌛ Atualizando ticket na API...')}`);
  const result = await handleApiRequest('PATCH', `${API_BASE_URL}/support/update-ticket/${encodeURIComponent(id.trim())}`, updatePayload);
  
  if (result.success) {
    console.log(`\n  ${theme.success('✔ Ticket atualizado com sucesso!')}`);
  } else {
    console.log(`\n  ${theme.error(`✖ Erro ao atualizar ticket:`)} ${result.error}`);
  }
  await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
}

export async function deleteTicketFlow(rl: readline.Interface) {
  clearConsole();
  drawHeader();
  console.log(`\n  ${theme.error.bold('DELETAR UM TICKET DE SUPORTE')}`);
  
  const id = await rl.question(`\n  ${theme.primary('ID numérico do Ticket a deletar')} ${theme.dim('(ou /v para sair):')} `);
  if (isCancelCommand(id)) return;

  const confirm = await rl.question(`\n  ${theme.error(`Tem certeza que deseja deletar o ticket #${id}? (S/N): `)}`);
  if (confirm.trim().toLowerCase() !== 's') return;

  console.log(`\n  ${theme.secondary('⌛ Enviando requisição para a API...')}`);
  const result = await handleApiRequest('DELETE', `${API_BASE_URL}/support/delete-a-ticket/${encodeURIComponent(id.trim())}`);
  
  if (result.success) {
    console.log(`\n  ${theme.success('✔ Ticket deletado com sucesso!')}`);
  } else {
    console.log(`\n  ${theme.error(`✖ Erro ao deletar ticket:`)} ${result.error}`);
  }
  await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
}
