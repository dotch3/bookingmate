// src/calendar/types.ts

export type Slot = 'morning' | 'afternoon' | 'evening';

export interface Reservation {
    id: string;
    date: string; // formato "YYYY-MM-DD"
    slot: Slot;
    creatorId: string;
    creatorName: string;
    status: 'active' | 'cancelled';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SlotCap {
    date: string; // formato "YYYY-MM-DD"
    slot: Slot;
    count: number;
    updatedAt: Date;
}