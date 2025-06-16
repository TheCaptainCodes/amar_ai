import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CompanionComponentProps {
    notes_url?: string;
    companionId: string;
}

const CompanionComponent: React.FC<CompanionComponentProps> = ({ notes_url, companionId }) => {
    const [notesUrl, setNotesUrl] = useState<string | undefined>(notes_url);

    const refreshNotesUrl = async () => {
        try {
            const response = await fetch(`/api/companions/${companionId}/refresh-notes`, {
                method: 'POST',
            });
            
            if (!response.ok) {
                throw new Error('Failed to refresh notes URL');
            }
            
            const data = await response.json();
            setNotesUrl(data.url);
        } catch (error) {
            console.error('Error refreshing notes URL:', error);
        }
    };

    const handleNotesClick = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!notesUrl) { // Ensure notesUrl exists
            console.error('Notes URL is not available.');
            return;
        }

        try {
            // Create a URL object to ensure it's treated as an absolute URL
            const absoluteNotesUrl = new URL(notesUrl);

            // Try to fetch the notes directly using the signed URL
            const response = await fetch(absoluteNotesUrl.toString());

            // If the URL has expired (404 or 403), refresh it
            if (response.status === 404 || response.status === 403) {
                console.log('Notes URL expired, refreshing...');
                await refreshNotesUrl();
                // After refreshing, the state will update, and the user can click again
            } else if (response.ok) {
                // If the URL is valid, open it in a new tab
                window.open(absoluteNotesUrl.toString(), '_blank');
            } else {
                 console.error('Error fetching notes with signed URL:', response.statusText);
                 // Handle other potential errors, maybe attempt refresh as a fallback
                 await refreshNotesUrl();
            }
        } catch (error) {
            console.error('Error accessing notes with signed URL:', error);
            // If there's an error (e.g., network issue), try refreshing the URL
            await refreshNotesUrl();
        }
    };

    return (
        <div>
            {notesUrl && (
                <Button
                    onClick={handleNotesClick}
                    variant="outline"
                    className="w-full"
                >
                    View Study Notes
                </Button>
            )}
        </div>
    );
};

export default CompanionComponent; 