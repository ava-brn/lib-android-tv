"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairingManager = void 0;
const tls_1 = __importDefault(require("tls"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const events_1 = require("events");
const PairingMessageManager_1 = __importDefault(require("./PairingMessageManager"));
class PairingManager extends events_1.EventEmitter {
    host;
    port;
    chunks;
    certs;
    service_name;
    client;
    pairingMessageManager;
    constructor(host, port, certs, service_name) {
        super();
        this.host = host;
        this.port = port;
        this.chunks = Buffer.from([]);
        this.certs = certs;
        this.service_name = service_name;
        this.pairingMessageManager = new PairingMessageManager_1.default();
    }
    sendCode(code) {
        this.emit('log.debug', 'Sending code : ', code);
        const code_bytes = this.hexStringToBytes(code);
        if (!this.client) {
            this.emit('log.error', 'Client is not initialized.');
            return false;
        }
        const client_certificate = this.client.getCertificate();
        const server_certificate = this.client.getPeerCertificate();
        if (!client_certificate || !server_certificate) {
            this.client.destroy(new Error('No certificate'));
            return false;
        }
        let sha256 = crypto_js_1.default.algo.SHA256.create();
        if (client_certificate.modulus === undefined
            || client_certificate.exponent === undefined
            || server_certificate.modulus === undefined
            || server_certificate.exponent === undefined) {
            this.client.destroy(new Error('No certificate'));
            return false;
        }
        sha256.update(crypto_js_1.default.enc.Hex.parse(client_certificate.modulus));
        sha256.update(crypto_js_1.default.enc.Hex.parse("0" + client_certificate.exponent.slice(2)));
        sha256.update(crypto_js_1.default.enc.Hex.parse(server_certificate.modulus));
        sha256.update(crypto_js_1.default.enc.Hex.parse("0" + server_certificate.exponent.slice(2)));
        sha256.update(crypto_js_1.default.enc.Hex.parse(code.slice(2)));
        let hash = sha256.finalize();
        let hash_array = this.hexStringToBytes(hash.toString());
        let check = hash_array[0];
        if (check !== code_bytes[0]) {
            this.client.destroy(new Error("Bad Code"));
            return false;
        }
        else {
            this.client.write(this.pairingMessageManager.createPairingSecret(hash_array));
            return true;
        }
    }
    async start() {
        return new Promise((resolve, reject) => {
            const options = {
                key: this.certs.key,
                cert: this.certs.cert,
                port: this.port,
                host: this.host,
                rejectUnauthorized: false,
            };
            this.emit('log.debug', 'Start Pairing Connect');
            this.client = tls_1.default.connect(options, () => {
                this.emit('log.debug', this.host + ' Pairing connected');
            });
            if (!this.client) {
                this.emit('log.error', 'Client is not initialized.');
                reject(false);
                return;
            }
            let connectionTimeout = setTimeout(() => {
                this.emit('log.info', 'Inital connection timeout reached.');
                this.client?.destroy();
                reject('ConnectTimeout');
            }, 5000);
            this.client.on('secureConnect', () => {
                this.emit('log.debug', this.host + ' Pairing secure connected ');
                clearTimeout(connectionTimeout);
                this.client?.write(this.pairingMessageManager.createPairingRequest(this.service_name, 'ava-model'));
            });
            this.client.on('data', (data) => {
                const buffer = Buffer.from(data);
                this.chunks = Buffer.concat([this.chunks, buffer]);
                if (this.chunks.length > 0 && this.chunks.readInt8(0) === this.chunks.length - 1) {
                    const message = this.pairingMessageManager.parse(this.chunks);
                    this.emit('log.debug', 'Receive : ' + Array.from(this.chunks));
                    this.emit('log.debug', 'Receive : ' + JSON.stringify(message));
                    if (message.status !== this.pairingMessageManager.Status.STATUS_OK) {
                        this.client?.destroy(new Error(message.status?.toString() || 'Unknown error'));
                    }
                    else {
                        if (message.pairingRequestAck) {
                            this.client?.write(this.pairingMessageManager.createPairingOption());
                        }
                        else if (message.pairingOption) {
                            this.client?.write(this.pairingMessageManager.createPairingConfiguration());
                        }
                        else if (message.pairingConfigurationAck) {
                            this.emit('secret');
                        }
                        else if (message.pairingSecretAck) {
                            this.emit('log.debug', this.host + ' Paired!');
                            this.client?.destroy();
                        }
                        else {
                            this.emit('log.debug', this.host + ' What Else ?');
                        }
                    }
                    this.chunks = Buffer.from([]);
                }
            });
            this.client.on('close', (hasError) => {
                this.emit('log.debug', this.host + ' Pairing Connection closed', hasError);
                if (hasError) {
                    reject(false);
                }
                else {
                    resolve(true);
                }
            });
            this.client.on('error', (error) => {
                this.emit('log.error', error);
                reject(error);
            });
        });
    }
    hexStringToBytes(q) {
        const bytes = [];
        for (let i = 0; i < q.length; i += 2) {
            let byte = parseInt(q.substring(i, i + 2), 16);
            if (byte > 127) {
                byte = -(~byte & 0xff) - 1;
            }
            bytes.push(byte);
        }
        return bytes;
    }
}
exports.PairingManager = PairingManager;
//# sourceMappingURL=PairingManager.js.map