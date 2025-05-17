import os
from pdf2image import convert_from_path
import pytesseract
from tqdm import tqdm
import sys
import time

# Set Poppler path
POPPLER_PATH = r"C:\poppler-24.08.0\Library\bin"

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def process_pdf(pdf_path, txt_path):
    """Process a single PDF file and extract text"""
    try:
        print(f"\nProcessing: {os.path.basename(pdf_path)}")
        start_time = time.time()
        
        # Convert PDF to images with optimized settings for scanned PDFs
        pages = convert_from_path(
            pdf_path,
            dpi=200,  # Lower DPI for scanned PDFs
            poppler_path=POPPLER_PATH,
            thread_count=4,
            grayscale=True,  # Convert to grayscale for better OCR
            fmt='jpeg',  # Use JPEG format for better performance
            jpegopt={'quality': 85}  # Slightly reduced quality for better performance
        )
        
        print(f"Converted PDF to {len(pages)} pages in {time.time() - start_time:.2f} seconds")
        
        print("Extracting text from images...")
        text = ""
        for i, page in enumerate(pages, 1):
            print(f"Processing page {i}/{len(pages)}...")
            # Use optimized OCR settings
            page_text = pytesseract.image_to_string(
                page,
                lang="eng",
                config='--psm 6'  # Assume uniform text block
            )
            text += page_text + "\n"
            print(f"Completed page {i}/{len(pages)}")
        
        print("Saving text to file...")
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Successfully saved text to: {txt_path}")
        return True
        
    except Exception as e:
        print(f"Error processing {os.path.basename(pdf_path)}: {str(e)}")
        print("Full error details:", e.__class__.__name__)
        return False

def main():
    pdf_dir = "pdf_books"        # folder containing your scanned PDF files
    output_dir = "text_books"    # folder to save extracted .txt files
    os.makedirs(output_dir, exist_ok=True)

    print(f"Looking for PDF files in: {os.path.abspath(pdf_dir)}")
    pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith(".pdf")]
    total_files = len(pdf_files)
    
    if not pdf_files:
        print("No PDF files found! Please make sure your PDF files are completely downloaded and have .pdf extension")
        sys.exit(1)
    
    print(f"Found {total_files} PDF files to process")
    
    # Process each PDF file
    successful = 0
    failed = 0
    
    for i, filename in enumerate(pdf_files, 1):
        print(f"\nProcessing file {i} of {total_files}")
        pdf_path = os.path.join(pdf_dir, filename)
        txt_path = os.path.join(output_dir, filename.replace(".pdf", ".txt"))
        
        if process_pdf(pdf_path, txt_path):
            successful += 1
        else:
            failed += 1
    
    # Print summary
    print("\nProcessing complete!")
    print(f"Successfully processed: {successful} files")
    print(f"Failed to process: {failed} files")
    print(f"Total files processed: {total_files}")

if __name__ == "__main__":
    main()
