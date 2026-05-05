const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const connectionString = env.match(/DATABASE_URL=\"(.*)\"/)[1];
const { Client } = require('pg');
const client = new Client({ connectionString });
client.connect().then(async () => {
  await client.query('CREATE POLICY "Recruiters read all users" ON public.users FOR SELECT USING (EXISTS (SELECT 1 FROM public.recruiters WHERE id = auth.uid()));');
  console.log('Policy created!');
  await client.end();
}).catch(console.error);
