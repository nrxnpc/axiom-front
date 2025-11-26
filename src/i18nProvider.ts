import polyglotI18nProvider from 'ra-i18n-polyglot';
import russianMessages from 'ra-language-russian';

export const i18nProvider = polyglotI18nProvider(() => russianMessages, 'ru');

