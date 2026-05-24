import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { theme, clearConsole, drawHeader } from './core/theme.js';
import { showLoginScreen } from './flows/auth.flow.js';
import { showDashboard } from './dashboard.js';
import { getDb } from './core/database.js';

async function main() {
  await getDb();

  const rl = readline.createInterface({ input, output });

  while (true) {
    clearConsole();
    drawHeader();
    
    console.log(`\n  ${theme.secondary.bold('SELECIONE SEU PERFIL DE ACESSO:')}`);
    console.log(`  ${theme.dim('──────────────────────────────────────────')}`);
    console.log(`  ${theme.primary.bold('( 1 )')} Suporte`);
    console.log(`  ${theme.primary.bold('( 2 )')} Moderador`);
    console.log(`  ${theme.primary.bold('( 3 )')} Super Admin`);
    console.log(`  ${theme.error('( 0 )')} Sair\n`);

    const option = await rl.question(`  ${theme.secondary.bold('>')} `);

    if (option === '0') {
      console.log(`\n  ${theme.dim('Encerrando o CLI...')}`);
      break;
    } else if (['1', '2', '3'].includes(option)) {
      const authResult = await showLoginScreen(rl, option);
      
      if (authResult) {
        await showDashboard(rl, authResult.user, option);
      }
    } else {
      console.log(`\n  ${theme.error('✖ Opção inválida.')}`);
      await rl.question(`  ${theme.dim('Pressione Enter para tentar novamente...')}`);
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error("Erro fatal no CLI:", err);
  process.exit(1);
});
