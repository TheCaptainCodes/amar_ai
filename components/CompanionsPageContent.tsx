'use client';

import CompanionCard from "@/components/CompanionCard";
import { getSubjectColor } from "@/lib/utils";
import SearchInput from "@/components/SearchInput";
import SubjectFilter from "@/components/SubjectFilter";
import { useLanguage } from '@/hooks/useLanguage';

interface CompanionsPageContentProps {
  companions: any[]; // Replace with actual companion type
}

const CompanionsPageContent = ({ companions }: CompanionsPageContentProps) => {
    const { t } = useLanguage();

    return (
        <main>
            <section className="flex justify-between gap-4 max-sm:flex-col">
                <h1>{t('companionsLibrary')}</h1>
                <div className="flex gap-4">
                    <SearchInput />
                    <SubjectFilter />
                </div>
            </section>
            <section className="companions-grid">
                {companions.map((companion) => (
                    <CompanionCard
                        key={companion.id}
                        {...companion}
                        color={getSubjectColor(companion.subject)}
                    />
                ))}
            </section>
        </main>
    );
};

export default CompanionsPageContent; 