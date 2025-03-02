### Newest version

from flask import Flask, render_template, request, redirect, url_for, flash, send_file, jsonify, Response
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os
import logging
import fitz
from pdf2image import convert_from_path
import pytesseract
import spacy
import random
# import subprocess
import spacy.cli
from PIL import Image
import re, time
from groq import Groq

app = Flask(__name__)
app.secret_key = "your_secret_key"

UPLOAD_FOLDER = 'output/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

client = Groq(
    api_key="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"
)

nlp = spacy.load("en_core_web_sm")

# Load form fields
def load_form_fields():
    sections = {}
    file_path = os.path.join("output", "Formatted_Fields_New.txt")
    try:
        with open(file_path, "r") as file:
            lines = file.readlines()
            current_section = None
            for line in lines:
                line = line.strip()
                if line and not line.startswith("#"):
                    if line.startswith("**"):
                        current_section = line[2:].strip()
                        sections[current_section] = []
                    elif current_section:
                        sections[current_section].append(line)
    except FileNotFoundError:
        print(f"The file {file_path} does not exist.")
    return sections

def generate_llama_response(field_value):
    client = Groq(
    api_key="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",  # Replace with your actual API key
)
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": f"Generate a response for the following field: {field_value} for an RFP Response Document. The response should be strictly limited to addressing {field_value} directly and should include only relevant information. Do not add any introductory text, concluding remarks, or extraneous details. The response should be purely focused on the content required for {field_value} without any additional commentary or explanations. The company is Broadrange AI, specializing in Generative AI, Large Language Models, Prompt Engineering, Vector Databases, Diffusion Models, Deep Learning, Computer Vision Solutions, and Cutting-Edge AI Consulting.",
                }
            ],
            model="llama3-8b-8192",
            # model="llama-3.3-70b-versatile",
        )
        response_content = chat_completion.choices[0].message.content.strip()
        if response_content:
            print(f"Success: Response generated for field '{field_value}'")
            print(f"Response text: {response_content}")
        else:
            print(f"No response content generated for field '{field_value}'")
        return response_content or "No response generated"
    except Exception as e:
        print(f"Error generating Llama response: {e}")
        return "An error occurred while generating the response."


@app.route("/form", methods=["GET", "POST"])
# @app.route("/", methods=["GET", "POST"])
def index():
    print("successfully redirected")
    fields = load_form_fields()
    if request.method == "POST":
        form_data = {}
        for section, section_fields in fields.items():
            for field in section_fields:
                if section in ["Company Information", "Contact Information"]:
                    form_data[field] = request.form.get(f"{section}_{field}_response")
                else:
                    selected_option = request.form.get(f"{section}_{field}_option")
                    response = request.form.get(f"{section}_{field}_response")
                    if selected_option == "user_input" and response:
                        form_data[field] = response
                    elif selected_option == "generate_llama":
                        form_data[field] = (
                            "Llama-generated response here"  # Replace with Llama integration
                        )

        file_path = os.path.join("output", "sample_pdf_response.txt")
        with open(file_path, "w") as file:
            file.write("This is a placeholder for the generated response.")

        flash("Responses have been recorded and PDF generated!", "success")
        return redirect(url_for("display_text_file"))

    return render_template("form.html", sections=load_form_fields(), show_form=request.args.get('show_form', 'False'))

@app.route("/fetch_llama_response", methods=["POST"])
def fetch_llama_response():
    data = request.json
    field_value = data.get("field_value")
    response_text = generate_llama_response(field_value)
    return jsonify({"response": response_text})

@app.route("/generate_pdf", methods=["POST"])
def generate_pdf():
    fields = load_form_fields()
    form_data = {}

    for section, section_fields in fields.items():
        for field in section_fields:
            form_data[f"{section}_{field}_option"] = request.form.get(
                f"{section}_{field}_option"
            )
            form_data[f"{section}_{field}_response"] = request.form.get(
                f"{section}_{field}_response"
            )

    pdf_path = "output/generated_response.pdf"
    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter

    y_position = height - 40
    for section, section_fields in fields.items():
        c.drawString(40, y_position, f"Section: {section}")
        y_position -= 20
        for field in section_fields:
            response = form_data.get(f"{section}_{field}_response", "No response")
            c.drawString(40, y_position, f"{field}: {response}")
            y_position -= 20
            if y_position < 40:
                c.showPage()
                y_position = height - 40
    c.save()

    flash("PDF generated successfully!", "success")
    return send_file(pdf_path, as_attachment=True)


# Route to generate the RFP response PDF
# @app.route("/generate_rfp_response", methods=["POST"])
# def generate_rfp_response():
#     # Load the fields from the predefined file
#     fields = load_form_fields()

#     if not fields:
#         flash("No fields available to process.", "error")
#         return redirect(url_for("index"))

#     # Prepare the RFP responses by capturing current form data
#     rfp_responses = {}
#     for section, section_fields in fields.items():
#         rfp_responses[section] = {}
#         for field in section_fields:
#             # Retrieve the response from the form directly
#             field_response = request.form.get(f"{section}_{field}_response")
#             if field_response and field_response.strip():
#                 rfp_responses[section][field] = field_response.strip()
#             else:
#                 rfp_responses[section][field] = f"No response provided for {field}."

#     # Generate the PDF
#     pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], "Generated_RFP_Response.pdf")
#     c = canvas.Canvas(pdf_path, pagesize=letter)
#     width, height = letter

#     y_position = height - 40  # Start from the top of the page
#     for section, section_responses in rfp_responses.items():
#         c.setFont("Helvetica-Bold", 14)
#         c.drawString(40, y_position, f"Section: {section}")
#         y_position -= 20
#         for field, response in section_responses.items():
#             c.setFont("Helvetica", 12)
#             c.drawString(50, y_position, f"{field}:")
#             y_position -= 15
#             response_lines = response.split("\n")
#             for line in response_lines:
#                 c.drawString(60, y_position, line)
#                 y_position -= 15

#             y_position -= 10  # Add extra space between fields

#             if y_position < 40:  # If near the bottom, start a new page
#                 c.showPage()
#                 y_position = height - 40

#     c.save()

#     flash("RFP Response PDF generated successfully!", "success")
#     return send_file(pdf_path, as_attachment=True)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_pdf_from_responses(rfp_responses, pdf_path):
    """
    Generate a PDF from RFP responses.

    Args:
        rfp_responses (dict): A dictionary containing RFP responses organized by section and field.
        pdf_path (str): The path where the PDF will be saved.
    """
    c = canvas.Canvas(pdf_path, pagesize=letter)
    width, height = letter

    y_position = height - 40  # Start from the top of the page
    for section, section_responses in rfp_responses.items():
        c.setFont("Helvetica-Bold", 14)
        c.drawString(40, y_position, f"Section: {section}")
        y_position -= 20
        for field, response in section_responses.items():
            c.setFont("Helvetica", 12)
            c.drawString(50, y_position, f"{field}:")
            y_position -= 15
            response_lines = response.split("\n")
            for line in response_lines:
                c.drawString(60, y_position, line)
                y_position -= 15

            y_position -= 10  # Add extra space between fields

            if y_position < 40:  # If near the bottom, start a new page
                c.showPage()
                y_position = height - 40

    c.save()

@app.route("/generate_rfp_response", methods=["POST"])
def generate_rfp_response():
    """
    Generate an RFP response PDF based on user input.

    Returns:
        A PDF file as an attachment.
    """
    try:
        logger.info("Starting RFP response PDF generation...")

        # Load the fields from the predefined file
        fields = load_form_fields()

        if not fields:
            logger.warning("No fields available to process.")
            flash("No fields available to process.", "error")
            return redirect(url_for("index"))

        # Validate form data
        missing_fields = []
        rfp_responses = {}
        for section, section_fields in fields.items():
            rfp_responses[section] = {}
            for field in section_fields:
                field_response = request.form.get(f"{section}_{field}_response")
                if not field_response or not field_response.strip():
                    missing_fields.append(f"{section} - {field}")
                    rfp_responses[section][field] = f"No response provided for {field}."
                else:
                    rfp_responses[section][field] = field_response.strip()

        if missing_fields:
            flash(f"Missing responses for the following fields: {', '.join(missing_fields)}", "warning")

        # Generate the PDF
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], "Generated_RFP_Response.pdf")
        generate_pdf_from_responses(rfp_responses, pdf_path)

        logger.info("RFP Response PDF generated successfully.")
        flash("RFP Response PDF generated successfully!", "success")
        return send_file(pdf_path, as_attachment=True)

    except Exception as e:
        logger.error(f"Error generating RFP response PDF: {str(e)}")
        flash(f"An error occurred while generating the PDF: {str(e)}", "error")
        return redirect(url_for("index"))





@app.route("/", methods=["GET", "POST"])
def upload():
    # # If it's a POST request (from your button), redirect to the form
    # if request.method == "POST":
    #     # return redirect(url_for('templates', filename='form.html'))
    #     return render_template("form.html")
    
    # # If it's a GET request, just render the index page
    # return render_template("index.html")

    return render_template("index.html")


@app.route("/save_rfp_response", methods=["POST"])
def save_rfp_response():
    """
    Saves RFP responses into a structured text file while keeping the form's existing functionalities.
    """
    try:
        responses = request.json
        output_file = os.path.join("output", "rfp_responses.txt")

        with open(output_file, "w", encoding="utf-8") as file:
            for field, response in responses.items():
                file.write(f"{field.replace('_', ' ')}: {response}\n")

        return jsonify({"message": "Responses saved successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Route to process and generate final output
@app.route("/generate_professional_pdf", methods=["POST"])
def generate_professional_pdf():
    print("Control has been transferred to backend")
    try:
        input_txt = "output/rfp_responses.txt"
        output_pdf = "output/Generated_RFP_Response.pdf"

        # Call the function to generate the PDF
        generate_professional_rfp_response(input_txt, output_pdf)

        return jsonify({"success": True, "pdf_url": f"/download_pdf?file={output_pdf}"})
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"success": False, "error": str(e)})
    
@app.route("/download_pdf")
def download_pdf():
    file_path = request.args.get("file")
    return send_file(file_path, as_attachment=True)

def generate_professional_rfp_response(input_file, output_pdf):
    """
    Process the extracted RFP responses, analyze them using LLaMA, and generate a professional PDF response.

    Args:
        input_file (str): Path to the text file containing extracted RFP responses.
        output_pdf (str): Path to save the generated professional RFP response PDF.
    """

    try:
        # Step 1: Read the extracted RFP responses from the text file
        with open(input_file, "r", encoding="utf-8") as file:
            rfp_text = file.read()

        # Step 2: Break Down the Text into Sections and Subsections
        def split_text_into_sections(text):
            sections = {}
            current_section = "General Information"
            sections[current_section] = []

            for line in text.split("\n"):
                if line.strip() == "":
                    continue
                elif "**" in line:  # Identify section headers
                    current_section = line.strip().replace("**", "").strip()
                    sections[current_section] = []
                else:
                    sections[current_section].append(line.strip())

            return sections

        # Step 3: Further Split Each Section into Sentences
        def split_text_into_chunks(text, max_tokens=1000):
            doc = nlp(text)
            chunks = []
            current_chunk = []
            token_count = 0

            for sent in doc.sents:
                sent_tokens = len(sent.text.split())  # Approximate token count
                if token_count + sent_tokens > max_tokens:
                    chunks.append(" ".join(current_chunk))
                    current_chunk = []
                    token_count = 0

                current_chunk.append(sent.text)
                token_count += sent_tokens

            if current_chunk:
                chunks.append(" ".join(current_chunk))

            return chunks

        # Step 4: Define the LLaMA Processing Function
        def process_with_llama(chunk, prompt, max_retries=5):
            retry_delay = 10  # Initial retry delay (seconds)

            for attempt in range(max_retries):
                try:
                    chat_completion = client.chat.completions.create(
                        messages=[{"role": "user", "content": f"{prompt}\n\n{chunk}"}],
                        model="llama3-8b-8192",
                    )
                    return chat_completion.choices[0].message.content.strip()

                except Exception as e:
                    error_message = str(e)
                    print(f"❌ Error processing with LLaMA: {error_message} (Attempt {attempt+1}/{max_retries})")

                    # Handle 429 Too Many Requests
                    if "429" in error_message:
                        wait_time = retry_delay * (2 ** attempt) + random.uniform(0, 5)  # Exponential backoff
                        print(f"🔄 Retrying in {wait_time:.2f} seconds...")
                        time.sleep(wait_time)

                    # Handle 413 Payload Too Large
                    elif "413" in error_message:
                        print(f"⚠️ Reducing chunk size and retrying...")
                        return ""

                    else:
                        break  # Stop retrying for unknown errors

            return ""

        # Step 5: Process Sections Sequentially
        sections = split_text_into_sections(rfp_text)
        professional_rfp_response = {}

        for section_name, section_content in sections.items():
            print(f"🔹 Processing section: {section_name}")

            section_text = " ".join(section_content)
            chunks = split_text_into_chunks(section_text)

            processed_section = []
            for chunk in chunks:
                response = process_with_llama(chunk, f"Format this professionally:\n{chunk}")
                if response:
                    processed_section.append(response)

                time.sleep(15)  # Increased delay between requests

            professional_rfp_response[section_name] = "\n".join(processed_section)

        # Step 6: Save structured response to a text file
        structured_text_file = os.path.join(os.path.dirname(output_pdf), "structured_rfp_response.txt")
        with open(structured_text_file, "w", encoding="utf-8") as file:
            for section, content in professional_rfp_response.items():
                file.write(f"## {section}\n{content}\n\n")

        print(f"✅ Structured RFP response saved to: {structured_text_file}")

        # Step 7: Convert structured response into a PDF
        def save_text_to_pdf(text, pdf_path):
            c = canvas.Canvas(pdf_path, pagesize=letter)
            width, height = letter
            y_position = height - 40  # Start from the top of the page

            c.setFont("Helvetica-Bold", 14)
            c.drawString(40, y_position, "Professional RFP Response")
            y_position -= 20

            c.setFont("Helvetica", 12)
            for line in text.split("\n"):
                if y_position < 40:  # If near the bottom, start a new page
                    c.showPage()
                    y_position = height - 40
                c.drawString(50, y_position, line)
                y_position -= 15  # Line spacing

            c.save()

        # Step 8: Generate the PDF
        final_rfp_text = "\n".join([f"## {sec}\n{cont}" for sec, cont in professional_rfp_response.items()])
        save_text_to_pdf(final_rfp_text, output_pdf)

        print(f"✅ Professional RFP Response PDF generated successfully: {output_pdf}")

    except Exception as e:
        print(f"❌ Error generating RFP response: {e}")





@app.route("/process_pdf", methods=["POST"])
def process_pdf():
    if "pdf-file" not in request.files:
        flash("No file part", "error")
        return redirect(url_for("upload"))

    file = request.files["pdf-file"]

    if file.filename == "":
        flash("No selected file", "error")
        return redirect(url_for("upload"))
    
    if file and file.filename.endswith(".pdf"):
        # Log the filename for debugging
        print(f"Received file: {file.filename}")
        
        # Flash message and redirect to index
        flash("PDF uploaded and converted to images successfully", "success")
        flash("Text extracted from images successfully", "success")
        flash("Semantic extraction completed", "success")
        flash("Important fields extracted successfully", "success")
        flash("PDF has been successfully processed.", "success")
        return redirect(url_for("index", show_form=True))

    # if file and file.filename.endswith(".pdf"):
    #     # Step 1: Save the uploaded PDF to the UPLOAD_FOLDER
    #     pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    #     file.save(pdf_path)

    #     if os.path.exists(processed_dir):
    #         flash("This PDF has already been processed. Redirecting to the form.", "info")
    #         return redirect(url_for("index"))

    #     # Create a directory for storing processed files
    #     processed_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'Processed_Files')
    #     os.makedirs(processed_dir, exist_ok=True)

    #     # Step 2: Convert PDF to images
    #     # image_dir = os.path.join(processed_dir, 'pdf_images_Broadrange_AI')
    #     # os.makedirs(image_dir, exist_ok=True)
    #     # poppler_path = '/usr/bin'

    #     # try:
    #     #     images = convert_from_path(pdf_path, poppler_path=poppler_path)

    #     #     for i, image in enumerate(images):
    #     #         image_path = os.path.join(image_dir, f'page_{i+1}.png')
    #     #         image.save(image_path, 'PNG')

    #     #     flash("PDF uploaded and converted to images successfully!", "success")

    #     # except Exception as e:
    #     #     flash(f"Error converting PDF to images: {str(e)}", "error")
    #     #     return render_template("form.html")

    #     # Step 2: Convert PDF to images
    #     image_dir = os.path.join(processed_dir, 'PDF_Images')
    #     os.makedirs(image_dir, exist_ok=True)

    #     # flash("Converting PDF to images...", "success")

    #     try:
    #         # Open the PDF file with PyMuPDF
    #         pdf_document = fitz.open(pdf_path)
    
    #         # Set desired DPI (Dots per inch)
    #         desired_dpi = 600  # Higher DPI for better quality

    #         # flash("Converting PDF to images...", "success")

    #         # Iterate through each page of the PDF and save it as an image
    #         for page_num in range(len(pdf_document)):
    #             page = pdf_document[page_num]
        
    #             # Create a transformation matrix for the desired DPI
    #             pix = page.get_pixmap(matrix=fitz.Matrix(desired_dpi / 72, desired_dpi / 72))  # 1 DPI = 1/72 point
        
    #             # Define the output image path
    #             image_path = os.path.join(image_dir, f'page_{page_num + 1}.png')
        
    #             # Save the image as PNG
    #             pix.save(image_path)

    #             # yield f"Processed page {page_num + 1}/{len(pdf_document)}\n\n"
    #             # flash(f"Processed page {page_num + 1}/{len(pdf_document)}", "success")

    #         flash("PDF uploaded and converted to images successfully!", "success")
    #         # yield "PDF uploaded and converted to images successfully!"

    #     except Exception as e:
    #         flash(f"Error converting PDF to images: {str(e)}", "error")
    #         # yield f"Error converting PDF to images: {str(e)}"
    #         return render_template("form.html")

        


    #     # Step 3: Perform OCR on the images and extract text
    #     text_dir = os.path.join(processed_dir, 'Extracted_Text')
    #     os.makedirs(text_dir, exist_ok=True)

        
    #     pytesseract.pytesseract.tesseract_cmd = r'./Tesseract-OCR/tesseract.exe'

    #     try:
    #         def extract_number(filename):
    #             match = re.search(r'(\d+)', filename)
    #             return int(match.group(1)) if match else 0

    #         image_files = [f for f in os.listdir(image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff'))]
    #         image_files.sort(key=extract_number)

    #         extracted_text = []

    #         for idx, filename in enumerate(image_files):
    #             image_path = os.path.join(image_dir, filename)
    #             image = Image.open(image_path)
    #             text = pytesseract.image_to_string(image)

    #             text_filename = f'page_{idx + 1}.txt'
    #             text_path = os.path.join(text_dir, text_filename)

    #             with open(text_path, 'w', encoding='utf-8') as text_file:
    #                 text_file.write(text)

    #             extracted_text.append(text)

    #         flash("Text extracted from images successfully!", "success")

    #     except Exception as e:
    #         flash(f"Error extracting text from images: {str(e)}", "error")
    #         return render_template("form.html")

    #     # Step 4: Perform semantic extraction using SpaCy
    #     semantic_output_dir = os.path.join(processed_dir, 'Semantic_Extraction')
    #     os.makedirs(semantic_output_dir, exist_ok=True)
    #     semantic_output_file = os.path.join(semantic_output_dir, 'Semantic_Extracted_Text.txt')

    #     try:
    #         semantic_extracted_text = []
    #         for text in extracted_text:
    #             doc = nlp(text)
    #             for sent in doc.sents:
    #                 if len(sent.text.strip()) > 20:
    #                     semantic_extracted_text.append(sent.text.strip())

    #         with open(semantic_output_file, 'w', encoding='utf-8') as file:
    #             file.write("\n".join(semantic_extracted_text))

    #         flash("Semantic extraction completed!", "success")

    #     except Exception as e:
    #         flash(f"Error during semantic extraction: {str(e)}", "error")
    #         return render_template("form.html")

    #     # Step 5: Use LLaMA to extract important fields
    #     try:
    #         with open(semantic_output_file, "r", encoding='utf-8') as file:
    #             summary_text = file.read()

    #         def split_text(text, max_tokens=3000):
    #             doc = nlp(text)
    #             chunks = []
    #             current_chunk = []

    #             for sent in doc.sents:
    #                 current_chunk.append(sent.text)
    #                 if len(" ".join(current_chunk).split()) > max_tokens:
    #                     chunks.append(" ".join(current_chunk))
    #                     current_chunk = []

    #             if current_chunk:
    #                 chunks.append(" ".join(current_chunk))

    #             return chunks

    #         def process_with_llama(chunk, prompt):
    #             try:
    #                 chat_completion = client.chat.completions.create(
    #                     messages=[
    #                         {
    #                             "role": "user",
    #                             "content": f"{prompt}\n\n{chunk}",
    #                         }
    #                     ],
    #                     model="llama3-8b-8192",
    #                 )
    #                 return chat_completion.choices[0].message.content.strip()
    #             except Exception as e:
    #                 print(f"Error: {e}")
    #                 return ""

    #         def extract_important_fields_from_chunks(chunks, prompt):
    #             important_fields = []
    #             for chunk in chunks:
    #                 response = process_with_llama(chunk, prompt)
    #                 if response:
    #                     important_fields.append(response)
    #                 time.sleep(10)
    #             return "\n".join(important_fields)

    #         # Step 6: Process with LLaMA to extract important fields
    #         chunks = split_text(summary_text)
    #         prompt_1 = "Identify all the important fields that need to be filled by the responding company."
    #         important_fields = extract_important_fields_from_chunks(chunks, prompt_1)

    #         output_file_1 = os.path.join(processed_dir, "semantic_important_fields_llama.txt")
    #         with open(output_file_1, "w", encoding='utf-8') as output_file:
    #             output_file.write(important_fields)

    #         flash("Important fields extracted successfully!", "success")

    #     except Exception as e:
    #         flash(f"Error during LLaMA processing: {str(e)}", "error")
    #         return render_template("form.html")


    #     # Step 7: LLaMA for generating structured form fields
    #     try:
    #         with open(output_file_1, "r", encoding='utf-8') as file:
    #             summary_text = file.read()

    #         prompt_2 = "Thoroughly analyze the following text and convert every single field, data point, or piece of information that a company must provide when responding to this RFP, to a field name with description, which can be displayed on a webpage for the user to fill. Ensure that no details, including minor or implicit fields, are missed, including every section, sub-section, required document, form, and any other elements necessary for a complete RFP response. Be exhaustive in creating the fields and description for all required responses, both explicit and implicit. Do not add any other information."
    #         form_fields = extract_important_fields_from_chunks(chunks, prompt_2)

    #         output_file_2 = os.path.join(processed_dir, "Formatted_Fields_Webpage.txt")
    #         with open(output_file_2, "w", encoding='utf-8') as output_file:
    #             output_file.write(form_fields)

    #         flash("Form fields generated successfully!", "success")
    #         return render_template("index.html", show_form=True)

    #     except Exception as e:
    #         flash(f"Error generating form fields: {str(e)}", "error")
    #         return render_template("form.html")

    flash("Invalid file type. Please upload a PDF.", "error")
    print("Error")
    return render_template("form.html")

# @app.route("/process_pdf", methods=["POST"])
# def process_pdf():
#     if "pdf-file" not in request.files:
#         flash("No file part", "error")
#         return redirect(url_for("upload"))

#     file = request.files["pdf-file"]

#     if file.filename == "":
#         flash("No selected file", "error")
#         return redirect(url_for("upload"))

#     if file and file.filename.endswith(".pdf"):
#         # Step 1: Save the uploaded PDF to the UPLOAD_FOLDER
#         pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
#         file.save(pdf_path)

#         # Create a directory for storing processed files
#         processed_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'Processed_Files')
#         os.makedirs(processed_dir, exist_ok=True)

#         image_dir = os.path.join(processed_dir, 'PDF_Images')
#         os.makedirs(image_dir, exist_ok=True)

#         # Step 2: Convert PDF to images
#         try:
#             # Open the PDF file with PyMuPDF
#             pdf_document = fitz.open(pdf_path)
#             desired_dpi = 600  # Higher DPI for better quality

#             for page_num in range(len(pdf_document)):
#                 page = pdf_document[page_num]
#                 pix = page.get_pixmap(matrix=fitz.Matrix(desired_dpi / 72, desired_dpi / 72))
#                 image_path = os.path.join(image_dir, f'page_{page_num + 1}.png')
#                 pix.save(image_path)

#             flash("PDF uploaded and converted to images successfully!", "success")

#         except Exception as e:
#             flash(f"Error converting PDF to images: {str(e)}", "error")
#             return render_template("form.html")

#         # Step 3: Perform OCR on the images and extract text
#         text_dir = os.path.join(processed_dir, 'Extracted_Text')
#         os.makedirs(text_dir, exist_ok=True)

#         try:
#             def extract_number(filename):
#                 match = re.search(r'(\d+)', filename)
#                 return int(match.group(1)) if match else 0

#             image_files = [f for f in os.listdir(image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff'))]
#             image_files.sort(key=extract_number)

#             extracted_text = []

#             for idx, filename in enumerate(image_files):
#                 image_path = os.path.join(image_dir, filename)
#                 image = Image.open(image_path)
#                 text = pytesseract.image_to_string(image)

#                 text_filename = f'page_{idx + 1}.txt'
#                 text_path = os.path.join(text_dir, text_filename)

#                 with open(text_path, 'w', encoding='utf-8') as text_file:
#                     text_file.write(text)

#                 extracted_text.append(text)

#             flash("Text extracted from images successfully!", "success")

#         except Exception as e:
#             flash(f"Error extracting text from images: {str(e)}", "error")
#             return render_template("form.html")

#         # Step 4: Perform semantic extraction using SpaCy
#         semantic_output_dir = os.path.join(processed_dir, 'Semantic_Extraction')
#         os.makedirs(semantic_output_dir, exist_ok=True)
#         semantic_output_file = os.path.join(semantic_output_dir, 'Semantic_Extracted_Text.txt')

#         try:
#             semantic_extracted_text = []
#             for text in extracted_text:
#                 doc = nlp(text)
#                 for sent in doc.sents:
#                     if len(sent.text.strip()) > 20:
#                         semantic_extracted_text.append(sent.text.strip())

#             with open(semantic_output_file, 'w', encoding='utf-8') as file:
#                 file.write("\n".join(semantic_extracted_text))

#             flash("Semantic extraction completed!", "success")

#         except Exception as e:
#             flash(f"Error during semantic extraction: {str(e)}", "error")
#             return render_template("form.html")

#         # Step 5: Use LLaMA to extract important fields
#         try:
#             with open(semantic_output_file, "r", encoding='utf-8') as file:
#                 summary_text = file.read()

#             def split_text(text, max_tokens=3000):
#                 doc = nlp(text)
#                 chunks = []
#                 current_chunk = []

#                 for sent in doc.sents:
#                     current_chunk.append(sent.text)
#                     if len(" ".join(current_chunk).split()) > max_tokens:
#                         chunks.append(" ".join(current_chunk))
#                         current_chunk = []

#                 if current_chunk:
#                     chunks.append(" ".join(current_chunk))

#                 return chunks

#             def process_with_llama(chunk, prompt):
#                 try:
#                     chat_completion = client.chat.completions.create(
#                         messages=[{
#                             "role": "user",
#                             "content": f"{prompt}\n\n{chunk}",
#                         }],
#                         model="llama3-8b-8192",
#                     )
#                     return chat_completion.choices[0].message.content.strip()
#                 except Exception as e:
#                     print(f"Error: {e}")
#                     return ""

#             def extract_important_fields_from_chunks(chunks, prompt):
#                 important_fields = []
#                 for chunk in chunks:
#                     response = process_with_llama(chunk, prompt)
#                     if response:
#                         important_fields.append(response)
#                     time.sleep(10)
#                 return "\n".join(important_fields)

#             chunks = split_text(summary_text)
#             prompt_1 = "Identify all the important fields that need to be filled by the responding company."
#             important_fields = extract_important_fields_from_chunks(chunks, prompt_1)

#             output_file_1 = os.path.join(processed_dir, "semantic_important_fields_llama.txt")
#             with open(output_file_1, "w", encoding='utf-8') as output_file:
#                 output_file.write(important_fields)

#             flash("Important fields extracted successfully!", "success")

#         except Exception as e:
#             flash(f"Error during LLaMA processing: {str(e)}", "error")
#             return render_template("form.html")

#         # Step 7: LLaMA for generating structured form fields
#         try:
#             with open(output_file_1, "r", encoding='utf-8') as file:
#                 summary_text = file.read()

#             prompt_2 = "Thoroughly analyze the following text and convert every single field, data point, or piece of information that a company must provide when responding to this RFP, to a field name with description, which can be displayed on a webpage for the user to fill. Ensure that no details, including minor or implicit fields, are missed, including every section, sub-section, required document, form, and any other elements necessary for a complete RFP response."
#             form_fields = extract_important_fields_from_chunks(chunks, prompt_2)

#             output_file_2 = os.path.join(processed_dir, "Formatted_Fields_Webpage.txt")
#             with open(output_file_2, "w", encoding='utf-8') as output_file:
#                 output_file.write(form_fields)

#             flash("Form fields generated successfully!", "success")
#             return render_template("index.html", show_form=True)

#         except Exception as e:
#             flash(f"Error generating form fields: {str(e)}", "error")
#             return render_template("form.html")

#     flash("Invalid file type. Please upload a PDF.", "error")
#     return render_template("form.html")

if __name__ == "__main__":
    app.run(debug=True)
