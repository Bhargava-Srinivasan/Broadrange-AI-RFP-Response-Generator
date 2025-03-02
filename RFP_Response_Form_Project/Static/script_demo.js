document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");

    // Show form if hidden input value is True
    const showFormInput = document.getElementById("showFormInput");
    if (showFormInput?.value === "True") {
        console.log("Showing form");
        showForm();
    }

    // Flash message handling
    const messageDisplay = document.getElementById("message-display");
    if (messageDisplay) {
        const flashMessages = JSON.parse(document.getElementById("flash-messages").textContent || "[]");
        let delay = 0;
        flashMessages.forEach(msg => {
            setTimeout(() => {
                const messageText = document.createElement("p");
                messageText.textContent = msg;
                messageDisplay.appendChild(messageText);
            }, delay);
            delay += 2000;
        });
    }

    // Handle dropdown change to show input or fetch Llama response
    document.querySelectorAll("select").forEach(select => {
        select.addEventListener("change", function() {
            const parent = this.closest(".field-container");
            const textInput = parent.querySelector(".text-input");
            const loader = parent.querySelector(".loader");
            const responseArea = parent.querySelector(".llama-response");
            
            if (this.value === "manual_input") {
                textInput.style.display = "block";
                responseArea.style.display = "none";
            } else if (this.value === "generate_llama") {
                textInput.style.display = "none";
                responseArea.style.display = "block";
                loader.style.display = "inline-block";
                
                fetchLlamaResponse(parent, loader, responseArea);
            }
        });
    });

    // Expand/Collapse Textareas
    document.querySelectorAll(".expand-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            const textarea = this.previousElementSibling;
            textarea.style.height = textarea.style.height === "100px" ? "" : "100px";
        });
    });

    // Set all dropdowns to "Generate Llama Response" sequentially
    document.getElementById("setAllLlamaBtn")?.addEventListener("click", setAllToLlamaSequentially);
});

function fetchLlamaResponse(parent, loader, responseArea) {
    fetch("/generate_llama_response")
        .then(response => response.text())
        .then(data => {
            responseArea.textContent = data;
            loader.style.display = "none";
        })
        .catch(error => {
            console.error("Error fetching Llama response:", error);
            responseArea.textContent = "Error loading response.";
            loader.style.display = "none";
        });
}

function setAllToLlamaSequentially() {
    const selectElements = document.querySelectorAll("select");
    selectElements.forEach((select, index) => {
        setTimeout(() => {
            select.value = "generate_llama";
            select.dispatchEvent(new Event("change"));
        }, index * 1000);
    });
}
