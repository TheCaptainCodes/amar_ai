import {getAllCompanions} from "@/lib/actions/companion.actions";
// import CompanionCard from "@/components/CompanionCard"; // Not needed here anymore
// import {getSubjectColor} from "@/lib/utils"; // Not needed here anymore
// import SearchInput from "@/components/SearchInput"; // Handled inside client component
// import SubjectFilter from "@/components/SubjectFilter"; // Handled inside client component
import CompanionsPageContent from "@/components/CompanionsPageContent";

interface SearchParams {
    [key: string]: string | string[] | undefined;
}

const CompanionsLibrary = async ({ searchParams }: SearchParams) => {
    const filters = searchParams;
    const subject = filters.subject ? filters.subject as string : '';
    const topic = filters.topic ? filters.topic as string : '';
    // const limit = 10; // Remove the limit

    const companions = await getAllCompanions({ subject, topic }); // Fetch all companions

    return (
        <CompanionsPageContent 
            companions={companions} // Pass the full list
            initialSubject={subject}
            initialTopic={topic}
            // remove limit prop
        />
    )
}

export default CompanionsLibrary
