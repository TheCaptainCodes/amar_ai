'use client';

import { translations, Language } from '@/constants/translations';
import { useLanguageContext } from '@/contexts/LanguageContext';

export const useLanguage = () => {
    const { language } = useLanguageContext();

    const t = <K extends keyof typeof translations[Language]>(key: K): typeof translations[Language][K] => {
        return translations[language][key];
    };

    return { t, language };
}; 