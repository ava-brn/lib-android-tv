import protobufjs from 'protobufjs';
import * as path from 'path';
const directory = __dirname;
export default class RemoteMessageManager {
    root;
    RemoteMessage;
    RemoteKeyCode;
    RemoteDirection;
    debug;
    constructor(debug = false) {
        this.root = protobufjs.loadSync(path.join(directory, 'remotemessage.proto'));
        this.RemoteMessage = this.root.lookupType('remote.RemoteMessage');
        this.RemoteKeyCode = this.root.lookupEnum('remote.RemoteKeyCode').values;
        this.RemoteDirection = this.root.lookupEnum('remote.RemoteDirection').values;
        this.debug = debug;
    }
    create(payload) {
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
    createRemoteConfigure(code1, model, vendor, unknown1, unknown2) {
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
    createRemoteSetActive(active) {
        return this.create({
            remoteSetActive: {
                active: active,
            },
        });
    }
    createRemotePingResponse(val1) {
        return this.create({
            remotePingResponse: {
                val1: val1,
            },
        });
    }
    createRemoteKeyInject(direction, keyCode) {
        return this.create({
            remoteKeyInject: {
                keyCode: keyCode,
                direction: direction,
            },
        });
    }
    createRemoteAdjustVolumeLevel(level) {
        return this.create({
            remoteAdjustVolumeLevel: level,
        });
    }
    createRemoteResetPreferredAudioDevice() {
        return this.create({
            remoteResetPreferredAudioDevice: {},
        });
    }
    createRemoteImeKeyInject(appPackage, status) {
        return this.create({
            remoteImeKeyInject: {
                textFieldStatus: status,
                appInfo: {
                    appPackage: appPackage,
                },
            },
        });
    }
    createRemoteRemoteAppLinkLaunchRequest(appLink) {
        return this.create({
            remoteAppLinkLaunchRequest: {
                appLink: appLink,
            },
        });
    }
    parse(buffer) {
        return this.RemoteMessage.decodeDelimited(buffer);
    }
}
//# sourceMappingURL=RemoteMessageManager.js.map