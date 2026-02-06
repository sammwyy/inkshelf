export function formatDate(date: string | Date | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
