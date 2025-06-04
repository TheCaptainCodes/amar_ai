'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/constants/translations';
import Cookies from 'js-cookie';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        const storedLang = Cookies.get('language') as Language || 'en';
        setLanguage(storedLang);
        // Set initial HTML lang and body class
        document.documentElement.lang = storedLang;
        document.body.classList.toggle('lang-bn', storedLang === 'bn');
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        Cookies.set('language', lang, { expires: 365 }); // Store language in cookie for 1 year
        // Update HTML lang and body class
        document.documentElement.lang = lang;
        document.body.classList.toggle('lang-bn', lang === 'bn');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguageContext() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguageContext must be used within a LanguageProvider');
    }
    return context;
} 