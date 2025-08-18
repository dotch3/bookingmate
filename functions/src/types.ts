// Este arquivo define os tipos utilizados nas funções em nuvem.

export type Reservation = {
    id: string;
    date: string; // Formato: "YYYY-MM-DD"
    slot: 'morning' | 'afternoon' | 'evening';
    creatorId: string;
    creatorName: string;
    status: 'active' | 'cancelled';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type SlotCap = {
    date: string; // Formato: "YYYY-MM-DD"
    slot: 'morning' | 'afternoon' | 'evening';
    count: number;
    updatedAt: Date;
};

export type ReservationHistory = {
    reservationId: string;
    action: 'created' | 'updated' | 'deleted';
    before?: Reservation;
    after?: Reservation;
    changedBy: string;
    changedAt: Date;
};