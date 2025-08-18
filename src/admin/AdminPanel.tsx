import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Reservation } from '../reservations/types';

const AdminPanel: React.FC = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchReservations = async () => {
            setLoading(true);
            const reservationsCollection = collection(db, 'reservations');
            const reservationsQuery = query(reservationsCollection, orderBy('date', 'asc'));
            const reservationSnapshot = await getDocs(reservationsQuery);
            const reservationList = reservationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reservation[];
            setReservations(reservationList);
            setLoading(false);
        };

        fetchReservations();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th className="border-b p-2">Date</th>
                        <th className="border-b p-2">Slot</th>
                        <th className="border-b p-2">Creator</th>
                        <th className="border-b p-2">Status</th>
                        <th className="border-b p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map(reservation => (
                        <tr key={reservation.id}>
                            <td className="border-b p-2">{reservation.date}</td>
                            <td className="border-b p-2">{reservation.slot}</td>
                            <td className="border-b p-2">{reservation.creatorName}</td>
                            <td className="border-b p-2">{reservation.status}</td>
                            <td className="border-b p-2">
                                {/* Actions for editing or deleting the reservation can be added here */}
                                <button className="text-blue-500">Edit</button>
                                <button className="text-red-500 ml-2">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminPanel;