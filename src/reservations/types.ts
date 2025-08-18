// src/reservations/types.ts

export type ReservationStatus = 'active' | 'cancelled';

export interface Reservation {
    id: string;
    date: string; // formato "YYYY-MM-DD"
    slot: 'morning' | 'afternoon' | 'evening';
    creatorId: string;
    creatorName: string;
    status: ReservationStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}