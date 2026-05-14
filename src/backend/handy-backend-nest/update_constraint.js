const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_aGbSz8RT0eDO@ep-fancy-sky-ack6c2yf-pooler.sa-east-1.aws.neon.tech/db_handy?sslmode=require' });
client.connect().then(() => {
  return client.query(`
    ALTER TABLE contratacoes DROP CONSTRAINT chk_status_contratacao;
    ALTER TABLE contratacoes ADD CONSTRAINT chk_status_contratacao CHECK (status IN ('Pendente', 'Aceita', 'Em_Andamento', 'Entregue', 'Concluída', 'Cancelada'));
  `);
}).then(() => {
  console.log("Constraint updated successfully!");
}).catch(e => console.error(e)).finally(() => client.end());
