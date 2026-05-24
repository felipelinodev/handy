import chalk from 'chalk';

export const theme = {
  primary: chalk.hex('#5B67ED'),
  secondary: chalk.hex('#968BE7'),
  error: chalk.red.bold,
  success: chalk.green.bold,
  dim: chalk.gray,
  text: chalk.white,
};

export function clearConsole() {
  process.stdout.write("\x1b[2J\x1b[0;0H");
}

export function isCancelCommand(input: string): boolean {
  return ['0', '/voltar', '/v', '/cancelar'].includes(input.trim().toLowerCase());
}

export function drawHeader() {
  const width = 68;
  const line = "─".repeat(width);
  
  console.log(theme.primary(`  ╭${line}╮`));
  console.log(theme.primary(`  │${" ".repeat(width)}│`));
  
  const logo = [
    `██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗   ██╗ `,
    `██║  ██║██╔══██╗████╗  ██║██╔══██╗╚██╗ ██╔╝  ████╗ ██╗   ██╗`,
    `███████║███████║██╔██╗ ██║██║  ██║ ╚████╔╝   ██╔═╝ ██║   ██║`,
    `██╔══██║██╔══██║██║╚██╗██║██║  ██║  ╚██╔╝    ██║   ██║   ██║`,
    `██║  ██║██║  ██║██║ ╚████║██████╔╝   ██║     ╚████╗████╗ ██║`,
    `╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝    ╚═╝      ╚═══╝╚═══╝ ╚═╝`
  ].map(row => row.padEnd(64, ' '));

  logo.forEach((row) => {
    const paddingLeft = Math.floor((width - 64) / 2);
    const paddingRight = width - 64 - paddingLeft;
    
    const coloredRow = row
      .replace(/█/g, theme.primary('█'))
      .replace(/[╗║╝╔╚═]/g, theme.secondary('$&'));

    console.log(theme.primary(`  │`) + " ".repeat(paddingLeft) + coloredRow + " ".repeat(paddingRight) + theme.primary(`│`));
  });

  console.log(theme.primary(`  │${" ".repeat(width)}│`));

  const subtitle = "Handy Command Line Interface 1.0";
  const subWidth = subtitle.length;
  const subPadLeft = Math.floor((width - subWidth) / 2);
  const subPadRight = width - subWidth - subPadLeft;
  
  console.log(theme.primary(`  │`) + " ".repeat(subPadLeft) + theme.dim(subtitle) + " ".repeat(subPadRight) + theme.primary(`│`));

  console.log(theme.primary(`  │${" ".repeat(width)}│`));
  console.log(theme.primary(`  ╰${line}╯`));
}
