# PDF to Text Converter

This script converts PDF files (especially scanned PDFs) to text files using OCR (Optical Character Recognition).

## Prerequisites

Before running the script, you need to install the following:

### 1. Python Dependencies
Install the required Python packages:
```bash
pip install pdf2image pytesseract tqdm
```

### 2. Tesseract OCR
1. Download this: https://github.com/tesseract-ocr/tesseract/releases/tag/5.5.0
3. Run the installer
4. **Important**: During installation:
   - Remember the installation path (default is `C:\Program Files\Tesseract-OCR`)
   - Check the box to add Tesseract to your system PATH
   - Or go to environment variables and add the path to Path

### 3. Poppler
1. Download Poppler for Windows from: https://github.com/oschwartz10612/poppler-windows/releases/
2. Download the latest release (e.g., `Release-24.08.0-0`)
3. Extract the downloaded zip file
4. Move the extracted folder to `C:\poppler-24.08.0` (or update the path in the script)

## Directory Structure
Create the following folder structure:
```
pdf_to_text/
├── main.py
├── pdf_books/     # Put your PDF files here
└── text_books/    # Extracted text files will be saved here
```

## Configuration
The script uses these default paths:
- Tesseract: `C:\Program Files\Tesseract-OCR\tesseract.exe`
- Poppler: `C:\poppler-24.08.0\Library\bin`

If you installed these tools in different locations, update the paths in `main.py`:
```python
# Set Poppler path
POPPLER_PATH = r"C:\poppler-24.08.0\Library\bin"

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
```

## Usage
1. Place your PDF files in the `pdf_books` folder
2. Run the script:
```bash
python main.py
```
3. The extracted text files will be saved in the `text_books` folder

## Troubleshooting

### If Tesseract is not found:
- Make sure Tesseract is installed correctly
- Verify the path in the script matches your installation
- Try adding Tesseract to your system PATH manually:
  1. Open System Properties (Win + Pause/Break)
  2. Click "Advanced system settings"
  3. Click "Environment Variables"
  4. Under "System variables", find and select "Path"
  5. Click "Edit"
  6. Click "New"
  7. Add `C:\Program Files\Tesseract-OCR`
  8. Click "OK" on all windows

### If Poppler is not found:
- Make sure Poppler is extracted to the correct location
- Verify the path in the script matches your Poppler installation
- Try adding Poppler's bin directory to your system PATH:
  1. Follow the same steps as above
  2. Add `C:\poppler-24.08.0\Library\bin` to the Path

### If PDF conversion fails:
- Make sure your PDF files are not corrupted
- Try with a smaller PDF file first
- Check if you have enough free memory on your system

## Notes
- The script processes PDFs at 200 DPI for better performance
- It uses grayscale conversion for better OCR accuracy
- Multi-threading is enabled for faster processing
- Progress is shown for each file and page
- A summary is provided at the end showing successful and failed conversions 