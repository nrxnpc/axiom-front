import polyglotI18nProvider from 'ra-i18n-polyglot';
import russianMessages from 'ra-language-russian';

const customMessages = {
  ...russianMessages
};

export const i18nProvider = polyglotI18nProvider(() => customMessages, 'ru');

