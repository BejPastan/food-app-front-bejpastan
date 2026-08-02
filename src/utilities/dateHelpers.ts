export function compareDatesWithoutTime(date1: Date, date2: Date): number {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return d1.getTime() - d2.getTime();
}

export function compareDateWithTime(date1: Date, date2: Date): number {
    return date1.getTime() - date2.getTime();
}