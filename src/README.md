# /src — Código-Fonte

Organize aqui o código-fonte principal do projeto.

## Estrutura sugerida

```
src/
├── frontend/       # Aplicação frontend (React, Vue, etc.)
│   ├── public/
│   ├── src/
│   └── package.json
│
└── backend/        # Aplicação backend (Node, Python, Java, etc.)
    ├── routes/     # ou controllers/
    ├── models/
    ├── config/
    └── server.js   # ou app.py / Main.java
```

> **Dica:** Se usar monorepo, mantenha `frontend/` e `backend/` separados.
> Se usar repos separados, documente isso no README principal.
