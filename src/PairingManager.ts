import Crypto from 'crypto-js';
import tls from 'tls';
import { Client } from './Client';
import { PairingMessageManager } from './PairingMessageManager';

export class PairingManager extends Client {
    public static PORT = 6467;
    private readonly serviceName: string;
    private pairingMessageManager: PairingMessageManager;

    constructor(
        host: string,
        port: number,
        key: string,
        cert: string,
        connectionTimeout: number,
        serviceName: string
    ) {
        super(host, port, key, cert, connectionTimeout);
        this.serviceName = serviceName;
        this.pairingMessageManager = new PairingMessageManager();
    }

    async requestPairing() {
        return new Promise(async (resolve, reject) => {
            this.on('raw', (buffer) => {
                const message = this.pairingMessageManager.parse(buffer);
                this.emit('log', 'Receive : ' + JSON.stringify(message));

                if (message.status !== this.pairingMessageManager.Status.STATUS_OK) {
                    this.disconnect();
                    this.emit('error', message.status?.toString() || 'Unknown error');
                    return reject(message.status?.toString() || 'Unknown error');
                }

                if (message.pairingRequestAck) {
                    this.socket?.write(this.pairingMessageManager.createPairingOption());
                } else if (message.pairingOption) {
                    this.socket?.write(this.pairingMessageManager.createPairingConfiguration());
                } else if (message.pairingConfigurationAck) {
                    resolve(true);
                } else if (message.pairingSecretAck) {
                    // Not an unkown message, but ignored here since it's handled by the sendCode method
                } else {
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

            this.socket?.write(this.pairingMessageManager.createPairingRequest(this.serviceName, 'ava-model'));
        });
    }

    async sendCode(code: string): Promise<boolean> {
        this.emit('log', 'Sending code : ', code);

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
        } else {
            return await new Promise((resolve, reject) => {
                this.on('raw', (buffer) => {
                    console.log('Raw buffer from sendCode');
                    const message = this.pairingMessageManager.parse(buffer);
                    this.emit('log', 'Receive [sendCode] : ' + JSON.stringify(message));

                    if (message.status !== this.pairingMessageManager.Status.STATUS_OK) {
                        this.disconnect();
                        this.emit('error', message.status?.toString() || 'Unknown error');
                        return reject(message.status?.toString() || 'Unknown error');
                    }

                    if (message.pairingSecretAck) {
                        console.log('Paired! Closing connection (from sendCode)');
                        resolve(true);
                    } else {
                        this.emit('log', `Unknown message from ${this.host}: '${JSON.stringify(message)}'`);
                    }
                });

                // Add timeout?
                this.socket?.write(this.pairingMessageManager.createPairingSecret(hashArray));
            });
        }
    }

    private getHash(code: string) {
        const clientCert = this.socket!.getCertificate() as tls.PeerCertificate;
        const serverCert = this.socket!.getPeerCertificate() as tls.PeerCertificate;

        if (!clientCert || !serverCert) {
            this.socket!.destroy(new Error('No certificate'));
            return false;
        }

        let sha256 = Crypto.algo.SHA256.create();

        if (clientCert.modulus === undefined
            || clientCert.exponent === undefined
            || serverCert.modulus === undefined
            || serverCert.exponent === undefined) {
            this.socket!.destroy(new Error('No certificate'));
            return false;
        }

        sha256.update(Crypto.enc.Hex.parse(clientCert.modulus));
        sha256.update(Crypto.enc.Hex.parse("0" + clientCert.exponent.slice(2)));
        sha256.update(Crypto.enc.Hex.parse(serverCert.modulus));
        sha256.update(Crypto.enc.Hex.parse("0" + serverCert.exponent.slice(2)));
        sha256.update(Crypto.enc.Hex.parse(code.slice(2)));

        return sha256.finalize();
    }

    private hexStringToBytes(q: string): number[] {
        const bytes: number[] = [];
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
