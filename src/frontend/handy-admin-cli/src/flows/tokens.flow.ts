import * as readline from 'node:readline/promises';
import { theme, clearConsole, drawHeader, isCancelCommand } from '../core/theme.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export async function generateTokensMenu(rl: readline.Interface) {
  while (true) {
    clearConsole();
    drawHeader();
    console.log(`\n  ${theme.secondary.bold('GERADOR DE TOKENS (API/DEV)')}`);
    console.log(`  ${theme.dim('1.')} Gerar DEV Token (usa DEV_JWT_SECRET)`);
    console.log(`  ${theme.dim('2.')} Gerar ADMIN Token (usa ADMIN_JWT_SECRET)`);
    console.log(`  ${theme.dim('0.')} Voltar ao Painel\n`);

    const option = await rl.question(`  ${theme.secondary.bold('>')} `);

    if (isCancelCommand(option)) {
      return;
    } else if (option === '1' || option === '2') {
      const typeStr = option === '1' ? 'DEV' : 'ADMIN';
      const secret = option === '1' ? process.env.DEV_JWT_SECRET : process.env.ADMIN_JWT_SECRET;

      if (!secret) {
        console.log(`\n  ${theme.error('✖')} Segredo não encontrado no .env (${typeStr}_JWT_SECRET)`);
        await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
        continue;
      }

      const payload = {
        role: typeStr.toLowerCase(),
        generated_by: 'handy-admin-cli',
        timestamp: new Date().toISOString()
      };

      console.log(`\n  ${theme.dim(`Gerando o ${typeStr} Token instantaneamente...`)}`);

      const token = jwt.sign(payload, secret);

      console.log(`\n  ${theme.success.bold('✔ TOKEN GERADO COM SUCESSO:')}\n`);
      console.log(`  ${theme.text(token)}\n`);
      
      await rl.question(`  ${theme.dim('Copie o token acima e pressione Enter para voltar...')}`);
    }
  }
}
