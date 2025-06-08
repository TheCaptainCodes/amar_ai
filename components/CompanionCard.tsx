"use client";
import { removeBookmark } from "@/lib/actions/companion.actions";
import { addBookmark } from "@/lib/actions/companion.actions";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from '@/hooks/useLanguage';
import { subjectBackgrounds } from '@/constants';

// Mapping of subjects to background images
// const subjectBackgrounds: { [key: string]: string } = {
//     'Physics': '/art/physics.jpg',
//     'Chemistry': '/art/chemistry.avif',
//     'Biology': '/art/biology.webp',
//     'Mathematics': '/art/math-art.avif',
//     'History': '/art/history-art.avif',
//     'Geography': '/art/geography-art.avif',
//     'Literature': '/art/literature-art.avif',
//     'Computer Science': '/art/cs-art.avif',
//     'Economics': '/art/economics-art.avif',
//     'Art': '/art/art-art.avif',
//     'Other': '/art/default-art.avif',
//     // Add more subjects and their image paths here
// };

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
  bookmarked: boolean;
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
  bookmarked,
}: CompanionCardProps) => {
  const pathname = usePathname();
  const handleBookmark = async () => {
    if (bookmarked) {
      await removeBookmark(id, pathname);
    } else {
      await addBookmark(id, pathname);
    }
  };
  const { t } = useLanguage();

  // Get the background image based on subject, with a fallback
  const backgroundImage = subjectBackgrounds[subject] || '/art/default-art.avif'; // Use a default image if subject is not found

  return (
    <article 
      className="relative flex-1 min-w-[250px] rounded-2xl overflow-hidden transition-transform duration-300 hover:translate-y-[-4px] shadow-md"
    >
      {/* Artistic Background Image */}
      <Image
        src={backgroundImage} 
        alt={`${subject} background`} // Use a more descriptive alt text
        layout="fill"
        objectFit="cover"
        className="absolute top-0 left-0 w-full h-full z-0"
        priority
      />

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10" />

      {/* Content */}
      <div className="relative z-20 p-5 text-white flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <div 
            className="px-3 py-1 rounded-full text-sm font-medium bg-white/20"
          >
            {t(subject as any)}
          </div>
          <button 
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            onClick={handleBookmark}
          >
            <Image
              src={bookmarked ? "/icons/bookmark-filled.svg" : "/icons/bookmark.svg"}
              alt="bookmark"
              width={14}
              height={14}
              className="opacity-80"
            />
          </button>
        </div>

        <div className="flex-grow">
          <h2 className="text-2xl font-bold mb-2">{name}</h2>
          <p className="text-sm opacity-80 mb-4">{topic}</p>
          
          <div className="flex items-center gap-2 mb-6 opacity-80">
            <Image
              src="/icons/clock.svg"
              alt="duration"
              width={14}
              height={14}
            />
            <p className="text-sm">{duration} {t('minutes')}</p>
          </div>
        </div>

        <Link href={`/companions/${id}`} className="w-full block mt-auto">
          <button 
            className="w-full py-2.5 px-4 rounded-xl font-medium transition-opacity bg-white text-black hover:opacity-90"
          >
            {t('launchLesson')}
          </button>
        </Link>
      </div>
    </article>
  );
};

export default CompanionCard;
