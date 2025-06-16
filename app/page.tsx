import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionsList";
import CTA from "@/components/CTA";
import {getAllCompanions, getRecentSessions} from "@/lib/actions/companion.actions";
import {getSubjectColor} from "@/lib/utils";
import HomePageContent from "@/components/HomePageContent";

const Page = async () => {
    const companions = await getAllCompanions({ limit: 3, page: 1 });
    const recentSessionsCompanions = await getRecentSessions(3);

    console.log("Fetched companions count:", companions.length);
    console.log("Fetched recent sessions count:", recentSessionsCompanions.length);

    return (
        <HomePageContent
            companions={companions}
            recentSessionsCompanions={recentSessionsCompanions}
        />
    )
}

export default Page;