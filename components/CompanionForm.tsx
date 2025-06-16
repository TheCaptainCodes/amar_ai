"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, SubmitHandler } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {subjects} from "@/constants";
import {Textarea} from "@/components/ui/textarea";
import {createCompanion} from "@/lib/actions/companion.actions";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useLanguage } from '@/hooks/useLanguage';

const formSchema = z.object({
    name: z.string().min(1, { message: 'Companion is required.'}),
    subject: z.string().min(1, { message: 'Subject is required.'}),
    topic: z.string().min(1, { message: 'Topic is required.'}),
    voice: z.string().min(1, { message: 'Voice is required.'}),
    style: z.string().min(1, { message: 'Style is required.'}),
    duration: z.coerce.number().min(1, { message: 'Duration is required.'}),
    generate_notes: z.boolean().optional(),
    note_style: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>;

const CompanionForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { t } = useLanguage();
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            subject: '',
            topic: '',
            voice: '',
            style: '',
            duration: 15,
            generate_notes: true,
            note_style: 'detailed',
        },
    })

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        try {
            setIsLoading(true);
            const companion = await createCompanion(values);

            if(companion) {
                router.push(`/companions/${companion.id}`);
            } else {
                console.log('Failed to create a companion');
                router.push('/');
            }
        } catch (error) {
            console.error('Error creating companion:', error);
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full max-w-xl bg-white p-8 rounded-lg shadow-md mx-auto md:mx-0">
            <h1 className="text-2xl font-bold text-left mb-6">{t('companionBuilder')}</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control as any}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('companionName')}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('enterCompanionName')}
                                        {...field}
                                        className="input"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('subject')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectASubject')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subjects.map((subject) => (
                                            <SelectItem key={subject} value={subject}>
                                                {t(subject as any)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="topic"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('topic')}</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('enterTopic')}
                                        {...field}
                                        className="input"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="voice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('voice')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectAVoice')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="male">{t('male')}</SelectItem>
                                        <SelectItem value="female">{t('female')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="style"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('personality')}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t('selectAPersonality')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="professional">{t('professional')}</SelectItem>
                                        <SelectItem value="casual">{t('casual')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{t('duration')} ({t('minutes')})</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        placeholder={t('enterDuration')}
                                        {...field}
                                        className="input"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control as any}
                        name="generate_notes"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        {t('generateStudyNotes')}
                                    </FormLabel>
                                    <FormDescription>
                                        {t('generateStudyNotesDesc')}
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    {form.watch('generate_notes') && (
                        <FormField
                            control={form.control as any}
                            name="note_style"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('noteStyle')}</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('selectANoteStyle')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="detailed">{t('detailed')}</SelectItem>
                                            <SelectItem value="concise">{t('concise')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <Button
                        type="submit" 
                        className="w-full btn-primary"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                {t('buildingCompanion')}
                            </>
                        ) : (
                            t('createCompanion')
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export default CompanionForm
