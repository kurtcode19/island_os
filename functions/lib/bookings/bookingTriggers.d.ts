export declare const onBookingCreated: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").QueryDocumentSnapshot | undefined, {
    bookingId: string;
}>>;
export declare const onBookingUpdated: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").Change<import("firebase-functions/v2/firestore").QueryDocumentSnapshot> | undefined, {
    bookingId: string;
}>>;
export declare const processCancellationWindow: import("firebase-functions/v2/scheduler").ScheduleFunction;
//# sourceMappingURL=bookingTriggers.d.ts.map