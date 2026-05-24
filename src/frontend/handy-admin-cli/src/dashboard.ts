import * as readline from 'node:readline/promises';
import { theme, clearConsole, drawHeader, isCancelCommand } from './core/theme.js';
import { manageUsersMenu } from './flows/admin.flow.js';
import { generateTokensMenu } from './flows/tokens.flow.js';
import { deleteClientFlow, deleteProviderFlow } from './flows/users.flow.js';
import { deleteReviewFlow, cancelContratationFlow } from './flows/platform.flow.js';
import { updateTicketFlow, deleteTicketFlow } from './flows/support.flow.js';

export async function showDashboard(rl: readline.Interface, user: any, roleOption: string) {
  const roleNames: Record<string, string> = { "1": "Suporte", "2": "Moderador", "3": "Super Admin" };
  const roleName = roleNames[roleOption] || "Usuário";

  while (true) {
    clearConsole();
    drawHeader();
    console.log(`\n  ${theme.secondary.bold(`HANDY DASHBOARD (${roleName.toUpperCase()})`)}`);
    console.log(`  ${theme.dim(`Bem-vindo(a), ${user.name}`)}\n`);

    if (roleOption === "2" || roleOption === "3") {
      console.log(`  ${theme.dim('Rotas de Gerenciamento da Plataforma:')}`);
      console.log(`  ${theme.primary.bold('( 1 )')} Deletar um Cliente`);
      console.log(`  ${theme.primary.bold('( 2 )')} Deletar um Prestador de Serviço`);
      console.log(`  ${theme.primary.bold('( 3 )')} Deletar uma Avaliação`);
      console.log(`  ${theme.primary.bold('( 4 )')} Cancelar uma Contratação`);
      
      if (roleOption === "3") {
        console.log(`\n  ${theme.dim('─────────── (Super Admin) ───────────')}`);
        console.log(`  ${theme.primary.bold('( 5 )')} Gerar Tokens de Acesso (API/Dev)`);
        console.log(`  ${theme.primary.bold('( 6 )')} Gerenciar Usuários do CLI`);
      }

      console.log(`\n  ${theme.dim('─────────────────────────────────────')}`);
    } else {
      console.log(`  ${theme.dim('Rotas de Suporte:')}`);
      console.log(`  ${theme.primary.bold('( 1 )')} Atualizar Ticket de Suporte`);
      console.log(`  ${theme.primary.bold('( 2 )')} Deletar Ticket de Suporte`);
      console.log(`\n  ${theme.dim('──────────────────────────────────────────')}`);
    }

    console.log(`  ${theme.error('( 0 )')} Fazer Logout\n`);

    const choice = await rl.question(`  ${theme.secondary.bold('>')} `);

    if (isCancelCommand(choice)) {
      return;
    } else if (choice === '1' && (roleOption === "2" || roleOption === "3")) {
      await deleteClientFlow(rl);
    } else if (choice === '2' && (roleOption === "2" || roleOption === "3")) {
      await deleteProviderFlow(rl);
    } else if (choice === '3' && (roleOption === "2" || roleOption === "3")) {
      await deleteReviewFlow(rl);
    } else if (choice === '4' && (roleOption === "2" || roleOption === "3")) {
      await cancelContratationFlow(rl);
    } else if (choice === '5' && roleOption === "3") {
      await generateTokensMenu(rl);
    } else if (choice === '6' && roleOption === "3") {
      await manageUsersMenu(rl);
    } else if (choice === '1' && roleOption === "1") {
      await updateTicketFlow(rl);
    } else if (choice === '2' && roleOption === "1") {
      await deleteTicketFlow(rl);
    } else {
      console.log(`\n  ${theme.error('✖ Opção inválida.')}`);
      await rl.question(`  ${theme.dim('Pressione Enter para tentar novamente...')}`);
    }
  }
}
