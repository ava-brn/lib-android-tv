import readline from 'node:readline';
import util from 'node:util';

import { AndroidRemote, RemoteKeyCode, RemoteDirection } from './dist/index.js';
import { PairingManager } from './dist/PairingManager.js';
import { RemoteManager } from './dist/RemoteManager.js';
import { CertificateGenerator } from "./dist/CertificateGenerator.js";

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = util.promisify(reader.question).bind(reader);

const SERVICE_NAME = "AVAEXPLREMOTE";

const certstr = await question('Do you have a cert?\n');

console.log(certstr.length);

const cert = certstr.length ? JSON.parse(certstr) : CertificateGenerator.generateFull(
  SERVICE_NAME,
  'CNT',
  'ST',
  'LOC',
  'O',
  'OU'
);

const remote = new RemoteManager('10.0.0.144', 6466, cert);
const pairer = new PairingManager('10.0.0.144', 6467, cert.key, cert.cert, 5000, SERVICE_NAME);

pairer.on('log.debug', (...args) => console.log('[DEBUG]', ...args));
pairer.on('log.info', (...args) => console.log('[INFO]', ...args));
pairer.on('log.error', (...args) => console.log('[ERROR]', ...args));
pairer.on('log', (...args) => console.log('[LOG]', ...args));
pairer.on('error', (...args) => console.log('[E]', ...args));
pairer.on('message', (msg) => console.log('[MSG]', msg));


remote.on('log.debug', (...args) => console.log('[RDEBUG]', ...args));
remote.on('log.info', (...args) => console.log('[RINFO]', ...args));
remote.on('log.error', (...args) => console.log('[RERROR]', ...args));
remote.on('message', (msg) => console.log('[RMSG]', msg));

// console.log('PAIR: Init connection');

process.on('SIGINT', async () => {
  console.log('Exit requested');
  pairer.disconnect();
  reader.close();

  await new Promise(r => setTimeout(r, 300));
  process.exit(0);
})

// await pairer.connect().catch(e => console.log('[E]', e));

// await new Promise(r => setTimeout(r, 500));


if (certstr) {
  pairer.on('message', console.log);
  await remote.start().catch((e) => console.log('Start error', e));
  await question('Press enter to continue'); 
  process.exit(0);
}

await pairer.requestPairing().catch((e) => {
  console.log('Error during requestPairing');
  console.log(e);
});

console.log('Pairing requested');

await new Promise(r => setTimeout(r, 500));

const code = await question('Whats the code: ');
// console.log(`Submitting ${code}`);

await pairer.sendCode(code).catch((error) => { console.log('Error', error); throw error; });

console.log('Paired!');
console.log(JSON.stringify(cert));

pairer.disconnect();

console.log('Ok, were done');
reader.close();
