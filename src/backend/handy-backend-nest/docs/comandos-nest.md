nest start -> Inicia o servidor de mas SEM (route reload)
nest start --watch -> Servidor local COM (route reload)



PRISMA --

npx prisma -> Invoca CLI

npx prisma init --datasource-provider postgresql --output ../generated/prisma -> esse arquivo cria a configuração do projeto prisma, oque ele faz?
  - Cria um prisma/diretório com um schema.prismaarquivo contendo sua conexão de banco de dados e modelos de  esquema.
  - Cria um .envarquivo no diretório raiz para variáveis ​​de ambiente.
  - Cria um prisma.config.tsarquivo para configuração do Prisma.

npx prisma db pull -> puxar schema existente do banco, e cria a estrutura dessas schemas
npx prisma generate -> gera os metodos tipados para fazer consulta no banco, ex: prisma.usuario.findMany()   
