const { Client } = require('pg');

async function checkDb() {
  const client = new Client({
    user: 'workhub',
    host: 'localhost',
    database: 'identity_db',
    password: 'workhub',
    port: 5432,
  });

  await client.connect();
  const res = await client.query('SELECT email, password FROM users');
  console.log(res.rows);
  await client.end();
}

checkDb().catch(console.error);
