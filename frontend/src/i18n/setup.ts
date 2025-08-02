// @ts-nocheck
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      Jobs: 'Jobs',
      'Dispatch Board': 'Dispatch Board',
      Billing: 'Billing',
      Reports: 'Reports',
      'Next Appointment': 'Next Appointment',
      'Open Invoices': 'Open Invoices',
      'Triage Center': 'Triage Center',
    },
  },
  es: {
    translation: {
      Jobs: 'Trabajos',
      'Dispatch Board': 'Despacho',
      Billing: 'Facturación',
      Reports: 'Informes',
      'Next Appointment': 'Próxima Cita',
      'Open Invoices': 'Facturas Abiertas',
      'Triage Center': 'Centro de Triaje',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  lng: navigator.language.startsWith('es') ? 'es' : 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n; 