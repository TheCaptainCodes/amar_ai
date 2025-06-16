'use client';

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import NavItems from "@/components/NavItems";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/constants/translations';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const { t, language } = useLanguage();
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };

        // Check size on mount
        checkScreenSize();

        // Add event listener
        window.addEventListener('resize', checkScreenSize);

        // Clean up event listener on unmount
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

    // Effect to update document title when language changes
    useEffect(() => {
        document.title = translations[language]?.common?.title || 'Amar AI | Personalized AI Tutoring Platform';
    }, [language]);

    return (
        <nav className="navbar">
            <Link href="/">
                <div className="flex items-center gap-2.5 cursor-pointer max-sm:hidden">
                    <img src="/logo_icons/text_logo.png" alt="Amar AI Logo" width={100} height={30} />
                </div>
            </Link>
            <div className="flex items-center gap-4">
                <NavItems />
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    <SignedOut>
                        <SignInButton>
                            <button className="btn-signin">{t('signIn')}</button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <ClerkLoaded>               
                            <div className="flex items-center rounded-full border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md my-auto">
                                <UserButton 
                                    showName={!isSmallScreen}
                                    appearance={{
                                        elements: {
                                            userPreviewText: "truncate overflow-hidden max-w-[100px]"
                                        }
                                    }}
                                />
                            </div>
                        </ClerkLoaded>
                        <ClerkLoading>
                            {/* Optional: Add a placeholder or null while loading */}
                        </ClerkLoading>
                    </SignedIn>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
