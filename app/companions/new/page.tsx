import CompanionForm from "@/components/CompanionForm";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const NewCompanion = async () => {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    return (
        <main className="flex items-center justify-center min-h-screen">
            <article className="w-full max-w-2xl gap-4 flex flex-col">
                <h1>Companion Builder</h1>
                <CompanionForm />
            </article>
        </main>
    );
};

export default NewCompanion;
