"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const node_events_1 = require("node:events");
const node_tls_1 = require("node:tls");
class Client extends node_events_1.EventEmitter {
    host;
    port;
    socket;
    connectionTimeout;
    key;
    cert;
    chunks;
    constructor(host, port, key, cert, connectionTimeout) {
        super();
        if (!host) {
            throw new Error('Host is required');
        }
        if (!port) {
            throw new Error('Port is required');
        }
        if (!key) {
            throw new Error('Key is required');
        }
        if (!cert) {
            throw new Error('Cert is required');
        }
        this.host = host;
        this.port = port;
        this.key = key;
        this.cert = cert;
        this.connectionTimeout = connectionTimeout;
        this.chunks = Buffer.from([]);
    }
    async connect() {
        return new Promise((resolve, reject) => {
            if (this.socket) {
                if (this.socket.readyState === 'open') {
                    this.emit('log', 'Connection already open');
                    return resolve(false);
                }
                if (this.socket.connecting) {
                    this.emit('log', 'Socket is connecting. Waiting for secureConnect event');
                    return this.socket.once('secureConnect', () => {
                        resolve(false);
                    });
                }
                this.emit('log', 'Socket exists, but not connecting. Destroy and try again');
                this.socket.destroy();
            }
            this.emit('log', 'Creating socket');
            this.socket = (0, node_tls_1.connect)(this.options, () => {
                this.emit('log', 'Connected');
                resolve(true);
            });
            this.socket.on('error', (error) => {
                this.emit('error', error);
                this.socket?.destroy();
                reject(error);
            });
            this.socket.on('end', () => this.emit('log', `The device ${this.host} closed the connection.`));
            this.socket.on('close', () => {
                this.emit('log', 'Connection closed');
                this.removeAllListeners();
            });
            this.socket.on('data', (data) => {
                try {
                    this.chunks = Buffer.concat([this.chunks, Buffer.from(data)]);
                    if (this.chunks.length > 0 && this.chunks.readInt8(0) === this.chunks.length - 1) {
                        this.emit('raw', this.chunks);
                        this.chunks = Buffer.from([]);
                    }
                }
                catch (error) {
                    this.emit('error', 'Error on processing data', error);
                }
            });
        });
    }
    disconnect() {
        this.emit('log', 'Disconnecting from ' + this.host);
        this.socket?.destroy();
    }
    get options() {
        return {
            host: this.host,
            port: this.port,
            key: this.key,
            cert: this.cert,
            rejectUnauthorized: false,
        };
    }
}
exports.Client = Client;
//# sourceMappingURL=Client.js.map