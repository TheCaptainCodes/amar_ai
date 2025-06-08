'use client';

import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import { getSubjectColor } from "@/lib/utils";
import { useLanguage } from '@/hooks/useLanguage';

interface HomePageContentProps {
  companions: any[]; // Replace 'any' with the actual type of your companion objects
  recentSessionsCompanions: any[]; // Replace 'any' with the actual type of your session objects
}

const HomePageContent = ({ companions, recentSessionsCompanions }: HomePageContentProps) => {
  const { t } = useLanguage();

  return (
    <main>
      <h1>{t('popularCompanions')}</h1>

      <section className="companions-grid">
        {companions.map((companion) => (
          <CompanionCard
            key={companion.id}
            {...companion}
            color={getSubjectColor(companion.subject)}
          />
        ))}
      </section>

      <section className="home-section">
        <CompanionsList
          title={t('recentlyCompletedSessions')}
          companions={recentSessionsCompanions}
          classNames="w-2/3 max-lg:w-full"
        />
        <CTA />
      </section>
    </main>
  );
};

export default HomePageContent; 