import * as protobufjs from 'protobufjs';
import * as path from 'path';
const directory = __dirname;
export default class PairingMessageManager {
    root;
    PairingMessage;
    Status;
    RoleType;
    EncodingType;
    constructor() {
        this.root = protobufjs.loadSync(path.join(directory, 'pairingmessage.proto'));
        this.PairingMessage = this.root.lookupType('pairing.PairingMessage');
        this.Status = this.root.lookupEnum('pairing.PairingMessage.Status').values;
        this.RoleType = this.root.lookupEnum('RoleType').values;
        this.EncodingType = this.root.lookupEnum('pairing.PairingEncoding.EncodingType').values;
    }
    create(payload) {
        const errMsg = this.PairingMessage.verify(payload);
        if (errMsg) {
            throw new Error(errMsg);
        }
        const message = this.PairingMessage.create(payload);
        return this.PairingMessage.encodeDelimited(message).finish();
    }
    createPairingRequest(service_name, model) {
        return this.create({
            pairingRequest: {
                serviceName: service_name,
                clientName: model,
            },
            status: this.Status.STATUS_OK,
            protocolVersion: 2,
        });
    }
    createPairingOption() {
        return this.create({
            pairingOption: {
                preferredRole: this.RoleType.ROLE_TYPE_INPUT,
                inputEncodings: [{
                        type: this.EncodingType.ENCODING_TYPE_HEXADECIMAL,
                        symbolLength: 6,
                    }],
            },
            status: this.Status.STATUS_OK,
            protocolVersion: 2,
        });
    }
    createPairingConfiguration() {
        return this.create({
            pairingConfiguration: {
                clientRole: this.RoleType.ROLE_TYPE_INPUT,
                encoding: {
                    type: this.EncodingType.ENCODING_TYPE_HEXADECIMAL,
                    symbolLength: 6,
                },
            },
            status: this.Status.STATUS_OK,
            protocolVersion: 2,
        });
    }
    createPairingSecret(secret) {
        return this.create({
            pairingSecret: { secret: secret },
            status: this.Status.STATUS_OK,
            protocolVersion: 2,
        });
    }
    parse(buffer) {
        return this.PairingMessage.decodeDelimited(buffer);
    }
}
//# sourceMappingURL=PairingMessageManager.js.map