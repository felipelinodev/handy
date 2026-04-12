export type Periodo = '1 semana' | '1 mes' | '3 meses' | '6 meses' | '1 ano' | 'total';

export function getStartDate(periodo?: Periodo): Date | undefined {
    if (!periodo || periodo === 'total') return undefined;

    const date = new Date();

    switch (periodo) {
        case '1 semana':
            date.setDate(date.getDate() - 7);
            break;
        case '1 mes':
            date.setMonth(date.getMonth() - 1);
            break;
        case '3 meses':
            date.setMonth(date.getMonth() - 3);
            break;
        case '6 meses':
            date.setMonth(date.getMonth() - 6);
            break;
        case '1 ano':
            date.setFullYear(date.getFullYear() - 1);
            break;
        default:
            return undefined;
    }

    return date;
}