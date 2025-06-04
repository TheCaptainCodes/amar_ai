'use server';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  getUserCompanions,
  getUserSessions,
  getBookmarkedCompanions,
} from "@/lib/actions/companion.actions";
import Image from "next/image";
import CompanionsList from "@/components/CompanionsList";
import ProgressPageContent from "@/components/ProgressPageContent";

const Profile = async () => {
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const companions = await getUserCompanions(user.id);
  const sessionHistory = await getUserSessions(user.id);
  const bookmarkedCompanions = await getBookmarkedCompanions(user.id);

  // Serialize user object, safely accessing properties
  const userData = {
    id: user.id,
    imageUrl: user.imageUrl,
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: (user.emailAddresses && user.emailAddresses.length > 0) ? user.emailAddresses[0].emailAddress : undefined,
    // Include other simple user properties if needed in the client component
  };

  // Serialize companion/session arrays, safely handling potential null/undefined items
  const serializeArray = (arr: any[] | null | undefined) => {
    if (!arr) return [];
    return arr.map(item => {
      if (!item) return null; // Handle potential null or undefined items in the array
      return {
        $id: item.$id,
        id: item.$id, // Assuming id is the same as $id
        subject: item.subject,
        name: item.name,
        topic: item.topic,
        duration: item.duration,
        // Include other simple properties used in the client component
        // e.g., bookmarked: item.bookmarked,
      };
    }).filter(item => item !== null); // Filter out any null items
  };

  // Ensure arrays passed to serializeArray are never null or undefined
  const serializedCompanions = serializeArray(companions || []);
  const serializedSessionHistory = serializeArray(sessionHistory || []);
  const serializedBookmarkedCompanions = serializeArray(bookmarkedCompanions || []);

  return (
    <ProgressPageContent
      user={userData}
      companions={serializedCompanions}
      sessionHistory={serializedSessionHistory}
      bookmarkedCompanions={serializedBookmarkedCompanions}
    />
  );
};

export default Profile;
