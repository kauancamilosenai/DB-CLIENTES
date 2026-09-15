import pg from "pg"

const { Pool } = pg

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DB-CLIENTES',
  password: 'senai',
  port: 5433,
});

export default pool;