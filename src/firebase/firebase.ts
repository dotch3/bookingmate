import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator, doc, updateDoc, deleteDoc, collection, query, where, getDocs, runTransaction, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.error('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.error('The current browser does not support all of the features required to enable persistence.');
    }
  });

// Connect to emulators if in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}

// Direct Firestore operations for admin functions
export const updateReservation = async (data: { reservationId: string; date: string; slot: string; notes: string }) => {
  const { reservationId, date, slot, notes } = data;
  const reservationRef = doc(db, 'reservations', reservationId);
  
  await updateDoc(reservationRef, {
    date,
    slot,
    notes,
    updatedAt: serverTimestamp()
  });
};

export const deleteReservation = async (data: { reservationId: string }) => {
  const { reservationId } = data;
  const reservationRef = doc(db, 'reservations', reservationId);
  
  await runTransaction(db, async (transaction) => {
    // First, read the reservation data inside the transaction
    const reservationDoc = await transaction.get(reservationRef);
    
    if (!reservationDoc.exists()) {
      throw new Error('Reservation not found');
    }
    
    const reservationData = reservationDoc.data();
    const slotDocId = `${reservationData.date}_${reservationData.slot}`;
    const slotCapRef = doc(db, 'slotCaps', slotDocId);
    
    // Read slot capacity data inside the transaction
    const slotCapDoc = await transaction.get(slotCapRef);
    
    // Now perform all writes
    // Delete reservation
    transaction.delete(reservationRef);
    
    // Update slot count if slot exists
    if (slotCapDoc.exists()) {
      const count = slotCapDoc.data()?.count || 0;
      transaction.update(slotCapRef, { 
        count: Math.max(0, count - 1), 
        updatedAt: serverTimestamp() 
      });
    }
  });
};