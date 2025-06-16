import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Navbar from "@/components/Navbar";
import NextTopLoader from 'nextjs-toploader';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { translations } from '@/constants/translations';
import { cookies } from 'next/headers';

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const language = cookieStore.get('language')?.value || 'en';
  const title =
    translations[language as keyof typeof translations].common?.title ||
    'Amar AI | Personalized AI Tutoring Platform';
  const description =
    language === 'bn'
      ? 'আমার AI - বাংলাদেশের প্রথম ব্যক্তিগতকৃত AI টিউটরিং প্ল্যাটফর্ম, যেখানে শিক্ষার্থীরা যেকোনো বিষয় বা টপিকের জন্য যেকোনো সময়ে অসংখ্য AI টিউটর তৈরি করতে পারে — সম্পূর্ণ বিনামূল্যে'
      : "Amar AI is Bangladesh's first personalized AI tutoring platform where students can create limitless AI tutors for any subject, any topic, at any time — completely free.";

  return {
    title: title,
    description: description,
    keywords: [
      'Amar AI',
      'Amar AI Bangladesh',
      'amarai',
      'amar ai app',
      'Amar AI education',
      'AI tutoring platform',
      'Free AI tutors',
      'Create AI tutor',
      'AI tutor Bangladesh',
      'Bangladeshi AI tutor app',
      'Personalized AI tutor',
      'AI tutor for students',
      'Custom AI tutoring',
      'Custom tutor AI',
      'AI tutor online',
      '24/7 online tutoring',
      'Unlimited AI tutors',
      'AI for education',
      'AI teacher app',
      'AI Bangla education',
      'AI learning assistant',
      'AI teaching assistant',
      'AI in education Bangladesh',
      'AI chatbot for learning',
      'AI powered tutor',
      'AI private tutor',
      'Bangladesh education technology',
      'Free online tutor Bangladesh',
      'Best tutoring platform Bangladesh',
      'Smart education Bangladesh',
      'Future of learning Bangladesh',
      'Interactive learning platform',
      'AI-based learning',
      'AI education Bangladesh',
      'AI app for students',
      'AI study help Bangladesh',
      'Fatin Hasnat',
      'Md. Fatin Hasnat',
      'fatinhasnat.com',
      'Fatin',
      'Hasnat',
      'Md. Hasnat',
      'AI by Fatin Hasnat',
      'Fatin Hasnat Amar AI',
      'AI learning by Fatin',
      'AI tutor by Hasnat',
      'Hasnat AI tutor',
      'Developed by Md. Fatin Hasnat',
      'Educational app by Fatin Hasnat',
      'Online education Bangladesh',
      'AI class assistant',
      'AI learning Bangladesh',
      'AI student support',
      'Bangla AI education',
      'Bangla AI tutoring',
      'AI private teacher Bangladesh',
      'Bangladeshi edtech',
      'Best free tutor app Bangladesh',
      'AI tutor in Bangla',
      'বাংলা টিউটরিং এপ',
      'বাংলাদেশের এআই শিক্ষা',
      'ব্যক্তিগত এআই টিউটর',
      'এআই শিক্ষা প্ল্যাটফর্ম',
      '২৪/৭ এআই টিউটর',
      'শিক্ষার্থীদের জন্য এআই টিচার',
      'Md Fatin Hasnat AI',
      'Amar AI by Md. Fatin Hasnat',
      'আমার AI',
      'আমার এআই',
      'আমার AI বাংলাদেশ',
      'বাংলাদেশের আমার AI',
      'আমার AI টিউটর',
      'আমার AI শিক্ষা প্ল্যাটফর্ম',
      'আমার AI ফাতিন হাসনাত',
      'এআই টিচার আমার AI',
      'এআই টিউটর আমার AI',
      'আমার AI ছাত্রদের জন্য',
      'Amar AI ফাতিন হাসনাত',
      'বাংলাদেশের এআই টিউশন প্ল্যাটফর্ম'
    ],    
    authors: [{ name: 'Fatin Hasnat', url: 'https://fatinhasnat.com' }],
    creator: 'Fatin Hasnat',
    publisher: 'Amar AI',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://projectamarai.netlify.app'),
    alternates: {
      canonical: '/',
      languages: {
        en: '/en',
        bn: '/bn',
      },
    },
    openGraph: {
      title: title,
      description: description,
      url: 'https://projectamarai.netlify.app',
      siteName: 'Amar AI',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Amar AI - Personalized AI Tutoring Platform',
        },
      ],
      locale: language,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      creator: '@fatinhasnat',
      images: ['/twitter-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'bLrsx3IuAhc_bIXSJusw132L4c-AS3yId7WY28kgkTI',
      yandex: 'b8b1b8d8777f9e05',
      other: {
        'msvalidate.01': '3B97662FC895B98B755F57DD499ED5B6'
      }
    },
    category: 'education',
    classification: 'educational technology',
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const language = cookieStore.get('language')?.value || 'en';
  return (
    <html lang={language}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/logo_icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo_icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo_icons/favicon-16x16.png" />
        <link rel="manifest" href="/logo_icons/site.webmanifest" />
        <link rel="shortcut icon" href="/logo_icons/favicon.ico" />
        
        <meta name="application-name" content="Amar AI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Amar AI" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#fe5933" />
        
        <meta name="msapplication-TileColor" content="#fe5933" />
        <meta name="msapplication-config" content="/logo_icons/browserconfig.xml" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalApplication",
            "name": "Amar AI",
            "description": "Bangladesh's first AI tutoring platform where students can create unlimited private tutors for any topic, anytime, free.",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "BDT"
            },
            "author": {
              "@type": "Person",
              "name": "Md. Fatin Hasnat",
              "url": "https://fatinhasnat.com",
              "sameAs": [
                "https://github.com/TheCaptainCodes",
                "https://x.com/thefatinhasnat"
              ]
            }
          })
        }}
      />

      </head>
      <body className={`${bricolage.variable} antialiased flex flex-col w-full min-h-screen ${language === 'bn' ? 'lang-bn' : ''}`}>
        <NextTopLoader showSpinner={false} />
        <ClerkProvider appearance={{ variables: { colorPrimary: '#fe5933' } }} afterSignOutUrl="/">
          <LanguageProvider>
            <Navbar />
            <div className="flex flex-grow items-center justify-center w-full">
              {children}
            </div>
          </LanguageProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
