import protobufjs from 'protobufjs';
import * as path from 'path';
import RemoteMessage from './RemoteMessage';

const directory = __dirname;

export default class RemoteMessageManager {
    private root: protobufjs.Root;
    private RemoteMessage: protobufjs.Type;
    public RemoteKeyCode: { [key: string]: number };
    public RemoteDirection: { [key: string]: number };
    private readonly debug: boolean;

    constructor(debug: boolean = false) {
        this.root = protobufjs.loadSync(path.join(directory, 'remotemessage.proto'));
        this.RemoteMessage = this.root.lookupType('remote.RemoteMessage');
        this.RemoteKeyCode = this.root.lookupEnum('remote.RemoteKeyCode').values;
        this.RemoteDirection = this.root.lookupEnum('remote.RemoteDirection').values;
        this.debug = debug;
    }

    create(payload: any): Uint8Array {
        if (!payload.remotePingResponse) {
            if (this.debug) {
                console.debug('Create Remote ' + JSON.stringify(payload));
            }
        }

        const errMsg = this.RemoteMessage.verify(payload);
        if (errMsg) {
            throw new Error(errMsg);
        }

        const message = this.RemoteMessage.create(payload);
        const array = this.RemoteMessage.encodeDelimited(message).finish();

        if (!payload.remotePingResponse) {
            if (this.debug) {
                console.debug('Sending ' + JSON.stringify(message.toJSON()));
            }
        }

        return array;
    }

    createRemoteConfigure(code1: number, model: string, vendor: string, unknown1: number, unknown2: string): Uint8Array {
        return this.create({
            remoteConfigure: {
                code1: code1,
                deviceInfo: {
                    model: model,
                    vendor: vendor,
                    unknown1: 1,
                    unknown2: '1',
                    packageName: 'androidtv-remote',
                    appVersion: '1.0.0',
                },
            },
        });
    }

    createRemoteSetActive(active: number): Uint8Array {
        return this.create({
            remoteSetActive: {
                active: active,
            },
        });
    }

    createRemotePingResponse(val1: number): Uint8Array {
        return this.create({
            remotePingResponse: {
                val1: val1,
            },
        });
    }

    createRemoteKeyInject(direction: number, keyCode: number): Uint8Array {
        return this.create({
            remoteKeyInject: {
                keyCode: keyCode,
                direction: direction,
            },
        });
    }

    createRemoteAdjustVolumeLevel(level: number): Uint8Array {
        return this.create({
            remoteAdjustVolumeLevel: level,
        });
    }

    createRemoteResetPreferredAudioDevice(): Uint8Array {
        return this.create({
            remoteResetPreferredAudioDevice: {},
        });
    }

    createRemoteImeKeyInject(appPackage: string, status: number): Uint8Array {
        return this.create({
            remoteImeKeyInject: {
                textFieldStatus: status,
                appInfo: {
                    appPackage: appPackage,
                },
            },
        });
    }

    createRemoteRemoteAppLinkLaunchRequest(appLink: string): Uint8Array {
        return this.create({
            remoteAppLinkLaunchRequest: {
                appLink: appLink,
            },
        });
    }

    parse(buffer: Uint8Array): RemoteMessage {
        return this.RemoteMessage.decodeDelimited(buffer) as RemoteMessage;
    }
}
