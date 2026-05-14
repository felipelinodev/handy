const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/handy_db' });
client.connect().then(() => {
  return client.query("SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE contype = 'c' AND conrelid = 'contratacoes'::regclass;");
}).then(res => {
  console.log(res.rows);
}).catch(e => console.error(e)).finally(() => client.end());
