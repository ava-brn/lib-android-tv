"use strict";
// TypeScript interfaces corresponding to the pairingmessage.proto file
var RoleType;
(function (RoleType) {
    RoleType[RoleType["RoleTypeUnknown"] = 0] = "RoleTypeUnknown";
    RoleType[RoleType["RoleTypeInput"] = 1] = "RoleTypeInput";
    RoleType[RoleType["RoleTypeOutput"] = 2] = "RoleTypeOutput";
    RoleType[RoleType["Unrecognized"] = -1] = "Unrecognized";
})(RoleType || (RoleType = {}));
var EncodingType;
(function (EncodingType) {
    EncodingType[EncodingType["EncodingTypeUnknown"] = 0] = "EncodingTypeUnknown";
    EncodingType[EncodingType["EncodingTypeAlphanumeric"] = 1] = "EncodingTypeAlphanumeric";
    EncodingType[EncodingType["EncodingTypeNumeric"] = 2] = "EncodingTypeNumeric";
    EncodingType[EncodingType["EncodingTypeHexadecimal"] = 3] = "EncodingTypeHexadecimal";
    EncodingType[EncodingType["EncodingTypeQrCode"] = 4] = "EncodingTypeQrCode";
    EncodingType[EncodingType["Unrecognized"] = -1] = "Unrecognized";
})(EncodingType || (EncodingType = {}));
var Status;
(function (Status) {
    Status[Status["Unknown"] = 0] = "Unknown";
    Status[Status["StatusOk"] = 200] = "StatusOk";
    Status[Status["StatusError"] = 400] = "StatusError";
    Status[Status["StatusBadConfiguration"] = 401] = "StatusBadConfiguration";
    Status[Status["StatusBadSecret"] = 402] = "StatusBadSecret";
    Status[Status["Unrecognized"] = -1] = "Unrecognized";
})(Status || (Status = {}));
//# sourceMappingURL=PairingMessage.js.map