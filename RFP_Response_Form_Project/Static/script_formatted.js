document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");

    // Handle form visibility based on hidden input value
    handleFormVisibility();

    // Display flash messages one by one
    // displayFlashMessages();

    // Handle select dropdown changes for user input or AI-generated responses
    setupDropdownListeners();

    // Handle expanding textarea fields
    setupExpandButtons();

    // Handle smooth scrolling for the scroll arrow
    setupScrollArrow();

    // change input box name after user submits PDF
    // setupFileInputListener();

    // Setup hidden field updater before form submission
    // setupHiddenFieldUpdater();

    // New function to log values
    logTextareaValues();

    // Handle Generate PDF button click event
    setupGeneratePdfButton();
});

function showForm() {
    document.getElementById('response-form').style.display = 'block';
    document.getElementById('llama-options').style.display = 'block';
    // document.getElementById('generate-pdf-form').style.display = 'block';
}

/** 
 * Function to display flash messages one by one with a delay
 */
function displayFlashMessages() {
    const flashMessages = document.querySelectorAll(".flash-messages li");
    const messageDisplay = document.getElementById("message-display");
    
    if (flashMessages.length === 0) {
        console.log("No flash messages found.");
        return;
    }

    const messagesArray = Array.from(flashMessages).map(msg => msg.textContent);
    let delay = 3000; // 3 seconds between messages

    console.log("Messages are being retrieved properly:", messagesArray);

    function displayMessages(index) {
        if (index < messagesArray.length) {
            const messageText = document.createTextNode(messagesArray[index]);
            messageDisplay.appendChild(messageText);
            messageDisplay.appendChild(document.createElement("br"));

            console.log(`Displayed message ${index + 1}: ${messagesArray[index]}`);
            
            setTimeout(() => displayMessages(index + 1), delay);
        } else {
            console.log("All messages displayed.");
        }
    }

    displayMessages(0);
}

/** 
 * Function to handle dropdown selections and toggle input fields
 */
function setupDropdownListeners() {
    document.querySelectorAll("select").forEach(select => {
        const inputField = document.getElementById(select.id.replace("_option", "_response"));

        toggleInputField(select, inputField);

        select.addEventListener("change", function () {
            console.log(`Dropdown changed to: ${select.value}`);
            toggleInputField(select, inputField);
        });
    });
}

/** 
 * Function to toggle between user input and AI response fields 
 */
function toggleInputField(select, inputField) {
    if (select.value === "user_input") {
        inputField.style.display = "block";
    } else {
        inputField.style.display = "none";
        inputField.value = "";
        if (select.value === "generate_llama") {
            fetchLlamaResponse(select.id.replace("_option", ""), response => {
                inputField.style.display = "block";
                inputField.value = response;
            });
        }
    }
}


/** 
 * Function to fetch AI-generated response for a field 
 */
function fetchLlamaResponse(fieldName, callback) {
    const selectedOption = document.getElementById(fieldName + "_option").value;

    if (selectedOption !== "generate_llama") return;

    fetch("/fetch_llama_response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_value: fieldName })
    })
    .then(response => response.json())
    .then(data => callback(data.response))
    .catch(error => {
        console.error("Error fetching Llama response:", error);
        callback("Error fetching response");
    });
}

/** 
 * Function to handle expanding textareas for better visibility
 */
function setupExpandButtons() {
    document.querySelectorAll("textarea").forEach(textAreaField => {
        const expandBtn = document.createElement("button");
        expandBtn.textContent = "Expand";
        expandBtn.classList.add("expand-btn");

        expandBtn.addEventListener("click", function () {
            textAreaField.classList.toggle("expanded");
            expandBtn.textContent = textAreaField.classList.contains("expanded") ? "Collapse" : "Expand";
        });

        textAreaField.parentNode.insertBefore(expandBtn, textAreaField.nextSibling);
    });
}

/** 
 * Function to set all dropdowns to "Generate Llama Response" sequentially
 */
function setAllToLlamaSequentially() {
    const selectElements = document.querySelectorAll("select");
    let index = 0;

    function setNextDropdown() {
        if (index < selectElements.length) {
            const select = selectElements[index];
            select.value = "generate_llama";

            const inputField = document.getElementById(select.id.replace("_option", "_response"));
            inputField.style.display = "none";
            inputField.value = "";

            fetchLlamaResponse(select.id.replace("_option", ""), response => {
                inputField.style.display = "block";
                inputField.value = response;
                index++;
                setTimeout(setNextDropdown, 200);
            });
        }
    }

    setNextDropdown();
}

/** 
 * Function to handle smooth scrolling for the scroll arrow
 */
function setupScrollArrow() {
    const scrollArrow = document.getElementById("scroll-down");

    if (!scrollArrow) return;

    function toggleScroll() {
        const atBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
        scrollArrow.href = atBottom ? "#top" : "#bottom";
        scrollArrow.classList.toggle("reversed", atBottom);
    }

    scrollArrow.addEventListener("click", function (event) {
        event.preventDefault();
        window.scrollTo({ 
            top: scrollArrow.href.includes("#bottom") ? document.body.scrollHeight : 0,
            behavior: "smooth"
        });
    });

    window.addEventListener("scroll", toggleScroll);
    toggleScroll(); // Initial check
}

// function setupFileInputListener() {
//     const fileInput = document.querySelector('input[name="pdf-file"]');
//     if (!fileInput) return;
    
//     fileInput.addEventListener('change', function(e) {
//         const fileNameDisplay = document.getElementById('file-name-display');
//         fileNameDisplay.textContent = this.files[0]?.name || 'Choose a file';
//     });
// }

/** 
 * Function to check if the form should be shown based on a hidden input value
 */
function handleFormVisibility() {
    const showFormInput = document.getElementById("showFormInput");

    if (showFormInput) {
        console.log("showFormInput value:", showFormInput.value);
        if (showFormInput.value === "True") {
            console.log("Showing form");
            showForm();
        }
    } else {
        console.error("showFormInput element not found.");
    }
}

/** 
 * Function to update hidden input fields before submitting the PDF form.
 * This ensures modified content from contenteditable divs or inputs is saved.
 */
// function setupHiddenFieldUpdater() {
//     document.getElementById("generate-pdf-form").addEventListener("submit", function () {
//         document.querySelectorAll("textarea[id$='_response']").forEach(function (textareaField) {
//             let hiddenField = document.getElementById(textareaField.id + "_hidden");
//             if (hiddenField) {
//                 hiddenField.value = textareaField.value.trim(); // Copy textarea value into hidden input
//             }
//         });
//     });
// }

/** 
 * Function to capture values from textareas on form submission and send them to the backend
 */
function logTextareaValues() {
    document.getElementById("rfp-form").addEventListener("submit", function (event) {
        let formData = {};

        document.querySelectorAll("textarea[id$='_response']").forEach(function (textarea) {
            formData[textarea.name] = textarea.value.trim();
        });

        console.log("Captured Responses:", formData);

        // Send data to backend via fetch API
        fetch("/save_rfp_response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => console.log("Server Response:", data))
        .catch(error => console.error("Error:", error));

        // Prevent default form submission (if required)
        // event.preventDefault();
    });
}

/** 
 * Function to handle the "Generate PDF" button click event
 */
function setupGeneratePdfButton() {
    const generatePdfBtn = document.getElementById("generate-pdf-btn");
    if (!generatePdfBtn) {
        console.warn("⚠️ Generate PDF button not found.");
        return;
    }

    generatePdfBtn.addEventListener("click", function () {
        console.log("Button has been clicked");
        const statusElement = document.getElementById("pdf-status");
        if (statusElement) {
            statusElement.innerText = "⏳ Generating PDF...";
        }

        fetch("/generate_professional_pdf", { method: "POST" })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    statusElement.innerHTML = `✅ PDF generated successfully! 
                        <a href="${data.pdf_url}" download>Download PDF</a>`;
                } else {
                    statusElement.innerText = "❌ PDF generation failed.";
                }
            })
            .catch(error => {
                console.error("Error:", error);
                statusElement.innerText = "❌ Error generating PDF.";
            });
    });
}
