import * as readline from 'node:readline/promises';
import { theme, clearConsole, drawHeader, isCancelCommand } from '../core/theme.js';
import { getDb } from '../core/database.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export async function manageUsersMenu(rl: readline.Interface) {
  while (true) {
    clearConsole();
    drawHeader();
    console.log(`\n  ${theme.secondary.bold('GERENCIAR USUÁRIOS DO CLI')}`);
    console.log(`  ${theme.dim('1.')} Criar novo funcionário`);
    console.log(`  ${theme.dim('2.')} Deletar um funcionário`);
    console.log(`  ${theme.dim('0.')} Voltar ao Painel\n`);

    const option = await rl.question(`  ${theme.secondary.bold('>')} `);

    if (isCancelCommand(option)) {
      return;
    } else if (option === '1') {
      await createUserFlow(rl);
    } else if (option === '2') {
      await deleteUserFlow(rl);
    }
  }
}

async function createUserFlow(rl: readline.Interface) {
  clearConsole();
  drawHeader();
  console.log(`\n  ${theme.primary.bold('NOVO USUÁRIO')}`);
  console.log(`  ${theme.dim('Preencha os dados do novo funcionário.')}\n`);

  const name = await rl.question(`  ${theme.primary('Nome')} ${theme.dim('(ou /v para cancelar):')} `);
  if (isCancelCommand(name)) {
    console.log(`\n  ${theme.dim('Criação cancelada.')}`);
    await rl.question(`  ${theme.dim('Pressione Enter para voltar...')}`);
    return;
  }

  const email = await rl.question(`  ${theme.primary('Email')} ${theme.dim('(ou /v para cancelar):')} `);
  if (isCancelCommand(email)) {
    console.log(`\n  ${theme.dim('Criação cancelada.')}`);
    await rl.question(`  ${theme.dim('Pressione Enter para voltar...')}`);
    return;
  }

  const password = await rl.question(`  ${theme.primary('Senha')} ${theme.dim('(ou /v para cancelar):')} `);
  if (isCancelCommand(password)) {
    console.log(`\n  ${theme.dim('Criação cancelada.')}`);
    await rl.question(`  ${theme.dim('Pressione Enter para voltar...')}`);
    return;
  }
  
  console.log(`\n  ${theme.dim('Selecione o cargo do funcionário (ou /v para cancelar):')}`);
  console.log(`  ${theme.primary('( 1 )')} Suporte`);
  console.log(`  ${theme.primary('( 2 )')} Moderador`);
  console.log(`  ${theme.primary('( 3 )')} Super Administrador`);
  const roleChoice = await rl.question(`\n  ${theme.secondary.bold('>')} `);

  if (isCancelCommand(roleChoice)) {
    console.log(`\n  ${theme.dim('Criação cancelada.')}`);
    await rl.question(`  ${theme.dim('Pressione Enter para voltar...')}`);
    return;
  }

  let roleStr = 'support';
  if (roleChoice === '2') roleStr = 'moderator';
  if (roleChoice === '3') roleStr = 'super_admin';

  const devSecret = process.env.DEV_JWT_SECRET || 'fallback_dev';
  const adminSecret = process.env.ADMIN_JWT_SECRET || 'fallback_admin';

  let generated_dev_jwt = null;
  let generated_admin_jwt = null;

  if (roleChoice === '1') {
    generated_dev_jwt = jwt.sign({ email: email.trim(), role: roleStr }, devSecret);
  } else if (roleChoice === '2') {
    generated_admin_jwt = jwt.sign({ email: email.trim(), role: roleStr }, adminSecret);
  } else if (roleChoice === '3') {
    generated_dev_jwt = jwt.sign({ email: email.trim(), role: roleStr }, devSecret);
    generated_admin_jwt = jwt.sign({ email: email.trim(), role: roleStr }, adminSecret);
  }

  try {
    const db = await getDb();
    await db.run(
      `INSERT INTO users (name, email, password, dev_jwt, admin_jwt) VALUES (?, ?, ?, ?, ?)`,
      [name.trim(), email.trim(), password, generated_dev_jwt, generated_admin_jwt]
    );
    console.log(`\n  ${theme.success('✔')} Usuário ${theme.text.bold(email)} cadastrado com sucesso!`);
    console.log(`  ${theme.dim('Tokens gerados e associados automaticamente.')}`);
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      console.log(`\n  ${theme.error('✖')} Erro: O email ${theme.text.bold(email)} já está cadastrado.`);
    } else {
      console.error(`\n  ${theme.error('✖')} Erro ao criar usuário:`, err.message);
    }
  }

  await rl.question(`\n  ${theme.dim('Pressione Enter para continuar...')}`);
}

async function deleteUserFlow(rl: readline.Interface) {
  clearConsole();
  drawHeader();
  console.log(`\n  ${theme.error('EXCLUIR USUÁRIO')}`);
  console.log(`  ${theme.dim('Atenção: Esta ação removerá o acesso do usuário ao CLI permanentemente.')}\n`);

  const email = await rl.question(`  ${theme.primary('Email do usuário a ser deletado')} ${theme.dim('(ou /v para cancelar):')} `);

  if (!email.trim() || isCancelCommand(email)) {
    console.log(`\n  ${theme.error('✖')} Operação cancelada.`);
    await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
    return;
  }

  try {
    const db = await getDb();
    const user = await db.get(`SELECT * FROM users WHERE email = ?`, [email.trim()]);
    
    if (!user) {
      console.log(`\n  ${theme.error('✖')} Nenhum usuário encontrado com o email ${theme.text.bold(email)}.`);
    } else {
      const confirm = await rl.question(`\n  ${theme.error('Tem certeza que deseja deletar')} ${theme.text(user.name)}? (S/N) `);
      if (confirm.toUpperCase() === 'S') {
        await db.run(`DELETE FROM users WHERE email = ?`, [email.trim()]);
        console.log(`\n  ${theme.success('✔')} Usuário deletado com sucesso!`);
      } else {
        console.log(`\n  ${theme.dim('Operação cancelada.')}`);
      }
    }
  } catch (err: any) {
    console.error(`\n  ${theme.error('✖')} Erro ao deletar usuário:`, err.message);
  }

  await rl.question(`\n  ${theme.dim('Pressione Enter para voltar...')}`);
}
