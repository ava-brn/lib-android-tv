import { CertificateGenerator } from './CertificateGenerator';
import { PairingManager } from './PairingManager';
import { RemoteManager } from './RemoteManager';
import { RemoteMessageManager } from './RemoteMessageManager';

const cert = CertificateGenerator.generateFull(
    'Service Name',
    'CNT',
    'ST',
    'LOC',
    'O',
    'OU'
);

let RemoteKeyCode = (new RemoteMessageManager).RemoteKeyCode;
let RemoteDirection = (new RemoteMessageManager).RemoteDirection;

export {
    CertificateGenerator,
    RemoteDirection,
    RemoteKeyCode,
    PairingManager,
    RemoteManager,
};

module.exports = {
    CertificateGenerator,
    RemoteKeyCode,
    RemoteDirection,
    PairingManager,
    RemoteManager,
};
