import { createSupabaseClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const supabase = createSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from('notes')
      .download(params.filename);
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (!data) {
      return new NextResponse('PDF not found', { status: 404 });
    }
    
    // Convert the blob to an ArrayBuffer
    const arrayBuffer = await data.arrayBuffer();
    
    // Return the PDF with appropriate headers
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${params.filename}"`,
      },
    });
    
  } catch (error) {
    console.error('Error serving PDF:', error);
    return new NextResponse('Error serving PDF', { status: 500 });
  }
} 