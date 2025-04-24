"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PairingManager = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const Client_1 = require("./Client");
const PairingMessageManager_1 = require("./PairingMessageManager");
class PairingManager extends Client_1.Client {
    static PORT = 6467;
    serviceName;
    modelName;
    pairingMessageManager;
    constructor(host, port, key, cert, connectionTimeout, serviceName, modelName) {
        super(host, port, key, cert, connectionTimeout);
        this.serviceName = serviceName;
        this.modelName = modelName || serviceName;
        this.pairingMessageManager = new PairingMessageManager_1.PairingMessageManager();
    }
    async requestPairing() {
        return new Promise(async (resolve, reject) => {
            this.on('raw', (buffer) => {
                const message = this.pairingMessageManager.parse(buffer);
                this.emit('message', JSON.stringify(message));
                if (message.status !== this.pairingMessageManager.Status.STATUS_OK) {
                    this.disconnect();
                    this.emit('error', message.status?.toString() || 'Unknown error');
                    return reject(message.status?.toString() || 'Unknown error');
                }
                if (message.pairingRequestAck) {
                    this.socket?.write(this.pairingMessageManager.createPairingOption());
                }
                else if (message.pairingOption) {
                    this.socket?.write(this.pairingMessageManager.createPairingConfiguration());
                }
                else if (message.pairingConfigurationAck) {
                    resolve(true);
                }
                else if (message.pairingSecretAck) {
                    // Not an unkown message, but ignored here since it's handled by the sendCode method
                }
                else {
                    this.emit('log', `Unknown message from ${this.host}: '${JSON.stringify(message)}'`);
                }
            });
            let connectionTimeout = setTimeout(() => {
                this.emit('log', 'Inital connection timeout reached.');
                this.disconnect();
                reject('ConnectTimeout');
            }, this.connectionTimeout);
            await this.connect().catch((error) => reject(error));
            clearTimeout(connectionTimeout);
            this.socket?.write(this.pairingMessageManager.createPairingRequest(this.serviceName, this.modelName));
        });
    }
    async sendCode(code) {
        this.emit('log', 'Sending code: ', code);
        if (!this.socket || this.socket.readyState !== 'open') {
            this.emit('error', 'Client is not initialized.');
            // throw new Error('Socket is not connected');
            return false;
        }
        const codeBytes = this.hexStringToBytes(code);
        const hash = this.getHash(code);
        const hashArray = this.hexStringToBytes(hash.toString());
        if (!hash || hashArray[0] !== codeBytes[0]) {
            this.socket.destroy(new Error("Bad Code"));
            return false;
        }
        else {
            return await new Promise((resolve, reject) => {
                this.on('raw', (buffer) => {
                    const message = this.pairingMessageManager.parse(buffer);
                    this.emit('message', JSON.stringify(message));
                    if (message.status !== this.pairingMessageManager.Status.STATUS_OK) {
                        this.disconnect();
                        this.emit('error', message.status?.toString() || 'Unknown error');
                        return reject(message.status?.toString() || 'Unknown error');
                    }
                    if (message.pairingSecretAck) {
                        this.emit('log', 'Paired! Closing connection (from sendCode)');
                        resolve(true);
                    }
                    else {
                        this.emit('log', `Unknown message from ${this.host}: '${JSON.stringify(message)}'`);
                    }
                });
                // Add timeout?
                this.socket?.write(this.pairingMessageManager.createPairingSecret(hashArray));
            });
        }
    }
    getHash(code) {
        const clientCert = this.socket.getCertificate();
        const serverCert = this.socket.getPeerCertificate();
        if (!clientCert || !serverCert) {
            this.socket.destroy(new Error('No certificate'));
            return false;
        }
        let sha256 = crypto_js_1.default.algo.SHA256.create();
        if (clientCert.modulus === undefined
            || clientCert.exponent === undefined
            || serverCert.modulus === undefined
            || serverCert.exponent === undefined) {
            this.socket.destroy(new Error('No certificate'));
            return false;
        }
        sha256.update(crypto_js_1.default.enc.Hex.parse(clientCert.modulus));
        sha256.update(crypto_js_1.default.enc.Hex.parse("0" + clientCert.exponent.slice(2)));
        sha256.update(crypto_js_1.default.enc.Hex.parse(serverCert.modulus));
        sha256.update(crypto_js_1.default.enc.Hex.parse("0" + serverCert.exponent.slice(2)));
        sha256.update(crypto_js_1.default.enc.Hex.parse(code.slice(2)));
        return sha256.finalize();
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