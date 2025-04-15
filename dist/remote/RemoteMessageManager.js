"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const protobufjs_1 = __importDefault(require("protobufjs"));
const path = __importStar(require("path"));
const directory = __dirname;
class RemoteMessageManager {
    root;
    RemoteMessage;
    RemoteKeyCode;
    RemoteDirection;
    debug;
    constructor(debug = false) {
        this.root = protobufjs_1.default.loadSync(path.join(directory, 'remotemessage.proto'));
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
exports.default = RemoteMessageManager;
//# sourceMappingURL=RemoteMessageManager.js.map