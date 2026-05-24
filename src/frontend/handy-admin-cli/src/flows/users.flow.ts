import * as readline from 'node:readline/promises';
import { theme, clearConsole, drawHeader, isCancelCommand } from '../core/theme.js';
import { handleApiRequest, API_BASE_URL } from '../api/client.js';

export async function deleteClientFlow(rl: readline.Interface) {
  clearConsole();
  drawHeader();
  console.log(`\n  ${theme.error.bold('DELETAR UM CLIENTE')}`);
  console.log(`  ${theme.dim('Esta ação removerá todos os dados do cliente de forma irreversível na API.')}\n`);
  
  const email = await rl.question(`  ${theme.primary('Email do cliente')} ${theme.dim('(ou /v para cancelar):')} `);
  if (isCancelCommand(email)) return;

  const confirm = await rl.question(`\n  ${theme.error(`Tem certeza que deseja deletar o cliente ${email}? (S/N): `)}`);
  if (confirm.trim().toLowerCase() !== 's') return;

  console.log(`\n  ${theme.secondary('⌛ Enviando requisição para a API...')}`);
  const result = await handleApiRequest('DELETE', `${API_BASE_URL}/client/delete-a-client/${encodeURIComponent(email.trim())}`);
  
  if (result.success) {
    console.log(`\n  ${theme.success('✔ Cliente deletado com sucesso!')}`);
    if (result.data) console.log(`  ${theme.dim(JSON.stringify(result.data, null, 2))}`);
  } else {
    console.log(`\n  ${theme.error(`✖ Erro ao deletar cliente:`)} ${result.error}`);
  }
  await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
}

export async function deleteProviderFlow(rl: readline.Interface) {
  clearConsole();
  drawHeader();
  console.log(`\n  ${theme.error.bold('DELETAR UM PRESTADOR DE SERVIÇO')}`);
  console.log(`  ${theme.dim('Esta ação removerá todos os dados do prestador de forma irreversível na API.')}\n`);
  
  const email = await rl.question(`  ${theme.primary('Email do prestador')} ${theme.dim('(ou /v para cancelar):')} `);
  if (isCancelCommand(email)) return;

  const confirm = await rl.question(`\n  ${theme.error(`Tem certeza que deseja deletar o prestador ${email}? (S/N): `)}`);
  if (confirm.trim().toLowerCase() !== 's') return;

  console.log(`\n  ${theme.secondary('⌛ Enviando requisição para a API...')}`);
  const result = await handleApiRequest('DELETE', `${API_BASE_URL}/provider/delete-a-service-provider/${encodeURIComponent(email.trim())}`);
  
  if (result.success) {
    console.log(`\n  ${theme.success('✔ Prestador deletado com sucesso!')}`);
    if (result.data) console.log(`  ${theme.dim(JSON.stringify(result.data, null, 2))}`);
  } else {
    console.log(`\n  ${theme.error(`✖ Erro ao deletar prestador:`)} ${result.error}`);
  }
  await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
}
