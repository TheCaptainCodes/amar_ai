import {getCompanion} from "@/lib/actions/companion.actions";
import {currentUser} from "@clerk/nextjs/server";
import {redirect} from "next/navigation";
import {getSubjectColor} from "@/lib/utils";
import Image from "next/image";
import CompanionComponent from "@/components/CompanionComponent";
import { translations } from '@/constants/translations';
import { cookies } from 'next/headers';

interface CompanionSessionPageProps {
    params: Promise<{ id: string}>;
}

const CompanionSession = async ({ params }: CompanionSessionPageProps) => {
    const { id } = await params;
    const companion = await getCompanion(id);
    const user = await currentUser();

    console.log('Companion data:', companion);

    const { name, subject, title, topic, duration, notes_url, voice, style } = companion;

    console.log('Voice and style:', { voice, style });

    if(!user) redirect('/sign-in');
    if(!name) redirect('/companions')

    const cookieStore = cookies();
    const language = cookieStore.get('language')?.value || 'en';
    const t = (key: keyof typeof translations.en) => {
      return translations[language as keyof typeof translations][key];
    };

    return (
        <main>
            <article className="flex rounded-border justify-between p-6 max-md:flex-col">
                <div className="flex items-center gap-2">
                    <div className="size-[72px] flex items-center justify-center rounded-lg max-md:hidden" style={{ backgroundColor: getSubjectColor(subject)}}>
                        <Image src={`/icons/camera.png`} alt={subject} width={35} height={35} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-2xl">
                                {name}
                            </p>
                            <div className="subject-badge max-sm:hidden">
                                {subject}
                            </div>
                        </div>
                        <p className="text-lg">{topic}</p>
                    </div>
                </div>
                <div className="items-start text-2xl max-md:hidden">
                    {duration} {t('minutes')}
                </div>
            </article>

            <CompanionComponent
                {...companion}
                companionId={id}
                userName={user.firstName!}
                userImage={user.imageUrl!}
                notes_url={notes_url}
                voice={voice}
                style={style}
            />
        </main>
    )
}

export default CompanionSession
