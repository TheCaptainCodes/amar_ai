'use client';

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from '@/hooks/useLanguage';

const Cta = () => {
    const { t } = useLanguage();

    return (
        <section className="cta-section">
            <div className="cta-badge">{t('startLearning')}</div>
            <h2 className="text-3xl font-bold">
                {t('buildCompanion')}
            </h2>
            <p>{t('buildCompanionDesc')}</p>
            <Image src="images/cta.svg" alt="cta" width={362} height={232} />
            <button className="btn-primary">
                <Image src="/icons/plus.svg" alt="plus" width={12} height={12}/>
                <Link href="/companions/new">
                    <p>{t('buildNewCompanion')}</p>
                </Link>
            </button>
        </section>
    )
}

export default Cta;
