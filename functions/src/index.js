const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.createReservation = functions.https.onCall(async (data, context) => {
    const { date, slot, notes } = data;

    // Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated.');
    }

    const uid = context.auth.uid;
    const slotDocId = `${date}_${slot}`;

    const slotCapRef = admin.firestore().collection('slotCaps').doc(slotDocId);
    const reservationRef = admin.firestore().collection('reservations');

    return await admin.firestore().runTransaction(async (transaction) => {
        const slotCapDoc = await transaction.get(slotCapRef);
        if (!slotCapDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Slot not found.');
        }

        const count = slotCapDoc.data()?.count || 0;
        if (count >= 2) {
            throw new functions.https.HttpsError('failed-precondition', 'This slot is full.');
        }

        // Create new reservation
        const newReservation = {
            date,
            slot,
            creatorId: uid,
            creatorName: context.auth.token.name || 'User',
            notes,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const newReservationRef = reservationRef.doc();
        transaction.set(newReservationRef, newReservation);

        // Update reservation count in slot
        transaction.update(slotCapRef, { count: count + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

        return newReservationRef.id;
    });
});

exports.updateReservation = functions.https.onCall(async (data, context) => {
    const { reservationId, date, slot, notes } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated.');
    }

    const reservationRef = admin.firestore().collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Reservation not found.');
    }

    const reservationData = reservationDoc.data();
    
    if (reservationData.creatorId !== context.auth.uid && context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'You do not have permission to modify this reservation.');
    }

    return await admin.firestore().runTransaction(async (transaction) => {
        const slotDocId = `${date}_${slot}`;
        const slotCapRef = admin.firestore().collection('slotCaps').doc(slotDocId);
        const slotCapDoc = await transaction.get(slotCapRef);

        if (!slotCapDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Slot not found.');
        }

        const count = slotCapDoc.data()?.count || 0;

        // Check if slot is full
        if (count >= 2) {
            throw new functions.https.HttpsError('failed-precondition', 'This slot is full.');
        }

        // Update reservation
        transaction.update(reservationRef, {
            date,
            slot,
            notes,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update reservation count in slot
        transaction.update(slotCapRef, { count: count + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

        return reservationId;
    });
});

exports.deleteReservation = functions.https.onCall(async (data, context) => {
    const { reservationId } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User not authenticated.');
    }

    const reservationRef = admin.firestore().collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Reservation not found.');
    }

    const reservationData = reservationDoc.data();
    
    if (reservationData.creatorId !== context.auth.uid && context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'You do not have permission to delete this reservation.');
    }

    const slotDocId = `${reservationData.date}_${reservationData.slot}`;
    const slotCapRef = admin.firestore().collection('slotCaps').doc(slotDocId);

    return await admin.firestore().runTransaction(async (transaction) => {
        // Delete reservation
        transaction.delete(reservationRef);

        // Update reservation count in slot
        const slotCapDoc = await transaction.get(slotCapRef);
        if (slotCapDoc.exists) {
            const count = slotCapDoc.data()?.count || 0;
            transaction.update(slotCapRef, { count: Math.max(0, count - 1), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        }

        return reservationId;
    });
});