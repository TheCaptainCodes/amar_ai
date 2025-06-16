'use client';

// import { useState, useEffect, useCallback } from 'react'; // Remove unused hooks
import CompanionCard from "@/components/CompanionCard";
import { getSubjectColor } from "@/lib/utils";
import SearchInput from "@/components/SearchInput"; // Assuming SearchInput and SubjectFilter are still needed
import SubjectFilter from "@/components/SubjectFilter"; // Assuming SearchInput and SubjectFilter are still needed
import { useLanguage } from '@/hooks/useLanguage';
// import { getAllCompanions } from '@/lib/actions/companion.actions'; // Not called directly here anymore

interface CompanionsPageContentProps {
  companions: any[]; // Receive the full list directly
  initialSubject?: string; // Keep these if filtering is handled elsewhere or needed for initial state
  initialTopic?: string; // Keep these if filtering is handled elsewhere or needed for initial state
  // Remove limit prop
}

// Destructure companions directly
const CompanionsPageContent = ({ companions, initialSubject = '', initialTopic = '' }: CompanionsPageContentProps) => {
    const { t } = useLanguage();
    // Remove state for companions, page, loading, hasMore

    // Remove fetchMoreCompanions function

    // Remove useEffect for scroll listener

    // The filtering/searching logic would now need to happen either:
    // 1. On the server in app/companions/page.tsx based on searchParams
    // 2. On the client here, filtering the full `companions` list based on SearchInput/SubjectFilter state
    // Assuming filtering happens via URL search parameters and the server fetches the correct initial list.
    // If you implement client-side filtering/searching, you would add state and useEffects here.

    return (
        <main>
            <section className="flex justify-between gap-4 max-sm:flex-col">
                <h1>{t('companionsLibrary')}</h1>
                <div className="flex gap-4">
                    {/* Assuming SearchInput and SubjectFilter manage URL params directly or lift state up */}
                    <SearchInput />
                    <SubjectFilter />
                </div>
            </section>
            <section className="companions-grid">
                {companions.length > 0 ? (
                    companions.map((companion) => (
                        <CompanionCard
                            key={companion.id}
                            {...companion}
                            color={getSubjectColor(companion.subject)}
                        />
                    ))
                ) : ( // Add a message if no companions are found after initial load
                     <div className="flex justify-center py-4 text-gray-500">
                        No companions found with the current filters.
                     </div>
                )}
            </section>
            {/* Remove loading and end-of-list indicators */}
        </main>
    );
};

export default CompanionsPageContent; 