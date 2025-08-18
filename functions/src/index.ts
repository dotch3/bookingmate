import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const createReservation = functions.https.onCall(async (data, context) => {
    const { date, slot, notes } = data;

    // Verifica se o usuário está autenticado
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado.');
    }

    const uid = context.auth.uid;
    const slotDocId = `${date}_${slot}`;

    const slotCapRef = admin.firestore().collection('slotCaps').doc(slotDocId);
    const reservationRef = admin.firestore().collection('reservations');

    return await admin.firestore().runTransaction(async (transaction) => {
        const slotCapDoc = await transaction.get(slotCapRef);
        if (!slotCapDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Slot não encontrado.');
        }

        const count = slotCapDoc.data()?.count || 0;
        if (count >= 2) {
            throw new functions.https.HttpsError('failed-precondition', 'Este slot está cheio.');
        }

        // Cria a nova reserva
        const newReservation = {
            date,
            slot,
            creatorId: uid,
            creatorName: context.auth.token.name || 'Usuário',
            status: 'active',
            notes,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const reservationDoc = await transaction.set(reservationRef.doc(), newReservation);

        // Atualiza a contagem de reservas no slot
        transaction.update(slotCapRef, { count: count + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

        return reservationDoc.id;
    });
});

export const updateReservation = functions.https.onCall(async (data, context) => {
    const { reservationId, date, slot, notes } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado.');
    }

    const reservationRef = admin.firestore().collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Reserva não encontrada.');
    }

    const reservationData = reservationDoc.data();
    if (reservationData?.creatorId !== context.auth.uid && context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão para modificar esta reserva.');
    }

    return await admin.firestore().runTransaction(async (transaction) => {
        const slotDocId = `${date}_${slot}`;
        const slotCapRef = admin.firestore().collection('slotCaps').doc(slotDocId);
        const slotCapDoc = await transaction.get(slotCapRef);

        if (!slotCapDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Slot não encontrado.');
        }

        const count = slotCapDoc.data()?.count || 0;

        // Verifica se o slot está cheio
        if (count >= 2) {
            throw new functions.https.HttpsError('failed-precondition', 'Este slot está cheio.');
        }

        // Atualiza a reserva
        transaction.update(reservationRef, {
            date,
            slot,
            notes,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Atualiza a contagem de reservas no slot
        transaction.update(slotCapRef, { count: count + 1, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

        return reservationId;
    });
});

export const deleteReservation = functions.https.onCall(async (data, context) => {
    const { reservationId } = data;

    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado.');
    }

    const reservationRef = admin.firestore().collection('reservations').doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Reserva não encontrada.');
    }

    const reservationData = reservationDoc.data();
    if (reservationData?.creatorId !== context.auth.uid && context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Você não tem permissão para deletar esta reserva.');
    }

    const slotDocId = `${reservationData.date}_${reservationData.slot}`;
    const slotCapRef = admin.firestore().collection('slotCaps').doc(slotDocId);

    return await admin.firestore().runTransaction(async (transaction) => {
        // Deleta a reserva
        transaction.delete(reservationRef);

        // Atualiza a contagem de reservas no slot
        const slotCapDoc = await transaction.get(slotCapRef);
        if (slotCapDoc.exists) {
            const count = slotCapDoc.data()?.count || 0;
            transaction.update(slotCapRef, { count: Math.max(0, count - 1), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        }

        return reservationId;
    });
});