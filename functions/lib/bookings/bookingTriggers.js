"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCancellationWindow = exports.onBookingUpdated = exports.onBookingCreated = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const config_1 = require("../config");
const TAX_RATE = 0.12;
const CAPACITY_LIMITS = {
    stay: 20,
    transport: 50,
    rental: 30,
    tour: 15,
    dining: 40,
    shop: 10,
};
exports.onBookingCreated = (0, firestore_1.onDocumentCreated)('bookings/{bookingId}', async (event) => {
    const booking = event.data?.data();
    if (!booking)
        return;
    const validation = await validateBooking(booking);
    if (booking.paymentStatus === 'PAID') {
        await handleAtomicInventoryDecrement(booking, event.params.bookingId);
    }
    if (!validation.valid && booking.paymentStatus === 'PAID') {
        await event.data?.ref.update({
            validationErrors: validation.errors,
            status: 'pending',
        });
    }
    if (booking.paymentStatus === 'UNPAID' && booking.status === 'pending') {
        const createdAt = booking.createdAt?.toDate?.() || new Date();
        const cancelAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
        await event.data?.ref.update({
            autoCancelAt: config_1.Timestamp.fromDate(cancelAt),
        });
    }
    await config_1.db.collection('audit_logs').add({
        actorUid: booking.touristUid || 'system',
        actorName: booking.touristName || 'System',
        action: 'booking.created',
        resource: 'bookings',
        resourceId: event.params.bookingId,
        details: `Booking created for ${booking.serviceName || 'Unknown'}`,
        timestamp: config_1.Timestamp.now(),
    });
});
exports.onBookingUpdated = (0, firestore_1.onDocumentUpdated)('bookings/{bookingId}', async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    if (after.status === 'cancelled' && before.status !== 'cancelled') {
        await handleCancellationRefund(after, event.params.bookingId);
    }
    if (after.status === 'checked_in' && before.status !== 'checked_in') {
        await writePortLog(after, event.params.bookingId);
    }
    if (after.refundStatus === 'approved' && before.refundStatus !== 'approved') {
        await restoreInventoryOnRefund(after, event.params.bookingId);
    }
});
async function validateBooking(booking) {
    const errors = [];
    const capacityLimit = CAPACITY_LIMITS[booking.serviceType || ''] || 20;
    const guests = booking.guests || 1;
    if (guests > capacityLimit) {
        errors.push(`Guest count (${guests}) exceeds capacity limit (${capacityLimit}).`);
    }
    if (booking.serviceId && booking.date && booking.serviceType) {
        try {
            const existingSnapshot = await config_1.db.collection('bookings')
                .where('serviceId', '==', booking.serviceId)
                .where('date', '==', booking.date)
                .where('status', 'in', ['pending', 'confirmed', 'checked_in'])
                .get();
            const totalBookedGuests = existingSnapshot.docs.reduce((sum, doc) => {
                return sum + (doc.data().guests || 1);
            }, 0);
            if (totalBookedGuests + guests > capacityLimit) {
                errors.push(`Not enough capacity: ${totalBookedGuests} already booked, requesting ${guests} (limit ${capacityLimit}).`);
            }
        }
        catch (error) {
            console.error(`[validation] Capacity check failed:`, error);
        }
    }
    if (booking.roomId && booking.checkInTimestamp && booking.checkOutTimestamp) {
        try {
            const checkInMillis = booking.checkInTimestamp.toMillis?.() || 0;
            const checkOutMillis = booking.checkOutTimestamp.toMillis?.() || 0;
            if (checkInMillis && checkOutMillis) {
                const conflictSnapshot = await config_1.db.collection('bookings')
                    .where('roomId', '==', booking.roomId)
                    .where('status', 'in', ['pending', 'confirmed', 'checked_in'])
                    .get();
                const hasConflict = conflictSnapshot.docs.some((doc) => {
                    const data = doc.data();
                    const existingCheckIn = data.checkInTimestamp?.toMillis?.();
                    const existingCheckOut = data.checkOutTimestamp?.toMillis?.();
                    if (!existingCheckIn || !existingCheckOut)
                        return false;
                    return checkInMillis < existingCheckOut && checkOutMillis > existingCheckIn;
                });
                if (hasConflict) {
                    errors.push('This room is already booked for the selected dates.');
                }
            }
        }
        catch (error) {
            console.error(`[validation] Room conflict check failed:`, error);
        }
    }
    const amount = booking.amount || 0;
    if (amount <= 0) {
        errors.push('Invalid booking amount.');
    }
    return { valid: errors.length === 0, errors };
}
async function handleCancellationRefund(booking, bookingId) {
    try {
        const checkInTimestamp = booking.checkInTimestamp;
        const cancellationRequestedAt = booking.cancellationRequestedAt;
        if (!checkInTimestamp || !cancellationRequestedAt)
            return;
        const checkInMillis = checkInTimestamp.toMillis?.();
        const cancelMillis = cancellationRequestedAt.toMillis?.();
        if (!checkInMillis || !cancelMillis)
            return;
        const hoursBeforeCheckIn = (checkInMillis - cancelMillis) / (1000 * 60 * 60);
        if (hoursBeforeCheckIn > 48) {
            await config_1.db.collection('bookings').doc(bookingId).update({
                refundStatus: 'approved',
                paymentStatus: booking.paymentStatus === 'PAID' ? 'REFUNDED' : booking.paymentStatus,
                refundedAt: config_1.Timestamp.now(),
                autoApproved: true,
            });
            console.log(`[refund] Auto-approved refund for booking ${bookingId} (${hoursBeforeCheckIn.toFixed(1)}h before check-in)`);
        }
    }
    catch (error) {
        console.error(`[refund] Failed to process cancellation refund for ${bookingId}:`, error);
    }
}
async function restoreInventoryOnRefund(booking, bookingId) {
    const businessId = booking.businessId;
    if (!businessId)
        return;
    if (booking.paymentStatus !== 'REFUNDED')
        return;
    const restoreAmount = booking.guests || 1;
    try {
        const inventorySnapshot = await config_1.db.collection('inventory_items')
            .where('businessId', '==', businessId)
            .where('stock', '<', 99999)
            .get();
        if (inventorySnapshot.empty)
            return;
        const roomName = booking.roomName || null;
        let targetDoc = inventorySnapshot.docs[0];
        if (roomName) {
            const match = inventorySnapshot.docs.find(doc => {
                const name = doc.data().name || '';
                return name.toLowerCase().includes(roomName.toLowerCase());
            });
            if (match)
                targetDoc = match;
        }
        const itemRef = targetDoc.ref;
        await config_1.db.runTransaction(async (transaction) => {
            const item = await transaction.get(itemRef);
            if (!item.exists)
                return;
            const currentStock = item.data()?.stock ?? 0;
            const maxStock = item.data()?.maxStock ?? 99999;
            const newStock = Math.min(maxStock, currentStock + restoreAmount);
            transaction.update(itemRef, {
                stock: newStock,
                status: newStock === 0 ? 'Out of Stock' : newStock < 5 ? 'Limited' : 'Available',
            });
        });
        console.log(`[inventory] Restored ${restoreAmount} to ${targetDoc.data().name} for refunded booking ${bookingId}`);
    }
    catch (error) {
        console.error(`[inventory] Failed to restore inventory for refunded booking ${bookingId}:`, error);
    }
}
async function handleAtomicInventoryDecrement(booking, bookingId) {
    const businessId = booking.businessId;
    if (!businessId)
        return;
    const decrement = booking.guests || 1;
    const inventorySnapshot = await config_1.db.collection('inventory_items')
        .where('businessId', '==', businessId)
        .where('stock', '>', 0)
        .get();
    if (inventorySnapshot.empty)
        return;
    const roomName = booking.roomName || null;
    let targetDoc = inventorySnapshot.docs[0];
    if (roomName) {
        const match = inventorySnapshot.docs.find(doc => {
            const name = doc.data().name || '';
            return name.toLowerCase().includes(roomName.toLowerCase());
        });
        if (match)
            targetDoc = match;
    }
    const itemRef = targetDoc.ref;
    try {
        await config_1.db.runTransaction(async (transaction) => {
            const item = await transaction.get(itemRef);
            if (!item.exists)
                return;
            const currentStock = item.data()?.stock ?? 0;
            if (currentStock <= 0)
                return;
            const newStock = Math.max(0, currentStock - decrement);
            transaction.update(itemRef, {
                stock: newStock,
                status: newStock === 0 ? 'Out of Stock' : newStock < 5 ? 'Limited' : 'Available',
            });
        });
        console.log(`[inventory] Decremented ${targetDoc.data().name} (${decrement}) for booking ${bookingId}`);
    }
    catch (error) {
        console.error(`[inventory] Transaction failed for booking ${bookingId}:`, error);
    }
}
async function writePortLog(booking, bookingId) {
    try {
        await config_1.db.collection('port_logs').add({
            bookingId,
            touristUid: booking.touristUid || '',
            touristName: booking.touristName || 'Unknown',
            serviceType: booking.serviceType || '',
            serviceName: booking.serviceName || '',
            businessId: booking.businessId || '',
            action: 'checkin',
            checkedInAt: config_1.Timestamp.now(),
        });
        console.log(`[port_log] Check-in recorded for booking ${bookingId}`);
    }
    catch (error) {
        console.error(`[port_log] Failed to write port log for booking ${bookingId}:`, error);
    }
}
exports.processCancellationWindow = (0, scheduler_1.onSchedule)('every 24 hours', async (event) => {
    const now = config_1.Timestamp.now();
    const twentyFourHoursAgo = new Date(now.toDate().getTime() - 24 * 60 * 60 * 1000);
    const unpaidSnapshot = await config_1.db.collection('bookings')
        .where('paymentStatus', '==', 'UNPAID')
        .where('status', '==', 'pending')
        .where('createdAt', '<', config_1.Timestamp.fromDate(twentyFourHoursAgo))
        .get();
    const batch = config_1.db.batch();
    unpaidSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
            status: 'cancelled',
            cancelledAt: now,
            cancellationReason: 'Auto-cancelled: unpaid after 24 hours',
        });
    });
    if (unpaidSnapshot.docs.length > 0) {
        await batch.commit();
        console.log(`Auto-cancelled ${unpaidSnapshot.docs.length} unpaid bookings`);
    }
});
//# sourceMappingURL=bookingTriggers.js.map