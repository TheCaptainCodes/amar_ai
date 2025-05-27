'use server';

import {auth} from "@clerk/nextjs/server";
import {createSupabaseClient} from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Groq } from "groq-sdk";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import * as fs from 'fs/promises'; // Import fs for reading font file
import * as fontkit from 'fontkit'; // Import fontkit using wildcard

// Helper function to filter out characters not supported by WinAnsi encoding
// Basic implementation: keep printable ASCII and replace others with '?'.
// WinAnsi supports more, but this prevents common errors like Unicode symbols.
/*
const filterUnsupportedChars = (text: string): string => {
    let cleanedText = '';
    // Printable ASCII range (32 to 126) are generally safe for StandardFonts
    // We might include some common extended characters later if needed, but this is a start
    const supportedCharsRegex = /[\x20-\x7E]/;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '\n' || supportedCharsRegex.test(char)) {
            cleanedText += char;
        } else {
            cleanedText += '?';
        }
    }
    return cleanedText;
};
*/

export const createCompanion = async (formData: CreateCompanion) => {
    const { userId: author } = await auth();
    if (!author) {
        throw new Error("User not authenticated");
    }

    const supabase = createSupabaseClient();

    // Create the companion first
    const { data, error } = await supabase
        .from('companions')
        .insert({
            ...formData,
            author,
            generate_notes: formData.generate_notes || false,
            note_style: formData.note_style || 'detailed'
        })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    const companion = data[0];

    // If note generation is requested, generate and store the notes
    if (formData.generate_notes) {
        try {
            // Initialize Groq client only when needed
            const groq = new Groq({
                apiKey: process.env.GROQ_API_KEY || '',
            });

            // Generate content using Groq
            const prompt = `Create comprehensive study notes for ${formData.topic} in ${formData.subject}. 
            Include:
            1. Main concepts and definitions
            2. Key points and examples
            Style: ${formData.note_style || 'detailed'}`;

            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                temperature: 0.7,
                max_tokens: 2048,
            });

            const content = completion.choices[0]?.message?.content;
            if (!content) throw new Error("Failed to generate content");

            // Filter out unsupported characters before processing
            // const filteredContent = filterUnsupportedChars(content);
            const filteredContent = content; // Use original content with full Unicode support

            // Create PDF using pdf-lib
            const pdfDoc = await PDFDocument.create();

            // Register fontkit with PDFDocument
            pdfDoc.registerFontkit(fontkit as any);

            let page = pdfDoc.addPage();
            const { width, height } = page.getSize();

            // Load and embed DejaVu fonts
            const fontBytes = await fs.readFile('./fonts/ttf/DejaVuSans.ttf');
            const boldFontBytes = await fs.readFile('./fonts/ttf/DejaVuSans-Bold.ttf');

            const font = await pdfDoc.embedFont(fontBytes);
            const boldFont = await pdfDoc.embedFont(boldFontBytes);

            let y = height - 50; // Start position from top
            const margin = 50; // Page margin
            const contentWidth = width - 2 * margin;
            const lineHeight = 18; // Base line height

            // Add title
            page.drawText(formData.topic, {
                x: margin,
                y: y,
                size: 24,
                font: boldFont, // Use bold font for title
                color: rgb(0, 0.2, 0.8), // A nice blue color
            });
            y -= 40; // Move down after title

            // Process and draw content line by line
            const lines = filteredContent.split('\n');

            for (const line of lines) {
                 if (y < margin) { // Check if enough space for the next line
                    page = pdfDoc.addPage();
                    y = height - margin; // Reset y for new page
                }

                let textToDraw = line;
                let currentFont = font; // Use Standard Helvetica by default
                let currentSize = 12;
                let x = margin;
                let color = rgb(0, 0, 0); // Default color
                let moveY = true; // Flag to control if we move y after drawing

                // Basic Markdown-like parsing
                if (line.startsWith('### ')) {
                    textToDraw = line.substring(4);
                    currentSize = 16;
                    currentFont = boldFont; // Use bold font for subheadings
                    color = rgb(0.1, 0.4, 0.1); // Green color for subheadings
                    // Simple text drawing for headings - no wrapping for now
                     page.drawText(textToDraw, { x, y, size: currentSize, font: currentFont, color });
                    y -= (currentSize + 10);
                    moveY = false;
                } else if (line.startsWith('## ')) {
                    textToDraw = line.substring(3);
                    currentSize = 18;
                    currentFont = boldFont; // Use bold font for headings
                     color = rgb(0.6, 0.3, 0); // Orange color for headings
                     page.drawText(textToDraw, { x, y, size: currentSize, font: currentFont, color });
                    y -= (currentSize + 10);
                    moveY = false;
                } else if (line.startsWith('# ')) {
                    textToDraw = line.substring(2);
                    currentSize = 20;
                    currentFont = boldFont; // Use bold font for main headings
                     color = rgb(0.8, 0, 0); // Red color for main headings
                     page.drawText(textToDraw, { x, y, size: currentSize, font: currentFont, color });
                    y -= (currentSize + 15);
                    moveY = false;
                } else if (line.startsWith('* ') || line.startsWith('+ ') || line.startsWith('- ')) {
                     // Simple list item - now with wrapping
                     const listItemPrefix = '  • ';
                     const listItemText = line.substring(2).trim();
                     const listItemIndent = margin + 15; // Indent list items
                     const listItemWidth = width - listItemIndent - margin; // Available width for list item text

                     const words = listItemText.split(' ');
                     let currentLineSegment = listItemPrefix;
                     let currentX = margin;

                     // Draw the list item prefix first
                      if (y < margin) { // Check if enough space for the next line before drawing
                         page = pdfDoc.addPage();
                         y = height - margin; // Reset y for new page
                     }
                     page.drawText(listItemPrefix, { x: margin, y, size: currentSize, font: currentFont, color });
                     currentX += currentFont.widthOfTextAtSize(listItemPrefix, currentSize);

                     for (const word of words) {
                         const testLine = currentLineSegment === listItemPrefix ? listItemPrefix + word : currentLineSegment + ' ' + word;
                         const testLineWidth = currentFont.widthOfTextAtSize(testLine, currentSize);

                         if (currentX + currentFont.widthOfTextAtSize(' ' + word, currentSize) > width - margin) { // Check against right margin
                             // Draw the current segment line if it exceeds the width
                              if (y < margin) { // Check if enough space for the next line before drawing
                                 page = pdfDoc.addPage();
                                 y = height - margin; // Reset y for new page
                                 currentX = margin; // Reset x for new page
                             }
                              page.drawText(currentLineSegment.substring(listItemPrefix.length), { x: listItemIndent, y, size: currentSize, font: currentFont, color }); // Draw from indent
                              y -= (currentSize + 5); // Use slightly smaller line height for list items
                             currentX = listItemIndent + currentFont.widthOfTextAtSize(word, currentSize); // Start a new line segment with the current word at indent
                             currentLineSegment = listItemPrefix + word; // Reset current line segment with prefix and word
                         } else {
                             // Add the word to the current line segment
                             currentLineSegment = testLine;
                              currentX += currentFont.widthOfTextAtSize(' ' + word, currentSize);
                         }
                     }

                     // Draw any remaining text in the current line segment
                      if (currentLineSegment !== listItemPrefix) { // Only draw if there's text after the prefix
                          if (y < margin) { // Check if enough space for the next line before drawing
                            page = pdfDoc.addPage();
                            y = height - margin; // Reset y for new page
                            currentX = margin; // Reset x for new page
                         }
                          page.drawText(currentLineSegment.substring(listItemPrefix.length), { x: listItemIndent, y, size: currentSize, font: currentFont, color }); // Draw from indent
                          y -= (currentSize + 5); // Use slightly smaller line height for list items
                     }
                     moveY = false;
                } else if (line.trim() === '') {
                    // Smaller gap for empty lines
                    y -= 10;
                } else {
                    // Process and draw regular text, handling bold markdown and wrapping
                    // Split the line into parts based on bold markdown (**) while keeping the delimiters
                    const parts = line.split(/(\*{2}[^\*]+\*{2})/g);
                    let currentX = margin;

                    for (const part of parts) {
                        let textSegment = part;
                        let segmentFont = currentFont;

                        if (part.startsWith('**') && part.endsWith('**')) {
                            // This is a bold segment, remove markdown and use bold font
                            textSegment = part.substring(2, part.length - 2);
                            segmentFont = boldFont;
                        }
                        // For non-bold parts or after processing bold parts, handle wrapping
                        const words = textSegment.split(' ');
                        let currentLineSegment = '';

                        for (const word of words) {
                            const testLine = currentLineSegment === '' ? word : currentLineSegment + ' ' + word;
                            const testLineWidth = segmentFont.widthOfTextAtSize(testLine, currentSize);

                            if (currentX + testLineWidth > width - margin) {
                                // Draw the current segment line if it exceeds the width
                                if (y < margin) {
                                    page = pdfDoc.addPage();
                                    y = height - margin;
                                    currentX = margin; // Reset x for new page
                                }
                                page.drawText(currentLineSegment, {
                                    x: currentX,
                                    y,
                                    size: currentSize,
                                    font: segmentFont,
                                    color: color,
                                });
                                y -= lineHeight;
                                currentX = margin; // Start a new line at the left margin
                                currentLineSegment = word; // Start a new line segment with the current word
                            } else {
                                // Add the word to the current line segment
                                currentLineSegment = testLine;
                            }
                        }

                        // Draw any remaining text in the current line segment
                        if (currentLineSegment) {
                            if (y < margin) {
                                page = pdfDoc.addPage();
                                y = height - margin;
                                currentX = margin; // Reset x for new page
                            }
                            page.drawText(currentLineSegment, {
                                x: currentX,
                                y,
                                size: currentSize,
                                font: segmentFont,
                                color: color,
                            });
                            currentX += segmentFont.widthOfTextAtSize(currentLineSegment, currentSize) + segmentFont.widthOfTextAtSize(' ', currentSize); // Move x for the next segment, adding space
                        }
                    }
                     y -= lineHeight; // Move to the next line after processing all segments of the original line
                }
            }

            // Convert to bytes
            const pdfBytes = await pdfDoc.save();

            // Upload to Supabase Storage
            const filename = `${formData.name}-${Date.now()}.pdf`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('notes')
                .upload(filename, pdfBytes, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (uploadError) throw new Error(uploadError.message);

            // Get a signed URL that expires in 1 week
            const { data, error: urlError } = await supabase.storage
                .from('notes')
                .createSignedUrl(filename, 60 * 60 * 24 * 7); // 1 week in seconds

            if (urlError || !data?.signedUrl) { // Add check for data existence
                throw new Error(urlError?.message || 'Failed to generate signed URL');
            }

            const signedUrl = data.signedUrl;

            // Update companion with notes URL
            const { error: updateError } = await supabase
                .from('companions')
                .update({ notes_url: signedUrl })
                .eq('id', companion.id);

            if (updateError) throw new Error(updateError.message);
        } catch (error) {
            console.error('Error generating notes:', error);
            // Continue with companion creation even if note generation fails
        }
    }

    return companion;
}

export const getAllCompanions = async ({ limit = 10, page = 1, subject, topic }: GetAllCompanions) => {
    const supabase = createSupabaseClient();

    let query = supabase.from('companions').select();

    if(subject && topic) {
        query = query.ilike('subject', `%${subject}%`)
            .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    } else if(subject) {
        query = query.ilike('subject', `%${subject}%`)
    } else if(topic) {
        query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`)
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: companions, error } = await query;

    if(error) throw new Error(error.message);

    return companions;
}

export const getCompanion = async (id: string) => {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('id', id);

    if(error) return console.log(error);

    return data[0];
}

export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from('session_history')
        .insert({
            companion_id: companionId,
            user_id: userId,
        })

    if(error) throw new Error(error.message);

    return data;
}

export const getRecentSessions = async (limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId)

    if(error) throw new Error(error.message);

    return data;
}

// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: userId,
  });
  if (error) {
    throw new Error(error.message);
  }
  // Revalidate the path to force a re-render of the page

  revalidatePath(path);
  return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};

// It's almost the same as getUserCompanions, but it's for the bookmarked companions
export const getBookmarkedCompanions = async (userId: string) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`companions:companion_id (*)`) // Notice the (*) to get all the companion data
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  // We don't need the bookmarks data, so we return only the companions
  return data.map(({ companions }) => companions);
};

export const refreshNotesUrl = async (companionId: string) => {
    const supabase = createSupabaseClient();
    
    // Get the companion to find the filename
    const { data: companion, error: companionError } = await supabase
        .from('companions')
        .select('notes_url')
        .eq('id', companionId)
        .single();
        
    if (companionError || !companion?.notes_url) {
        throw new Error('Companion not found or no notes URL exists');
    }
    
    // Extract filename from the URL
    const filename = companion.notes_url.split('/').pop()?.split('?')[0];
    if (!filename) {
        throw new Error('Invalid notes URL format');
    }
    
    // Generate new signed URL
    const { data, error: urlError } = await supabase.storage
        .from('notes')
        .createSignedUrl(filename, 60 * 60 * 24 * 7); // 1 week in seconds
        
    if (urlError || !data?.signedUrl) { // Add check for data existence
        throw new Error(urlError?.message || 'Failed to generate new signed URL');
    }
    
    const signedUrl = data.signedUrl;

    // Update companion with new URL
    const { error: updateError } = await supabase
        .from('companions')
        .update({ notes_url: signedUrl })
        .eq('id', companionId);
        
    if (updateError) {
        throw new Error('Failed to update notes URL');
    }
    
    return signedUrl;
};
