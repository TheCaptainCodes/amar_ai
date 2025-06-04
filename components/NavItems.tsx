'use client';

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import { useLanguage } from '@/hooks/useLanguage';

const navItems = [
    { key: 'home', href: '/' },
    { key: 'companions', href: '/companions' },
    { key: 'progress', href: '/progress' },
    { key: 'chat', href: '/chat' },
];

const NavItems = () => {
    const pathname = usePathname();
    const { t } = useLanguage();

    return (
        <nav className="flex items-center gap-4">
            {navItems.map(({ key, href }) => (
                <Link
                    href={href}
                    key={key}
                    className={cn(pathname === href && 'text-primary font-semibold')}
                >
                    {t(key as keyof typeof translations.en)}
                </Link>
            ))}
        </nav>
    )
}

export default NavItems;
