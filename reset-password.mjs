import {DatabaseSync} from 'node:sqlite';
import {scrypt as cb,randomBytes} from 'node:crypto';
import {promisify} from 'node:util';
import {existsSync} from 'node:fs';
import path from 'node:path';
if(existsSync(path.join(import.meta.dirname,'.env')))process.loadEnvFile(path.join(import.meta.dirname,'.env'));
const password=process.env.NEW_PASSWORD,email=(process.argv[2]||'').trim().toLowerCase();
if(!email||!password||password.length<12||password.length>128)throw new Error('Informe o e-mail como argumento e NEW_PASSWORD no ambiente (12 a 128 caracteres).');
const db=new DatabaseSync(path.join(path.resolve(process.env.DATA_DIR||path.join(import.meta.dirname,'data')),'bem-melhor.sqlite'));
if(!db.prepare('SELECT email FROM accounts WHERE email=?').get(email))throw new Error('Conta não encontrada.');
const salt=randomBytes(16).toString('hex');const result=salt+':'+Buffer.from(await promisify(cb)(password,salt,64)).toString('hex');
db.exec('BEGIN IMMEDIATE');try{db.prepare('UPDATE accounts SET password=? WHERE email=?').run(result,email);db.prepare('DELETE FROM sessions WHERE email=?').run(email);db.exec('COMMIT')}catch(e){db.exec('ROLLBACK');throw e}
console.log('Senha redefinida e sessões antigas encerradas.');
