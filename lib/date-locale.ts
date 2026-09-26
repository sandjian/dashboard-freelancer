import { es, enUS } from 'date-fns/locale';

export function getDateFnsLocale(locale: string) {
    return locale === 'en' ? enUS : es;
}
