import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

export function listenReservationsByDate(date: string, onData: (rows: any[]) => void) {
  const q = query(collection(db, "reservations"), where("date", "==", date));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    onData(rows);
  });
}
