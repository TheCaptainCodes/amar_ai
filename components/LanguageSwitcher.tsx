'use client';

import { useLanguageContext } from '@/contexts/LanguageContext';
import { RiTranslateAi } from "react-icons/ri";
import { motion } from "framer-motion";

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguageContext();

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'bn' : 'en';
        setLanguage(newLang);
    };

    return (
        <motion.button
            onClick={toggleLanguage}
            className="flex items-center justify-center size-8 rounded-full text-primary hover:bg-primary/10 transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Switch language to ${language === 'en' ? 'Bengali' : 'English'}`}
        >
            <RiTranslateAi className="text-xl" />
        </motion.button>
    );
};

export default LanguageSwitcher; 