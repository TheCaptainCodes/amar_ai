import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { subjectsColors, voices } from "@/constants";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSubjectColor = (subject: string) => {
  return subjectsColors[subject as keyof typeof subjectsColors];
};

export const configureAssistant = (voice: string, style: string) => {
  console.log('Configuring assistant with:', { voice, style });
  
  // Validate voice type
  if (!['male', 'female'].includes(voice)) {
    console.error('Invalid voice type:', voice);
    throw new Error(`Invalid voice type: ${voice}. Must be either 'male' or 'female'`);
  }

  // Validate style type
  if (!['casual', 'professional'].includes(style)) {
    console.error('Invalid style type:', style);
    throw new Error(`Invalid style type: ${style}. Must be either 'casual' or 'professional'`);
  }

  const voiceConfig = voices[voice as 'male' | 'female'];
  if (!voiceConfig) {
    console.error('Voice configuration not found:', voice);
    throw new Error(`Voice configuration not found for: ${voice}`);
  }

  const voiceId = voiceConfig[style as 'casual' | 'professional'];
  if (!voiceId) {
    console.error('Voice ID not found for style:', { voice, style });
    throw new Error(`Voice ID not found for voice: ${voice} and style: ${style}`);
  }

  console.log('Using voice ID:', voiceId);

  const vapiAssistant: CreateAssistantDTO = {
    name: "Companion",
    firstMessage:
        "Hello, let's start the session. Today we'll be talking about {{topic}}.",
    transcriber: {
      provider: "deepgram",
      model: "nova-3",
      language: "en",
    },
    voice: {
      provider: "11labs",
      voiceId: voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a highly knowledgeable tutor teaching a real-time voice session with a student. Your goal is to teach the student about the topic and subject.

                    Tutor Guidelines:
                    Stick to the given topic - {{ topic }} and subject - {{ subject }} and teach the student about it.
                    Keep the conversation flowing smoothly while maintaining control.
                    From time to time make sure that the student is following you and understands you.
                    Break down the topic into smaller parts and teach the student one part at a time.
                    Keep your style of conversation {{ style }}.
                    Keep your responses short, like in a real voice conversation.
                    Do not include any special characters in your responses - this is a voice conversation.
              `,
        },
      ],
    },
    clientMessages: [],
    serverMessages: [],
  };
  return vapiAssistant;
};
