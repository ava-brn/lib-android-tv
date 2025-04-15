"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteDirection = exports.RemoteKeyCode = exports.CertificateGenerator = exports.AndroidRemote = void 0;
const CertificateGenerator_1 = require("./certificate/CertificateGenerator");
Object.defineProperty(exports, "CertificateGenerator", { enumerable: true, get: function () { return CertificateGenerator_1.CertificateGenerator; } });
const PairingManager_1 = require("./pairing/PairingManager");
const RemoteManager_1 = require("./remote/RemoteManager");
const RemoteMessageManager_1 = __importDefault(require("./remote/RemoteMessageManager"));
const events_1 = __importDefault(require("events"));
class AndroidRemote extends events_1.default {
    host;
    cert;
    pairing_port;
    remote_port;
    service_name;
    timeout;
    pairingManager;
    remoteManager;
    constructor(host, options) {
        super();
        this.host = host;
        this.cert = {
            key: options.cert?.key,
            cert: options.cert?.cert,
        };
        this.pairing_port = options.pairing_port ? options.pairing_port : 6467;
        this.remote_port = options.remote_port ? options.remote_port : 6466;
        this.service_name = options.service_name ? options.service_name : 'Service Name';
        this.timeout = options.timeout ? options.timeout : 1000;
    }
    async start() {
        if (!this.cert.key || !this.cert.cert) {
            this.cert = CertificateGenerator_1.CertificateGenerator.generateFull(this.service_name, 'CNT', 'ST', 'LOC', 'O', 'OU');
            this.pairingManager = new PairingManager_1.PairingManager(this.host, this.pairing_port, this.cert, this.service_name);
            this.pairingManager.on('secret', () => this.emit('secret'));
            this.pairingManager.on('log', (...args) => this.emit('log', args));
            this.pairingManager.on('log.debug', (...args) => this.emit('log.debug', args));
            this.pairingManager.on('log.info', (...args) => this.emit('log.info', args));
            this.pairingManager.on('log.error', (...args) => this.emit('log.error', args));
            let paired = await this.pairingManager.start()
                .catch((error) => {
                console.error(error);
                this.emit('log.error', 'pairing manager start', error);
                // throw error;
            });
            if (!paired) {
                return;
            }
        }
        this.remoteManager = new RemoteManager_1.RemoteManager(this.host, this.remote_port, this.cert, this.timeout);
        this.remoteManager.on('powered', (powered) => this.emit('powered', powered));
        this.remoteManager.on('volume', (volume) => this.emit('volume', volume));
        this.remoteManager.on('current_app', (current_app) => this.emit('current_app', current_app));
        this.remoteManager.on('ready', () => this.emit('ready'));
        this.remoteManager.on('close', (data) => this.emit('close', data));
        this.remoteManager.on('unpaired', () => this.emit('unpaired'));
        this.remoteManager.on('log', (...args) => this.emit('log', args));
        this.remoteManager.on('log.debug', (...args) => this.emit('log.debug', args));
        this.remoteManager.on('log.info', (...args) => this.emit('log.info', args));
        this.remoteManager.on('log.error', (...args) => this.emit('log.error', args));
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await this.remoteManager.start().catch((error) => {
            console.error(error);
        });
    }
    sendCode(code) {
        return this.pairingManager?.sendCode(code);
    }
    sendPower() {
        this.remoteManager?.sendPower();
    }
    sendAppLink(app_link) {
        this.remoteManager?.sendAppLink(app_link);
    }
    sendKey(key, direction) {
        this.remoteManager?.sendKey(key, direction);
    }
    getCertificate() {
        return {
            key: this.cert.key,
            cert: this.cert.cert,
        };
    }
    stop() {
        this.remoteManager?.stop();
    }
}
exports.AndroidRemote = AndroidRemote;
let RemoteKeyCode = (new RemoteMessageManager_1.default).RemoteKeyCode;
exports.RemoteKeyCode = RemoteKeyCode;
let RemoteDirection = (new RemoteMessageManager_1.default).RemoteDirection;
exports.RemoteDirection = RemoteDirection;
module.exports = {
    AndroidRemote,
    CertificateGenerator: CertificateGenerator_1.CertificateGenerator,
    RemoteKeyCode,
    RemoteDirection,
};
//# sourceMappingURL=index.js.map