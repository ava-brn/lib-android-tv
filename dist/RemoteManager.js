"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteManager = void 0;
const Client_1 = require("./Client");
const RemoteMessageManager_1 = require("./RemoteMessageManager");
class RemoteManager extends Client_1.Client {
    static PORT = 6466;
    remoteMessageManager;
    constructor(host, port, key, cert, timeout = 10000) {
        super(host, port, key, cert, timeout);
        this.remoteMessageManager = new RemoteMessageManager_1.RemoteMessageManager();
    }
    async connect() {
        this.on('raw', (buffer) => {
            const message = this.remoteMessageManager.parse(buffer);
            this.emit('log', this.host + ' Receive : ' + JSON.stringify(message));
            if (!message.remotePingRequest) {
                //this.emit('log.debug', this.host + " Receive : " + Array.from(this.chunks));
            }
            if (message.remoteConfigure) {
                this.socket?.write(this.remoteMessageManager.createRemoteConfigure(622, 'Build.MODEL', 'Build.MANUFACTURER', 1, 'Build.VERSION.RELEASE'));
                this.emit('ready');
            }
            else if (message.remoteSetActive) {
                this.socket?.write(this.remoteMessageManager.createRemoteSetActive(622));
            }
            else if (message.remotePingRequest) {
                this.socket?.write(this.remoteMessageManager.createRemotePingResponse(message.remotePingRequest.val1));
            }
            else if (message.remoteImeKeyInject) {
                this.emit('current_app', message.remoteImeKeyInject.appInfo.appPackage);
            }
            else if (message.remoteImeBatchEdit) {
                this.emit('log', 'Receive IME BATCH EDIT' + message.remoteImeBatchEdit);
            }
            else if (message.remoteImeShowRequest) {
                this.emit('log', 'Receive IME SHOW REQUEST' + message.remoteImeShowRequest);
            }
            else if (message.remoteVoiceBegin) {
                //this.emit('log.debug', "Receive VOICE BEGIN" + message.remoteVoiceBegin);
            }
            else if (message.remoteVoicePayload) {
                //this.emit('log.debug', "Receive VOICE PAYLOAD" + message.remoteVoicePayload);
            }
            else if (message.remoteVoiceEnd) {
                //this.emit('log.debug', "Receive VOICE END" + message.remoteVoiceEnd);
            }
            else if (message.remoteStart) {
                this.emit('powered', message.remoteStart.started);
            }
            else if (message.remoteSetVolumeLevel) {
                this.emit('volume', {
                    level: message.remoteSetVolumeLevel.volumeLevel,
                    maximum: message.remoteSetVolumeLevel.volumeMax,
                    muted: message.remoteSetVolumeLevel.volumeMuted,
                });
                //this.emit('log.debug', "Receive SET VOLUME LEVEL" + message.remoteSetVolumeLevel.toJSON().toString());
            }
            else if (message.remoteSetPreferredAudioDevice) {
                //this.emit('log.debug', "Receive SET PREFERRED AUDIO DEVICE" + message.remoteSetPreferredAudioDevice);
            }
            else if (message.remoteError) {
                if (message.remoteError?.message?.remoteConfigure) {
                    this.emit('unpaired', message.remoteError);
                }
                else {
                    this.emit('log', "Receive REMOTE ERROR");
                    this.emit('error', message.remoteError);
                }
            }
            else if (message.remoteKeyInject) {
                this.emit('key', message.remoteKeyInject);
            }
            else {
                this.emit('log', 'What else ?');
            }
        });
        this.socket?.on('timeout', () => {
            this.emit('log', 'timeout');
            this.socket?.destroy();
        });
        // Ping is received every 5 seconds
        this.socket?.setTimeout(this.connectionTimeout);
        return await super.connect();
    }
    sendPower() {
        this.socket?.write(this.remoteMessageManager.createRemoteKeyInject(this.remoteMessageManager.RemoteDirection.SHORT, this.remoteMessageManager.RemoteKeyCode.KEYCODE_POWER));
    }
    sendKey(key, direction) {
        this.socket?.write(this.remoteMessageManager.createRemoteKeyInject(direction, key), (e) => {
            console.log('SendKey', e);
        });
    }
    sendAppLink(app_link) {
        this.socket?.write(this.remoteMessageManager.createRemoteRemoteAppLinkLaunchRequest(app_link));
    }
}
exports.RemoteManager = RemoteManager;
//# sourceMappingURL=RemoteManager.js.map