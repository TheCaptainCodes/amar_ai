import os
import json
import groq
import re
import time
from typing import Dict, List, Tuple, Optional
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize Groq client
client = groq.Client(api_key=os.getenv("GROQ_API_KEY"))

def log_progress(message: str):
    """
    Log progress with timestamp
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

def save_progress(output_file: str, processed_chunks: List[int]) -> bool:
    """
    Save progress of processed chunks to a progress file
    """
    progress_file = f"{output_file}.progress"
    try:
        with open(progress_file, 'w') as f:
            json.dump({"processed_chunks": processed_chunks}, f)
        return True
    except Exception as e:
        log_progress(f"Error saving progress: {str(e)}")
        return False

def load_progress(output_file: str) -> List[int]:
    """
    Load progress of processed chunks from progress file
    """
    progress_file = f"{output_file}.progress"
    if os.path.exists(progress_file):
        try:
            with open(progress_file, 'r') as f:
                data = json.load(f)
                return data.get("processed_chunks", [])
        except Exception as e:
            log_progress(f"Error loading progress: {str(e)}")
    return []

def chunk_text(text: str, max_chunk_size: int = 4000) -> List[str]:
    """
    Split text into chunks based on topics and sections, trying to keep related content together.
    """
    # First split by major sections (chapters, topics)
    sections = []
    current_section = []
    current_size = 0
    
    # Split by lines to analyze content
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if this is a new section/topic
        is_new_section = any([
            re.match(r'^Chapter\s+\w+', line, re.IGNORECASE),
            re.match(r'^\d+\.\d+\s+[A-Za-z]', line),  # Topic numbers like 1.1
            re.match(r'^Unit\s+\w+', line, re.IGNORECASE),
            re.match(r'^Lesson\s+\d+', line, re.IGNORECASE),
            re.match(r'^[A-Z][A-Za-z\s]+:', line),  # Headers ending with colon
            re.match(r'^\d+\.\s+[A-Z]', line),  # Numbered sections
        ])
        
        if is_new_section and current_section:
            # Join current section and add to sections
            section_text = '\n'.join(current_section)
            if len(section_text.strip()) > 100:  # Minimum content length
                sections.append(section_text)
            current_section = []
            current_size = 0
        
        current_section.append(line)
        current_size += len(line)
        
        # If current section is too large, split it
        if current_size > max_chunk_size:
            # Try to split at paragraph boundaries
            section_text = '\n'.join(current_section)
            paragraphs = section_text.split('\n\n')
            
            current_chunk = []
            current_chunk_size = 0
            
            for para in paragraphs:
                if current_chunk_size + len(para) > max_chunk_size and current_chunk:
                    # Join current chunk and add to sections
                    chunk_text = '\n\n'.join(current_chunk)
                    if len(chunk_text.strip()) > 100:
                        sections.append(chunk_text)
                    current_chunk = []
                    current_chunk_size = 0
                
                current_chunk.append(para)
                current_chunk_size += len(para)
            
            # Add remaining chunk if any
            if current_chunk:
                chunk_text = '\n\n'.join(current_chunk)
                if len(chunk_text.strip()) > 100:
                    sections.append(chunk_text)
            
            current_section = []
            current_size = 0
    
    # Add the last section if any
    if current_section:
        section_text = '\n'.join(current_section)
        if len(section_text.strip()) > 100:
            sections.append(section_text)
    
    log_progress(f"Split text into {len(sections)} topic-based chunks")
    return sections

def extract_metadata_from_text(text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Extract chapter number, chapter title, and topic from the text content.
    Handles multiple formats:
    1. "Chapter One\nPhysical Quantities and Their Measurements"
    2. "Unit One\nGood citizens"
    3. "Lesson 1: Can you live alone?"
    4. "1.1 Scope of physics"
    5. "1.2 Topic name"
    """
    # Try different patterns to find chapter information
    chapter_patterns = [
        r'Chapter\s+(\d+|[A-Za-z]+)[\s:]+(.*?)(?=\n|$)',  # Chapter 1: Title or Chapter One: Title
        r'Unit\s+(\d+|[A-Za-z]+)[\s:]+(.*?)(?=\n|$)',     # Unit 1: Title or Unit One: Title
        r'Lesson\s+(\d+)[\s:]+(.*?)(?=\n|$)'              # Lesson 1: Title
    ]
    
    chapter_number = None
    chapter_title = None
    
    for pattern in chapter_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            chapter_number = match.group(1)
            chapter_title = match.group(2).strip()
            break
    
    # Try different patterns to find topic information
    topic_patterns = [
        r'(\d+\.\d+)\s+([A-Za-z\s]+)(?=\n|$)',           # 1.1 Scope of physics
        r'(\d+\.\d+)[\s:]+([A-Za-z\s]+)(?=\n|$)',        # 1.1: Scope of physics
        r'(\d+\.\d+)\s*([A-Za-z\s]+)(?=\n|$)',           # 1.1Scope of physics
        r'Topic\s+(\d+)[\s:]+(.*?)(?=\n|$)',              # Topic 1: Title
        r'Section\s+(\d+)[\s:]+(.*?)(?=\n|$)'             # Section 1: Title
    ]
    
    topic_number = None
    topic_title = None
    
    for pattern in topic_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            topic_number = match.group(1)
            topic_title = match.group(2).strip()
            break
    
    # If no topic number found but we have a chapter number, use that
    if not topic_number and chapter_number:
        topic_number = chapter_number
    
    # Combine topic number and title if both exist
    topic = f"{topic_number} {topic_title}" if topic_number and topic_title else topic_title or ""
    
    log_progress(f"Extracted metadata - Chapter: {chapter_number} ({chapter_title}), Topic: {topic}")
    return chapter_number, chapter_title, topic

def generate_questions_for_topic(topic_text: str, metadata: Dict, output_file: str) -> List[Dict]:
    """
    Generate questions for a given topic using Groq AI and save in real-time.
    """
    # Split text into smaller chunks
    chunks = chunk_text(topic_text)
    all_questions = []
    
    # Load progress of previously processed chunks
    processed_chunks = load_progress(output_file)
    log_progress(f"Found {len(processed_chunks)} previously processed chunks")
    
    for i, chunk in enumerate(chunks, 1):
        # Skip if chunk was already processed
        if i in processed_chunks:
            log_progress(f"Skipping already processed chunk {i}/{len(chunks)}")
            continue
            
        log_progress(f"Processing chunk {i}/{len(chunks)}")
        log_progress(f"Chunk size: {len(chunk)} characters")
        log_progress(f"Chunk preview: {chunk[:200]}...")
        
        # Check if this chunk contains exercises or examples
        has_exercises = bool(re.search(r'(?:Example|Exercise|Problem|Question)\s+\d+', chunk, re.IGNORECASE))
        
        prompt = f"""Generate 2-3 educational questions and answers in pure JSON format. No additional text or explanations.
        
        {'For exercises and examples, focus on explaining the solution method and steps rather than specific numbers. Include textbook solutions if available.' if has_exercises else 'Focus on key concepts and understanding.'}
        
        Format:
        [
            {{
                "instruction": "Question here",
                "input": "",
                "output": "Detailed answer here",
                "metadata": {{
                    "class": "{metadata['class']}",
                    "subject": "{metadata['subject']}",
                    "book": "{metadata['book']}",
                    "chapter": "{metadata['chapter']}",
                    "chapter_title": "{metadata['chapter_title']}",
                    "topic": "{metadata['topic']}"
                }}
            }}
        ]

        Topic Text:
        {chunk}
        """
        
        max_retries = 3
        retry_delay = 60  # seconds
        
        for retry in range(max_retries):
            try:
                log_progress("Sending request to Groq AI...")
                response = client.chat.completions.create(
                    model="meta-llama/llama-4-scout-17b-16e-instruct",
                    messages=[
                        {"role": "system", "content": "You are a JSON generator. Return only valid JSON arrays containing question-answer pairs. For exercises, explain solution methods rather than specific numbers. No additional text or explanations."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1000
                )
                
                # Parse the response and extract the JSON objects
                content = response.choices[0].message.content.strip()
                log_progress(f"Raw response from Groq: {content[:200]}...")
                
                # Clean up the response content
                content = content.replace('\n', ' ').replace('\r', '')
                
                # Find JSON array
                start_idx = content.find('[')
                end_idx = content.rfind(']') + 1
                
                if start_idx != -1 and end_idx != -1:
                    try:
                        json_str = content[start_idx:end_idx]
                        chunk_questions = json.loads(json_str)
                        
                        if isinstance(chunk_questions, list):
                            all_questions.extend(chunk_questions)
                            log_progress(f"Generated {len(chunk_questions)} questions for chunk {i}")
                            
                            # Save questions in real-time after each chunk
                            if save_questions_to_file(output_file, chunk_questions, all_questions[:-len(chunk_questions)]):
                                log_progress(f"Saved questions to {output_file}")
                                # Mark chunk as processed
                                processed_chunks.append(i)
                                save_progress(output_file, processed_chunks)
                            else:
                                log_progress(f"Failed to save questions for chunk {i}")
                        else:
                            log_progress(f"Invalid response format for chunk {i}")
                    except json.JSONDecodeError as e:
                        log_progress(f"JSON decode error for chunk {i}: {str(e)}")
                        log_progress(f"Problematic JSON: {json_str[:200]}...")
                else:
                    log_progress(f"No valid JSON array found in response for chunk {i}")
                
                # If we get here, the request was successful
                break
                
            except Exception as e:
                error_msg = str(e)
                log_progress(f"Error generating questions for chunk {i}: {error_msg}")
                
                # Check if it's a rate limit error
                if "rate_limit_exceeded" in error_msg.lower():
                    if retry < max_retries - 1:
                        wait_time = retry_delay * (retry + 1)  # Exponential backoff
                        log_progress(f"Rate limit reached. Waiting {wait_time} seconds before retry...")
                        time.sleep(wait_time)
                        continue
                    else:
                        log_progress("Max retries reached for rate limit. Saving progress and exiting.")
                        save_progress(output_file, processed_chunks)
                        return all_questions
                else:
                    # For other errors, wait a bit and retry
                    if retry < max_retries - 1:
                        wait_time = 5 * (retry + 1)
                        log_progress(f"Error occurred. Waiting {wait_time} seconds before retry...")
                        time.sleep(wait_time)
                        continue
                    else:
                        log_progress(f"Max retries reached for chunk {i}. Moving to next chunk.")
                        break
    
    log_progress(f"Total questions generated: {len(all_questions)}")
    return all_questions

def save_questions_to_file(output_file: str, questions: List[Dict], existing_data: List[Dict] = None) -> bool:
    """
    Save questions to a JSON file with atomic operations to prevent data loss.
    Returns True if successful, False otherwise.
    """
    try:
        # Prepare the data to save
        data_to_save = existing_data + questions if existing_data is not None else questions
        
        # Create a temporary file
        temp_file = f"{output_file}.tmp"
        
        # Write to temporary file first
        with open(temp_file, 'w', encoding='utf-8') as f:
            json.dump(data_to_save, f, indent=2, ensure_ascii=False)
        
        # If we get here, the write was successful, so replace the original file
        if os.path.exists(output_file):
            os.replace(temp_file, output_file)
        else:
            os.rename(temp_file, output_file)
            
        log_progress(f"Successfully saved {len(data_to_save)} questions to {output_file}")
        return True
        
    except Exception as e:
        log_progress(f"Error saving to {output_file}: {str(e)}")
        # Try to clean up temp file if it exists
        if os.path.exists(temp_file):
            try:
                os.remove(temp_file)
            except:
                pass
        return False

def process_topic_file(file_path: str, output_dir: str):
    """
    Process a topic file and generate training data.
    """
    log_progress(f"\nProcessing file: {file_path}")
    
    # Extract subject name from file path
    subject_name = os.path.basename(file_path).replace('.txt', '')
    log_progress(f"Subject: {subject_name}")
    
    # Read the topic file
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            topic_text = f.read()
        log_progress(f"Read {len(topic_text)} characters from file")
    except Exception as e:
        log_progress(f"Error reading file {file_path}: {str(e)}")
        return
    
    # Extract metadata from text content
    chapter_number, chapter_title, topic = extract_metadata_from_text(topic_text)
    
    # Extract class from file path
    path_parts = file_path.split(os.sep)
    class_name = path_parts[-2]  # class folder
    
    # Create metadata
    metadata = {
        "class": class_name,
        "subject": subject_name,
        "book": f"NCTB {class_name} {subject_name}",  # Assuming NCTB books
        "chapter": chapter_number or "",
        "chapter_title": chapter_title or "",
        "topic": topic or ""
    }
    
    # Initialize output file path
    output_file = os.path.join(output_dir, f"{subject_name.lower()}.json")
    
    # Load existing data if file exists
    existing_data = []
    if os.path.exists(output_file):
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
            log_progress(f"Loaded {len(existing_data)} existing questions from {output_file}")
        except json.JSONDecodeError as e:
            log_progress(f"Error reading existing JSON file: {str(e)}")
            # Create backup of corrupted file with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = f"{output_file}.{timestamp}.bak"
            try:
                # If backup already exists, remove it
                if os.path.exists(backup_file):
                    os.remove(backup_file)
                os.rename(output_file, backup_file)
                log_progress(f"Created backup of corrupted file at {backup_file}")
            except Exception as backup_error:
                log_progress(f"Error creating backup: {str(backup_error)}")
                # If backup fails, try to remove the corrupted file
                try:
                    os.remove(output_file)
                    log_progress(f"Removed corrupted file {output_file}")
                except Exception as remove_error:
                    log_progress(f"Error removing corrupted file: {str(remove_error)}")
    
    # Generate questions and save in real-time
    generate_questions_for_topic(topic_text, metadata, output_file)

def is_book_completely_processed(json_file: str, txt_file: str) -> bool:
    """
    Check if the book has been completely processed by comparing the last question's metadata
    with the book's content.
    """
    try:
        # Read the last question from JSON file
        with open(json_file, 'r', encoding='utf-8') as f:
            questions = json.load(f)
            if not questions:
                return False
            last_question = questions[-1]
            last_metadata = last_question.get('metadata', {})
            last_chapter = last_metadata.get('chapter', '')
            last_topic = last_metadata.get('topic', '')
        
        # Read the book content
        with open(txt_file, 'r', encoding='utf-8') as f:
            book_content = f.read()
        
        # Extract all chapters and topics from the book
        chapters = []
        topics = []
        
        # Split by lines to analyze content
        lines = book_content.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check for chapter headers
            chapter_match = re.search(r'Chapter\s+(\d+|[A-Za-z]+)[\s:]+(.*?)(?=\n|$)', line, re.IGNORECASE)
            if chapter_match:
                chapters.append(chapter_match.group(1))
            
            # Check for topic headers
            topic_match = re.search(r'(\d+\.\d+)\s+([A-Za-z\s]+)(?=\n|$)', line)
            if topic_match:
                topics.append(topic_match.group(1))
        
        # If we have chapters, check if the last question's chapter is the last chapter
        if chapters and last_chapter:
            if last_chapter != chapters[-1]:
                log_progress(f"Book not completely processed. Last processed chapter: {last_chapter}, Last chapter in book: {chapters[-1]}")
                return False
        
        # If we have topics, check if the last question's topic is the last topic
        if topics and last_topic:
            last_topic_number = re.search(r'(\d+\.\d+)', last_topic)
            if last_topic_number and last_topic_number.group(1) != topics[-1]:
                log_progress(f"Book not completely processed. Last processed topic: {last_topic}, Last topic in book: {topics[-1]}")
                return False
        
        return True
        
    except Exception as e:
        log_progress(f"Error checking book completion status: {str(e)}")
        return False

def main():
    log_progress("Starting training data generation...")
    
    # Create output directory if it doesn't exist
    output_dir = "training_data"
    os.makedirs(output_dir, exist_ok=True)
    log_progress(f"Output directory: {output_dir}")
    
    # Get list of already processed files by checking existing JSON files
    processed_files = set()
    partially_processed_files = {}  # Store files that need to continue processing
    
    for file in os.listdir(output_dir):
        if file.endswith('.json') and not file.endswith('.progress.json'):
            subject_name = file.replace('.json', '')
            json_file = os.path.join(output_dir, file)
            
            # Find the corresponding txt file
            for root, _, files in os.walk("text_books"):
                for txt_file in files:
                    if txt_file.lower().replace('.txt', '') == subject_name.lower():
                        file_path = os.path.join(root, txt_file)
                        
                        # Check if the book is completely processed
                        if is_book_completely_processed(json_file, file_path):
                            processed_files.add(file_path)
                            log_progress(f"Found completely processed file: {file_path}")
                        else:
                            partially_processed_files[file_path] = json_file
                            log_progress(f"Found partially processed file: {file_path}")
    
    # Process all topic files in the text_books directory
    text_books_dir = "text_books"
    all_files = []
    for root, _, files in os.walk(text_books_dir):
        for file in files:
            if file.endswith('.txt'):
                file_path = os.path.join(root, file)
                all_files.append(file_path)
    
    total_files = len(all_files)
    log_progress(f"Found {total_files} total files to process")
    log_progress(f"Found {len(processed_files)} completely processed files")
    log_progress(f"Found {len(partially_processed_files)} partially processed files")
    
    for i, file_path in enumerate(all_files, 1):
        # Skip if file was completely processed
        if file_path in processed_files:
            log_progress(f"\nSkipping completely processed file {i}/{total_files}: {file_path}")
            continue
        
        log_progress(f"\nProcessing file {i}/{total_files}")
        if file_path in partially_processed_files:
            log_progress(f"Continuing processing from previous progress: {file_path}")
        process_topic_file(file_path, output_dir)
    
    log_progress("\nTraining data generation completed!")

if __name__ == "__main__":
    main() 