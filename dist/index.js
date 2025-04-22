"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteManager = exports.PairingManager = exports.RemoteKeyCode = exports.RemoteDirection = exports.CertificateGenerator = void 0;
const CertificateGenerator_1 = require("./CertificateGenerator");
Object.defineProperty(exports, "CertificateGenerator", { enumerable: true, get: function () { return CertificateGenerator_1.CertificateGenerator; } });
const PairingManager_1 = require("./PairingManager");
Object.defineProperty(exports, "PairingManager", { enumerable: true, get: function () { return PairingManager_1.PairingManager; } });
const RemoteManager_1 = require("./RemoteManager");
Object.defineProperty(exports, "RemoteManager", { enumerable: true, get: function () { return RemoteManager_1.RemoteManager; } });
const RemoteMessageManager_1 = require("./RemoteMessageManager");
const cert = CertificateGenerator_1.CertificateGenerator.generateFull('Service Name', 'CNT', 'ST', 'LOC', 'O', 'OU');
let RemoteKeyCode = (new RemoteMessageManager_1.RemoteMessageManager).RemoteKeyCode;
exports.RemoteKeyCode = RemoteKeyCode;
let RemoteDirection = (new RemoteMessageManager_1.RemoteMessageManager).RemoteDirection;
exports.RemoteDirection = RemoteDirection;
module.exports = {
    CertificateGenerator: CertificateGenerator_1.CertificateGenerator,
    RemoteKeyCode,
    RemoteDirection,
};
//# sourceMappingURL=index.js.map