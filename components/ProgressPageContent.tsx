'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import CompanionsList from "@/components/CompanionsList";
import { useLanguage } from '@/hooks/useLanguage';

interface ProgressPageContentProps {
  user: any; // Replace with actual user type
  companions: any[]; // Replace with actual companion type
  sessionHistory: any[]; // Replace with actual session type
  bookmarkedCompanions: any[]; // Replace with actual companion type
}

const ProgressPageContent = ({ user, companions, sessionHistory, bookmarkedCompanions }: ProgressPageContentProps) => {
  const { t } = useLanguage();

  return (
    <main className="">
      <section className="flex justify-between gap-4 max-sm:flex-col items-center">
        <div className="flex gap-4 items-center">
          <Image
            src={user.imageUrl}
            alt={user.firstName!}
            width={110}
            height={110}
          />
          <div className="flex flex-col gap-2">
            <h1 className="font-bold text-2xl">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {user.emailAddress}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
            <div className="border border-black rounded-lg p-4 flex flex-col items-center">
                <p className="text-2xl font-bold">10</p>
                <p className="text-sm">{t('lessonsCompleted')}</p>
            </div>
            <div className="border border-black rounded-lg p-4 flex flex-col items-center">
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm">{t('companionsCreated')}</p>
            </div>
        </div>
      </section>

      <Accordion type="multiple">
        <AccordionItem value="bookmarks">
          <AccordionTrigger className="text-2xl font-bold">
            {t('bookmarkedCompanions')} {`(${bookmarkedCompanions.length})`}
          </AccordionTrigger>
          <AccordionContent>
            <CompanionsList
              companions={bookmarkedCompanions}
              title={t('bookmarkedCompanions')}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="recent">
          <AccordionTrigger className="text-2xl font-bold">
            {t('recentSessions')}
          </AccordionTrigger>
          <AccordionContent>
            <CompanionsList
              title={t('recentSessions')}
              companions={sessionHistory}
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="companions">
          <AccordionTrigger className="text-2xl font-bold">
            {t('myCompanions')} {`(${companions.length})`}
          </AccordionTrigger>
          <AccordionContent>
            <CompanionsList title={t('myCompanions')} companions={companions} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
};

export default ProgressPageContent;