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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_COMMISSION_RATE = exports.PLATFORM_FEE = exports.PAYMONGO_WEBHOOK_SECRET = exports.PAYMONGO_SECRET_KEY = exports.STRIPE_WEBHOOK_SECRET = exports.STRIPE_SECRET_KEY = exports.FieldValue = exports.Timestamp = exports.auth = exports.db = void 0;
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
exports.db = admin.firestore();
exports.auth = admin.auth();
exports.Timestamp = admin.firestore.Timestamp;
exports.FieldValue = admin.firestore.FieldValue;
exports.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
exports.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
exports.PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY || '';
exports.PAYMONGO_WEBHOOK_SECRET = process.env.PAYMONGO_WEBHOOK_SECRET || '';
exports.PLATFORM_FEE = 150;
exports.DEFAULT_COMMISSION_RATE = 10;
//# sourceMappingURL=config.js.map