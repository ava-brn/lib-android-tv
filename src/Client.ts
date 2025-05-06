import { EventEmitter } from "node:events";
import { connect, TLSSocket } from "node:tls";

export class Client extends EventEmitter {
    protected host: string;
    protected port: number;
    protected socket?: TLSSocket;
    protected connectionTimeout: number;
    private key: string;
    private cert: string;
    private chunks: Buffer;

    constructor(host: string, port: number, key: string, cert: string, connectionTimeout: number) {
        super();

        if (!host) { throw new Error('Host is required'); }
        if (!port) { throw new Error('Port is required'); }
        if (!key)  { throw new Error('Key is required');  }
        if (!cert) { throw new Error('Cert is required'); }

        this.host = host;
        this.port = port;
        this.key = key;
        this.cert = cert;

        this.connectionTimeout = connectionTimeout;
        this.chunks = Buffer.from([]);
    }

    async connect(): Promise<boolean> {
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
                    })
                }

                this.emit('log', 'Socket exists, but not connecting. Destroy and try again', this.socket.readyState);
                // this.socket.removeAllListeners();
                this.socket.destroy();
                // this.removeAllListeners();
            }

            this.emit('log', 'Creating socket');

            this.socket = connect(this.options, () => {
                this.emit('log', 'Connected');
                resolve(true);
            })

            this.socket.on('error', (error) => {
                this.emit('error', error);
                this.socket?.destroy();
                reject(error);
            });

            this.socket.on('end', () => this.emit('log', `The device ${this.host} closed the connection.`));

            this.socket.on('close', () => {
                this.emit('log', 'Connection closed');
                this.socket?.removeAllListeners();
                this.removeAllListeners();
            });

            this.socket.on('data', (data) => {
                try {
                    this.chunks = Buffer.concat([this.chunks, Buffer.from(data)]);
                    if (this.chunks.length > 0 && this.chunks.readInt8(0) === this.chunks.length - 1) {
                        this.emit('raw', this.chunks);
                        this.chunks = Buffer.from([]);
                    }
                } catch (error) {
                    this.emit('error', 'Error on processing data', error);
                }
            });

        });
    }

    disconnect() {
        this.emit('log', 'Disconnecting from ' + this.host);
        this.socket?.destroy();
    }

    private get options() {
        return {
            host: this.host,
            port: this.port,
            key: this.key,
            cert: this.cert,
            rejectUnauthorized: false,
        }
    }
}
