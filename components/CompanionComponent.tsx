'use client';

import {useEffect, useRef, useState} from 'react'
import {cn, configureAssistant, getSubjectColor} from "@/lib/utils";
import {vapi} from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, {LottieRefCurrentProps} from "lottie-react";
import soundwaves from '@/constants/soundwaves.json'
import {addToSessionHistory} from "@/lib/actions/companion.actions";
import { Button } from "@/components/ui/button";
import { subjectBackgrounds } from '@/constants';

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

interface CompanionComponentProps {
    companionId: string;
    subject: string;
    topic: string;
    name: string;
    userName: string;
    userImage: string;
    style: string;
    voice: string;
    notes_url?: string;
}

const CompanionComponent = ({ companionId, subject, topic, name, userName, userImage, style, voice, notes_url }: CompanionComponentProps) => {
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState<SavedMessage[]>([]);

    const lottieRef = useRef<LottieRefCurrentProps>(null);

    useEffect(() => {
        if(lottieRef) {
            if(isSpeaking) {
                lottieRef.current?.play()
            } else {
                lottieRef.current?.stop()
            }
        }
    }, [isSpeaking, lottieRef])

    useEffect(() => {
        const onCallStart = async () => {
            setCallStatus(CallStatus.ACTIVE);
            await addToSessionHistory(companionId);
        };

        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED);
        }

        const onMessage = (message: Message) => {
            if(message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage= { role: message.role, content: message.transcript}
                setMessages((prev) => [newMessage, ...prev])
            }
        }

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);

        const onError = (error: Error) => console.log('Error', error);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('error', onError);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('error', onError);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
        }
    }, []);

    const toggleMicrophone = () => {
        const isMuted = vapi.isMuted();
        vapi.setMuted(!isMuted);
        setIsMuted(!isMuted)
    }

    const handleCall = async () => {
        try {
        setCallStatus(CallStatus.CONNECTING)

        const assistantOverrides = {
            variableValues: { subject, topic, style },
            clientMessages: ["transcript"],
            serverMessages: [],
        }

        // @ts-expect-error
            await vapi.start(configureAssistant(voice, style), assistantOverrides)
        } catch (error) {
            console.error('Error starting session:', error);
            setCallStatus(CallStatus.INACTIVE);
        }
    }

    const handleDisconnect = async () => {
        try {
            setCallStatus(CallStatus.FINISHED);
            await vapi.stop();
        } catch (error) {
            console.error('Error ending session:', error);
            // Even if there's an error, we want to mark the session as finished
            setCallStatus(CallStatus.FINISHED);
        }
    }

    return (
        <section className="flex flex-col md:flex-row overflow-visible">
            {/* Left Section: Companion Info + User Info/Controls + Session Button + Transcript */}
            <section className="flex flex-col w-full md:w-1/2 gap-4 p-4 border-r md:pr-4">

                {/* Top Area: Companion Info Box - takes upper vertical space and full width */}
                <div className="companion-section flex flex-col w-full relative rounded-lg overflow-hidden">
                    {/* Artistic Background Image */}
                    <Image
                      src={subjectBackgrounds[subject] || '/art/default-art.avif'} 
                      alt={`${subject} background`} // Use a more descriptive alt text
                      layout="fill"
                      objectFit="cover"
                      className="absolute top-0 left-0 w-full h-full z-0"
                      priority
                    />

                    {/* Dark Overlay */}
                    <div className="absolute top-0 left-0 w-full h-full bg-black/40 z-10" />

                    {/* Companion Avatar Box - takes full width of its container, fixed height, ensure content fits */}
                    <div className="relative z-20 h-[200px] flex items-center justify-center rounded-lg overflow-hidden w-full">
                        {/* Removed Subject Icon */}
                        {/*
                        <div
                            className={
                            cn(
                                'absolute inset-0 transition-opacity duration-1000 flex items-center justify-center',
                                callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE ? 'opacity-100' : 'opacity-0',
                                callStatus === CallStatus.CONNECTING && 'animate-pulse'
                            )
                        }>
                            {/* Make image smaller and centered, remove fill/object-contain from image, rely on parent centering */}
                            {/* <Image src={`/icons/${subject}.svg`} alt={subject} width={80} height={80} className="" /> */}
                        {/* </div>
                        */}

                        <div className={cn('absolute inset-0 transition-opacity duration-1000 flex items-center justify-center', callStatus === CallStatus.ACTIVE ? 'opacity-100': 'opacity-0')}>
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={soundwaves}
                                autoplay={false}
                                /* Make lottie smaller and centered, remove object-contain from style */
                                style={{ width: '150px', height: '150px' }}
                            />
                        </div>
                    </div>
                    {/* Centered Companion Name */}
                    <p className="font-bold text-center text-2xl absolute top-1/2 left-0 right-0 -translate-y-1/2 z-20 text-white">{name}</p>
                     {/* View Study Notes button visible only on small screens when PDF is not side-by-side */}
                    {!notes_url && (
                        <Button
                            onClick={() => window.open(`${notes_url}`, '_blank')}
                            className="mt-4 md:hidden w-full"
                        >
                            View Study Notes
                        </Button>
                    )}
                </div>

                {/* Bottom Area: User Info + Controls + Session Button - takes lower vertical space */}
                <div className="flex flex-col gap-4 w-full">
                    {/* User Info and Microphone Button side-by-side - equal height */}
                    <div className="flex gap-4 items-stretch">
                        {/* User Info Box (2/3 width, takes full height) */}
                        <div className="user-section flex flex-col items-center justify-center p-4 rounded-lg shadow-md w-2/3 flex-1">
                            <Image src={userImage} alt={userName} width={80} height={80} className="rounded-lg" />
                            <p className="font-bold text-center mt-1 text-lg">
                                {userName}
                            </p>
                        </div>
                         {/* Microphone Button Box (1/3 width, takes full height) */}
                        <button className="btn-mic flex flex-col items-center justify-center p-4 rounded-lg shadow-md w-1/3 flex-shrink-0 flex-1" onClick={toggleMicrophone} disabled={callStatus !== CallStatus.ACTIVE}>
                            <Image src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'} alt="mic" width={36} height={36} />
                            <p className="text-sm mt-1">
                                {isMuted ? 'Turn on microphone' : 'Turn off microphone'}
                            </p>
                        </button>
                    </div>

                     {/* Start/End Session Button (Below top row) */}
                     <button
                        className={cn(
                            'rounded-lg py-2 transition-colors w-full text-white',
                             callStatus === CallStatus.ACTIVE ? 'bg-red-700' : 'bg-primary',
                             callStatus === CallStatus.CONNECTING && 'animate-pulse',
                            callStatus === CallStatus.CONNECTING ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                        )}
                        onClick={callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall}
                        disabled={callStatus === CallStatus.CONNECTING}
                     >
                         {callStatus === CallStatus.ACTIVE
                         ? "End Session"
                         : callStatus === CallStatus.CONNECTING
                             ? 'Connecting'
                         : 'Start Session'
                         }
                     </button>
                </div>

                {/* Transcript Section - below companion/user info/controls/button */}
                <section className="transcript p-4 flex-1 overflow-y-auto">
                    <div className="transcript-message no-scrollbar">
                        {messages.map((message, index) => {
                            if(message.role === 'assistant') {
                                return (
                                    <p key={index} className="max-sm:text-sm">
                                        {
                                            name
                                                .split(' ')[0]
                                                .replace('/[.,]/g, ','')
                                        }: {message.content}
                                    </p>
                                )
                            } else {
                               return <p key={index} className="text-primary max-sm:text-sm">
                                    {userName}: {message.content}
                                </p>
                            }
                        })}
                    </div>

                    <div className="transcript-fade" />
                </section>
            </section>

            {/* PDF Viewer Section - takes half the width on wider screens, no vertical cutting */}
            {notes_url && (
                <section className="w-full md:w-1/2 p-4 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Study Notes</h2>
                    <div className="h-full">
                         {/* Using iframe to display PDF - allows vertical scrolling */}
                        <iframe src={notes_url} width="100%" height="100%" style={{ border: 'none' }}></iframe>
                    </div>
                </section>
            )}
        </section>
    )
}

export default CompanionComponent
