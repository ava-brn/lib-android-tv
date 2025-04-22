import { CertificateGenerator } from './CertificateGenerator';
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
    RemoteKeyCode
};

module.exports = {
    CertificateGenerator,
    RemoteKeyCode,
    RemoteDirection,
};
