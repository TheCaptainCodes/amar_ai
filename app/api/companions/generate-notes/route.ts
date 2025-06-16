import { groq } from 'groq';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import mermaid from 'mermaid';
import { createSupabaseClient } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { name, subject, topic, style } = await req.json();
    
    // 1. Generate content with Groq Llama 4
    const prompt = `
      Create comprehensive study notes for ${topic} in ${subject}.
      Style: ${style}
      
      Include:
      1. Main concepts and explanations
      2. Key points to remember
      3. Mermaid.js diagrams for visual representation
      
      Format the response as:
      {
        "content": "main text content",
        "diagrams": [
          {
            "title": "diagram title",
            "mermaidCode": "mermaid diagram code"
          }
        ]
      }
    `;
    
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama2-70b-4096",
    });
    
    const notes = JSON.parse(response.choices[0].message.content);
    
    // 2. Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add title
    page.drawText(`${subject}: ${topic}`, {
      x: 50,
      y: page.getHeight() - 50,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });
    
    // Add content
    const contentLines = notes.content.split('\n');
    let yPosition = page.getHeight() - 100;
    
    for (const line of contentLines) {
      if (yPosition < 50) {
        // Add new page if we run out of space
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        yPosition = newPage.getHeight() - 50;
      }
      
      page.drawText(line, {
        x: 50,
        y: yPosition,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 20;
    }
    
    // Add diagrams
    for (const diagram of notes.diagrams) {
      if (yPosition < 200) {
        // Add new page for diagram
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        yPosition = newPage.getHeight() - 50;
      }
      
      // Add diagram title
      page.drawText(diagram.title, {
        x: 50,
        y: yPosition,
        size: 16,
        font,
        color: rgb(0, 0, 0),
      });
      
      yPosition -= 30;
      
      // Generate and add diagram
      const svg = await mermaid.render(diagram.title, diagram.mermaidCode);
      // TODO: Convert SVG to PDF and add to page
      // This requires additional SVG to PDF conversion logic
      
      yPosition -= 300; // Space for diagram
    }
    
    // 3. Save PDF to Supabase Storage
    const pdfBytes = await pdfDoc.save();
    const supabase = createSupabaseClient();
    
    const fileName = `${name}-${Date.now()}.pdf`;
    const { data: pdfData, error } = await supabase.storage
      .from('notes')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        cacheControl: '3600',
      });
    
    if (error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
    
    return Response.json({ 
      pdfUrl: fileName,
      success: true 
    });
    
  } catch (error) {
    console.error('Error generating notes:', error);
    return Response.json({ 
      error: 'Failed to generate notes',
      details: error.message 
    }, { status: 500 });
  }
} 