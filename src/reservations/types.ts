// src/reservations/types.ts

export interface Reservation {
    id: string;
    date: string; // formato "YYYY-MM-DD"
    slot: 'morning' | 'afternoon' | 'evening';
    creatorId: string;
    creatorName: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}