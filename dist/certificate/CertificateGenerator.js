"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificateGenerator = void 0;
const node_forge_1 = __importDefault(require("node-forge"));
const crypto_1 = __importDefault(require("crypto"));
class CertificateGenerator {
    static generateFull(name, country, state, locality, organisation, OU) {
        const keys = node_forge_1.default.pki.rsa.generateKeyPair({ bits: 2048 });
        const cert = node_forge_1.default.pki.createCertificate();
        cert.publicKey = keys.publicKey;
        cert.serialNumber = '01' + crypto_1.default.randomBytes(19).toString('hex');
        cert.validity.notBefore = new Date();
        const date = new Date();
        date.setUTCFullYear(2099);
        cert.validity.notAfter = date;
        const attributes = [
            { name: 'commonName', value: name },
            { name: 'countryName', value: country },
            { shortName: 'ST', value: state },
            { name: 'localityName', value: locality },
            { name: 'organizationName', value: organisation },
            { shortName: 'OU', value: OU },
        ];
        cert.setSubject(attributes);
        cert.sign(keys.privateKey, node_forge_1.default.md.sha256.create());
        return {
            cert: node_forge_1.default.pki.certificateToPem(cert),
            key: node_forge_1.default.pki.privateKeyToPem(keys.privateKey),
        };
    }
}
exports.CertificateGenerator = CertificateGenerator;
//# sourceMappingURL=CertificateGenerator.js.map