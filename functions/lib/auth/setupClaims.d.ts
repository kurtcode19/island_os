export declare const onUserCreated: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    userId: string;
}>>;
export declare const createBusiness: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    role: string;
    businessId: string;
}>, unknown>;
//# sourceMappingURL=setupClaims.d.ts.map