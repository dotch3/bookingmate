// src/utils/dates.ts

export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

export const getSlotsForDate = (date: Date): string[] => {
    return ['morning', 'afternoon', 'evening'];
};