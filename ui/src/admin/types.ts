// src/admin/types.ts

export interface Reservation {
    id: string;
    date: string;
    slot: 'morning' | 'afternoon' | 'evening';
    creatorId: string;
    creatorName: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    role: 'admin' | 'user';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}