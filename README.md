# AI Powered RFP Response generator

An AI-driven RFP Response Generator, designed to automate and optimize the process of drafting responses to Request for Proposal (RFP) documents. Companies rely on RFPs to invite bids for projects or services, and manually preparing responses can be time-intensive and tedious. This solution was developed to streamline the workflow, enhance efficiency, and ensure accuracy and consistency in proposal submissions.

---

## Table of Contents

- [Core Features & Technologies](#CoreFeatures&technologies)
- [Installation](#installation)
- [Dependencies](#dependencies)


---
## Core Features & Technologies
 - **Text Extraction:**  Leverages Tesseract OCR to extract text from scanned RFP documents. 
 - **AI-Powered Response Generation:**  Uses LLaMA (Llama3-8b via Groq API) to create structured, context-aware responses. 
 - **Customizable & Adaptive Responses:**  AI-generated content can be fine-tuned for specific proposal requirements. 
 - **Advanced NLP Processing:**  spaCy handles text segmentation and tokenization for efficient document processing. 
 - **Scalable Text Chunking:**  Implements smart chunking techniques to process extensive documents effectively. 
 - **Automated PDF Generation:**  ReportLab converts responses into submission-ready PDF documents. 
 - **Frontend:**  Built with HTML, CSS, and JavaScript for a user-friendly interface. 
 - **Backend:**  Powered by Flask for robust server-side functionality.

---

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Bhargava-Srinivasan/Broadrange-AI-RFP-Response-Generator
   cd Broadrange-AI-RFP-Response-Generator
   cd RFP_Response_Form_Project

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   
3. **Activate the virtual environment**
   ```bash
   venv\Scripts\activate

4. **Install the required Python packages**
   ```bash
   pip install -r requirements.txt

5. **Download the spaCy language model**
   ```bash
   python -m spacy download en_core_web_sm

6. **Run the application**
   ```bash
   python app.py

---   
   
## Dependencies
This project relies on the following Python packages:

 - flask: Web framework for building the application.
 - fpdf: Library for generating PDF files.
 - pymupdf: For reading and manipulating PDF files.
 - requests: For making HTTP requests.
 - reportlab: For advanced PDF generation.
 - llamaapi: For interacting with the Llama API.
 - pytesseract: For OCR (Optical Character Recognition).
 - pdf2image: For converting PDF pages to images.
 - spacy: For natural language processing.
 - groq: For interacting with the Groq API.

   
