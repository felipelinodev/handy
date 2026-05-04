import os
import time

try:
    import jwt
except ImportError:
    print("Aviso: Biblioteca 'PyJWT' não encontrada. Instale com: pip install PyJWT")
    input("Pressione Enter para fechar...")
    exit(1)

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from rich.align import Align
from rich.table import Table
from rich import box

console = Console()

C_BG_DARK = "#0A0B14"
C_DARK_BLUE = "#243282"
C_BLUE = "#485CF5"
C_PURPLE_LIGHT = "#908FF6"
C_LAVENDER = "#B8B5F8"
C_WHITE = "#F5F4FF"

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def main():
    clear_screen()
    
    logo_ascii = f"""[{C_BLUE}]
      ✦
    _ |
   | ||_   [{C_WHITE}bold]Handy[/{C_WHITE}bold]
   |_  _|  [{C_LAVENDER}]Gerador de Tokens (Dev & Admin)[/{C_LAVENDER}]
     |_|
    [/{C_BLUE}]"""

    console.print("\n")
    console.print(Align.center(logo_ascii))
    console.print("\n")

    panel = Panel(
        Align.center(f"[{C_WHITE}]Cole os segredos configurados no arquivo .env do NestJS[/{C_WHITE}]"),
        title=f"[{C_LAVENDER}]GERADOR JWT[/{C_LAVENDER}]",
        border_style=C_BLUE,
        box=box.ROUNDED,
        padding=(1, 4),
        width=70
    )
    console.print(Align.center(panel))
    console.print("\n")

    dev_secret = Prompt.ask(f"[{C_PURPLE_LIGHT}]DEV_JWT_SECRET (cole aqui)[/{C_PURPLE_LIGHT}]")
    admin_secret = Prompt.ask(f"[{C_PURPLE_LIGHT}]ADMIN_JWT_SECRET (cole aqui)[/{C_PURPLE_LIGHT}]")

    if not dev_secret or not admin_secret:
        console.print(f"\n[red]✗ Os segredos não podem ser vazios![/red]")
        input("Pressione Enter para fechar...")
        return

    try:
        dev_token = jwt.encode({"role": "developer", "sub": "api-consumer"}, dev_secret, algorithm="HS256")
        admin_token = jwt.encode({"role": "super-admin", "sub": "handy-admin-panel"}, admin_secret, algorithm="HS256")
        
        # Usando o print nativo do Python para garantir que nada corte ou quebre a linha
        print("\n\n=== COPIE O TOKEN ABAIXO PARA O x-dev-token ===")
        print(dev_token)
        
        print("\n=== COPIE O TOKEN ABAIXO PARA O x-admin-token ===")
        print(admin_token)
        print("\n")
        
    except Exception as e:
        console.print(f"\n[red]Erro ao gerar tokens: {e}[/red]")
        
    Prompt.ask(f"\n[{C_LAVENDER}]Pressione Enter para fechar o programa...[/{C_LAVENDER}]")

if __name__ == "__main__":
    main()
