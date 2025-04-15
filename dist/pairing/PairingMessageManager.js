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
Object.defineProperty(exports, "__esModule", { value: true });
const protobufjs = __importStar(require("protobufjs"));
const path = __importStar(require("path"));
const directory = __dirname;
class PairingMessageManager {
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
exports.default = PairingMessageManager;
//# sourceMappingURL=PairingMessageManager.js.map