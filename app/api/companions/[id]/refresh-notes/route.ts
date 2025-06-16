import { refreshNotesUrl } from '@/lib/actions/companion.actions';
import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const signedUrl = await refreshNotesUrl(params.id);
        return NextResponse.json({ url: signedUrl });
    } catch (error) {
        console.error('Error refreshing notes URL:', error);
        return NextResponse.json(
            { error: 'Failed to refresh notes URL' },
            { status: 500 }
        );
    }
} 