import * as readline from 'node:readline/promises';
import { getDb } from '../core/database.js';
import { theme, clearConsole, drawHeader, isCancelCommand } from '../core/theme.js';
import jwt from 'jsonwebtoken';

export async function showLoginScreen(rl: readline.Interface, option: string): Promise<{ user: any, token: string } | null> {
  clearConsole();
  drawHeader();
  const roleNames: Record<string, string> = { "1": "SUPORTE", "2": "MODERADOR", "3": "SUPER ADMIN" };
  const role = roleNames[option] || "USUÁRIO";

  console.log(`\n  ${theme.secondary.bold(`H A N D Y  -  L O G I N   (${role})`)}`);
  console.log(`  ${theme.dim('──────────────────────────────────────────')}\n`);
  console.log(`  ${theme.dim('Por favor, insira suas credenciais (ou digite /v para voltar):')}\n`);

  const email = await rl.question(`  ${theme.primary.bold('Email:')} `);
  if (isCancelCommand(email)) return null;

  const password = await rl.question(`  ${theme.primary.bold('Senha:')} `);
  if (isCancelCommand(password)) return null;

  console.log(`\n  ${theme.secondary(`⌛ Autenticando ${theme.text(email)}...`)}`);
  
  try {
    let user: any = null;

    if (
      process.env.SUPER_ADMIN_EMAIL &&
      email.trim() === process.env.SUPER_ADMIN_EMAIL &&
      password === process.env.SUPER_ADMIN_PASSWORD
    ) {
      const devSecret = process.env.DEV_JWT_SECRET || 'fallback_dev';
      const adminSecret = process.env.ADMIN_JWT_SECRET || 'fallback_admin';
      
      user = {
        name: "Root Admin",
        email: email.trim(),
        password: password,
        dev_jwt: jwt.sign({ email: email.trim(), role: 'super_admin' }, devSecret),
        admin_jwt: jwt.sign({ email: email.trim(), role: 'super_admin' }, adminSecret)
      };
    } else {
      const db = await getDb();
      user = await db.get(`SELECT * FROM users WHERE email = ?`, [email.trim()]);
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    if (!user || user.password !== password) {
      clearConsole();
      drawHeader();
      console.log(`\n  ${theme.error('✖ Falha no Login:')} Credenciais incorretas.`);
      await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
      return null;
    }

    let tokenToUse = null;
    if (option === "1") {
      tokenToUse = user.dev_jwt;
    } else if (option === "2" || option === "3") {
      tokenToUse = user.admin_jwt;
    }

    if (!tokenToUse) {
      clearConsole();
      drawHeader();
      console.log(`\n  ${theme.error('✖ Erro de Permissão:')} O usuário ${email} não possui o token necessário para acessar como ${role}.`);
      await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
      return null;
    }

    const decoded = jwt.decode(tokenToUse) as any;
    const tokenRole = decoded?.role;

    if (option === "3" && tokenRole !== 'super_admin') {
      clearConsole();
      drawHeader();
      console.log(`\n  ${theme.error('✖ Erro de Permissão:')} Apenas Super Administradores podem acessar esta aba.`);
      await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
      return null;
    }

    return { user, token: tokenToUse };
  } catch (err: any) {
    clearConsole();
    drawHeader();
    console.error(`\n  ${theme.error('✖ Erro no Banco de Dados:')} Não foi conectar.`, err.message);
    await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
    return null;
  }
}
