// Latest version with added button

// function toggleUserInput(inputId, selectedOption) {
//     var inputField = document.getElementById(inputId);
//     console.log(`Selected option: ${selectedOption}`);
    
//     if (selectedOption === "user_input") {
//         inputField.style.display = "block";
//     } else {
//         inputField.style.display = "none";
//         // Clear the input field when hiding it
//         inputField.value = "";
//     }
// }

// function fetchLlamaResponse(fieldName, callback) {
//     var selectedOption = document.getElementById(fieldName + "_option").value;
//     if (selectedOption === "generate_llama") {
//         var xhr = new XMLHttpRequest();
//         xhr.open("POST", "/fetch_llama_response", true);
//         xhr.setRequestHeader("Content-Type", "application/json");
//         xhr.onload = function() {
//             if (xhr.status === 200) {
//                 callback(JSON.parse(xhr.responseText).response);
//             } else {
//                 console.error("Error fetching Llama response:", xhr.status, xhr.statusText);
//                 callback("Error fetching response");
//             }
//         };
//         xhr.send(JSON.stringify({ field_value: fieldName }));
//     }
// }

// document.addEventListener("DOMContentLoaded", function() {
//     console.log("DOM fully loaded and parsed");
    
//     document.querySelectorAll("select").forEach(function(select) {
//         var inputField = document.getElementById(select.id.replace('_option', '_response'));
        
//         if (select.value === "user_input") {
//             inputField.style.display = "block";
//         } else {
//             inputField.style.display = "none";
//             // Clear the input field when hiding it
//             inputField.value = "";
//         }

//         // Add an event listener to handle changes
//         select.addEventListener("change", function() {
//             console.log(`Dropdown changed to: ${select.value}`);
//             var inputField = document.getElementById(select.id.replace('_option', '_response'));
//             if (select.value === "user_input") {
//                 inputField.style.display = "block";
//             } else {
//                 inputField.style.display = "none";
//                 // Clear the input field when hiding it
//                 inputField.value = "";
//                 if (select.value === "generate_llama") {
//                     fetchLlamaResponse(select.id.replace('_option', ''), function(response) {
//                         inputField.style.display = "block"; // Ensure the field is visible
//                         inputField.value = response; // Set the Llama response
//                     });
//                 }
//             }
//         });
//     });
// });

// // New function to set dropdowns to 'Generate Llama Response' sequentially
// function setAllToLlamaSequentially() {
//     const selectElements = document.querySelectorAll("select");
//     let index = 0;

//     function setNextDropdown() {
//         if (index < selectElements.length) {
//             const select = selectElements[index];
//             select.value = "generate_llama"; // Set to 'Generate Llama Response'

//             // Trigger the change event to handle display updates
//             const inputField = document.getElementById(select.id.replace('_option', '_response'));
//             inputField.style.display = "none"; // Hide the input field initially
//             inputField.value = ""; // Clear previous value

//             // Fetch the Llama response for the current field
//             fetchLlamaResponse(select.id.replace('_option', ''), function(response) {
//                 inputField.style.display = "block"; // Show the input field
//                 inputField.value = response; // Set the Llama response
//                 index++; // Move to the next select element
//                 setTimeout(setNextDropdown, 1000); // Wait 1 second before setting the next dropdown
//             });
//         }
//     }

//     // Start the sequential setting process
//     setNextDropdown();
// }



// New version

const showFormInput = document.getElementById("showFormInput");
    if (showFormInput && showFormInput.value === "True") {
        showForm();  // Call the function to show forms
    }

function showForm() {
    document.getElementById('response-form').style.display = 'block';
    document.getElementById('llama-options').style.display = 'block';
    document.getElementById('generate-pdf-form').style.display = 'block';
}

// function startPDFProcessing(event) {
//     // event.preventDefault();
//     var eventSource = new EventSource("/process_pdf");
//     var messageContainer = document.getElementById("messages");

//     eventSource.onmessage = function(event) {
//         var newMessage = document.createElement("p");
//         newMessage.textContent = event.data;
//         messageContainer.appendChild(newMessage);
//     };

//     eventSource.onclose = function() {
//         var newMessage = document.createElement("p");
//         newMessage.textContent = "Processing completed!";
//         messageContainer.appendChild(newMessage);
//         eventSource.close();
//     };

//     eventSource.onerror = function() {
//         console.error("Error occurred while processing the PDF.");
//     };
// }

// function startPDFProcessing(event) {
//     event.preventDefault(); // Prevent the default form submission
    
//     const form = document.getElementById('pdf-upload-form');
//     const formData = new FormData(form); // Get the form data
//     const messagesContainer = document.getElementById("messages");
    
//     // Clear previous messages
//     messagesContainer.innerHTML = '';

//     // Create a new XMLHttpRequest to submit the PDF
//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", "/process_pdf", true);

//     xhr.onload = function () {
//         if (xhr.status === 200) {
//             // Successfully submitted the PDF, now start receiving messages
//             const eventSource = new EventSource("/stream_pdf_processing");
//             eventSource.onmessage = function (event) {
//                 // Create a new paragraph element for each message
//                 const newMessage = document.createElement("p");
//                 newMessage.textContent = event.data;
//                 messagesContainer.appendChild(newMessage);
//             };

//             eventSource.onerror = function () {
//                 console.error("Error occurred while processing the PDF.");
//                 eventSource.close();
//             };

//             eventSource.onclose = function () {
//                 console.log("EventSource connection closed.");
//                 const completionMessage = document.createElement("p");
//                 completionMessage.textContent = "Processing completed!";
//                 messagesContainer.appendChild(completionMessage);
//                 eventSource.close();
//             };
//         } else {
//             console.error("Error occurred during the PDF upload.");
//             messagesContainer.innerHTML += "<p>Error occurred while processing the PDF.</p>";
//         }
//     };

//     // Send the form data (PDF file)
//     xhr.send(formData);
// }

// Ensure the document is ready before binding the event
// document.addEventListener("DOMContentLoaded", function () {
//     const processButton = document.getElementById("process-pdf-button");
//     processButton.addEventListener("click", startPDFProcessing);
// });



function startProcessing(event) {
    event.preventDefault(); // Prevent the default form submission

    // const spinner = document.getElementById("spinner");
    // spinner.style.display = "block"; // Show the spinner

    // Create an EventSource to receive server-sent events
    const source = new EventSource("/process_pdf");

    // Clear previous messages
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = '';

    // Handle incoming messages from the server
    source.onmessage = function(event) {
        // Create a new div for the message
        const messageDiv = document.createElement("div");
        messageDiv.textContent = event.data; // Set the message text
        messagesDiv.appendChild(messageDiv); // Append the message to the messages area

        if (event.data.includes("complete")) {
            spinner.style.display = "none"; // Hide the spinner
            source.close(); // Close the EventSource
        }
    };

    source.onerror = function(event) {
        console.error("Error occurred:", event);
        messagesDiv.innerHTML += "<div>Error occurred while processing the PDF.</div>";
        spinner.style.display = "none"; // Hide the spinner
        source.close(); // Close the EventSource
    };
}


function toggleUserInput(inputId, selectedOption) {
    var inputField = document.getElementById(inputId);
    console.log(`Selected option: ${selectedOption}`);
    
    if (selectedOption === "user_input") {
        inputField.style.display = "block";
    } else {
        inputField.style.display = "none";
        // Clear the input field when hiding it
        inputField.value = "";
    }
}

function fetchLlamaResponse(fieldName, callback) {
    var selectedOption = document.getElementById(fieldName + "_option").value;
    if (selectedOption === "generate_llama") {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/fetch_llama_response", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function() {
            if (xhr.status === 200) {
                callback(JSON.parse(xhr.responseText).response);
            } else {
                console.error("Error fetching Llama response:", xhr.status, xhr.statusText);
                callback("Error fetching response");
            }
        };
        xhr.send(JSON.stringify({ field_value: fieldName }));
    }
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");
    
    document.querySelectorAll("select").forEach(function(select) {
        var inputField = document.getElementById(select.id.replace('_option', '_response'));
        
        if (select.value === "user_input") {
            inputField.style.display = "block";
        } else {
            inputField.style.display = "none";
            // Clear the input field when hiding it
            inputField.value = "";
        }

        // Add an event listener to handle changes
        select.addEventListener("change", function() {
            console.log(`Dropdown changed to: ${select.value}`);
            var inputField = document.getElementById(select.id.replace('_option', '_response'));
            if (select.value === "user_input") {
                inputField.style.display = "block";
            } else {
                inputField.style.display = "none";
                // Clear the input field when hiding it
                inputField.value = "";
                if (select.value === "generate_llama") {
                    fetchLlamaResponse(select.id.replace('_option', ''), function(response) {
                        inputField.style.display = "block"; // Ensure the field is visible
                        inputField.value = response; // Set the Llama response
                    });
                }
            }
        });
    });



    // document.querySelectorAll('input[type="text"]').forEach(function(inputField) {
    //     var expandBtn = document.createElement('button');
    //     expandBtn.textContent = "Expand";
    //     expandBtn.classList.add('expand-btn');
    
    //     // Add click event listener to toggle expansion
    //     expandBtn.addEventListener('click', function() {
    //         if (inputField.classList.contains('expanded')) {
    //             inputField.classList.remove('expanded');
    //             expandBtn.textContent = "Expand";
    //         } else {
    //             inputField.classList.add('expanded');
    //             expandBtn.textContent = "Collapse";
    //         }
    //     });
    
    //     // Insert the button after the input field
    //     inputField.parentNode.insertBefore(expandBtn, inputField.nextSibling);
    // });

    document.querySelectorAll('input[type="textarea"]').forEach(function(textAreaField) {
        var expandBtn = document.createElement('button');
        expandBtn.textContent = "Expand";
        expandBtn.classList.add('expand-btn');
    
        // Add click event listener to toggle expansion
        expandBtn.addEventListener('click', function() {
            if (textAreaField.classList.contains('expanded')) {
                textAreaField.classList.remove('expanded');
                expandBtn.textContent = "Expand";
            } else {
                textAreaField.classList.add('expanded');
                expandBtn.textContent = "Collapse";
            }
        });
    
        // Insert the button after the textarea
        textAreaField.parentNode.insertBefore(expandBtn, textAreaField.nextSibling);
    });
    
    
});

// New function to set dropdowns to 'Generate Llama Response' sequentially
function setAllToLlamaSequentially() {
    const selectElements = document.querySelectorAll("select");
    let index = 0;

    function setNextDropdown() {
        if (index < selectElements.length) {
            const select = selectElements[index];
            select.value = "generate_llama"; // Set to 'Generate Llama Response'

            // Trigger the change event to handle display updates
            const inputField = document.getElementById(select.id.replace('_option', '_response'));
            inputField.style.display = "none"; // Hide the input field initially
            inputField.value = ""; // Clear previous value

            // Fetch the Llama response for the current field
            fetchLlamaResponse(select.id.replace('_option', ''), function(response) {
                inputField.style.display = "block"; // Show the input field
                inputField.value = response; // Set the Llama response
                index++; // Move to the next select element
                setTimeout(setNextDropdown, 200); // Wait 1 second before setting the next dropdown
            });
        }
    }

    // Start the sequential setting process
    setNextDropdown();
}


// Newest version

// function toggleUserInput(inputId, selectedOption) {
//     var inputField = document.getElementById(inputId);
//     console.log(`Selected option: ${selectedOption}`);
    
//     if (selectedOption === "user_input") {
//         inputField.style.display = "block";
//         inputField.setAttribute("required", "required"); // Set 'required' when 'user_input' is selected
//     } else {
//         inputField.style.display = "none";
//         inputField.value = "";
//         inputField.removeAttribute("required"); // Remove 'required' attribute when not 'user_input'
//     }
// }

// function fetchLlamaResponse(fieldName, callback) {
//     var selectedOption = document.getElementById(fieldName + "_option").value;
//     if (selectedOption === "generate_llama") {
//         var xhr = new XMLHttpRequest();
//         xhr.open("POST", "/fetch_llama_response", true);
//         xhr.setRequestHeader("Content-Type", "application/json");
//         xhr.onload = function() {
//             if (xhr.status === 200) {
//                 callback(JSON.parse(xhr.responseText).response);
//             } else {
//                 console.error("Error fetching Llama response:", xhr.status, xhr.statusText);
//                 callback("Error fetching response");
//             }
//         };
//         xhr.send(JSON.stringify({ field_value: fieldName }));
//     }
// }

// document.addEventListener("DOMContentLoaded", function() {
//     console.log("DOM fully loaded and parsed");
    
//     document.querySelectorAll("select").forEach(function(select) {
//         var inputField = document.getElementById(select.id.replace('_option', '_response'));
        
//         if (select.value === "user_input") {
//             inputField.style.display = "block";
//             inputField.setAttribute("required", "required"); // Set 'required' when 'user_input' is selected
//         } else {
//             inputField.style.display = "none";
//             inputField.removeAttribute("required"); // Remove 'required' attribute when not 'user_input'
//             inputField.value = "";
//         }

//         // Add an event listener to handle changes
//         select.addEventListener("change", function() {
//             console.log(`Dropdown changed to: ${select.value}`);
//             var inputField = document.getElementById(select.id.replace('_option', '_response'));
            
//             if (select.value === "user_input") {
//                 inputField.style.display = "block";
//                 inputField.setAttribute("required", "required"); // Set 'required' when 'user_input' is selected
//             } else {
//                 inputField.style.display = "none";
//                 inputField.value = "";
//                 inputField.removeAttribute("required"); // Remove 'required' attribute when not 'user_input'

//                 if (select.value === "generate_llama") {
//                     fetchLlamaResponse(select.id.replace('_option', ''), function(response) {
//                         inputField.style.display = "block"; // Ensure the field is visible
//                         inputField.value = response; // Set the Llama response
//                         inputField.removeAttribute("required"); // Remove 'required' attribute for Llama response
//                     });
//                 }
//             }
//         });
//     });

//     // Add expand/collapse button for each input field
//     document.querySelectorAll('input[type="text"]').forEach(function(inputField) {
//         var expandBtn = document.createElement('button');
//         expandBtn.textContent = "Expand";
//         expandBtn.classList.add('expand-btn');

//         // Add click event listener to toggle expansion
//         expandBtn.addEventListener('click', function() {
//             if (inputField.classList.contains('expanded')) {
//                 inputField.classList.remove('expanded');
//                 expandBtn.textContent = "Expand";
//             } else {
//                 inputField.classList.add('expanded');
//                 expandBtn.textContent = "Collapse";
//             }
//         });

//         // Insert the button after the input field
//         inputField.parentNode.insertBefore(expandBtn, inputField.nextSibling);
//     });

//     // New function to set dropdowns to 'Generate Llama Response' sequentially
//     function setAllToLlamaSequentially() {
//             const selectElements = document.querySelectorAll("select");
//             let index = 0;
        
//             function setNextDropdown() {
//                 if (index < selectElements.length) {
//                     const select = selectElements[index];
//                     select.value = "generate_llama"; // Set to 'Generate Llama Response'
        
//                     // Trigger the change event to handle display updates
//                     const inputField = document.getElementById(select.id.replace('_option', '_response'));
//                     inputField.style.display = "none"; // Hide the input field initially
//                     inputField.value = ""; // Clear previous value
        
//                     // Fetch the Llama response for the current field
//                     fetchLlamaResponse(select.id.replace('_option', ''), function(response) {
//                         inputField.style.display = "block"; // Show the input field
//                         inputField.value = response; // Set the Llama response
//                         index++; // Move to the next select element
//                         setTimeout(setNextDropdown, 1000); // Wait 1 second before setting the next dropdown
//                     });
//                 }
//             }
        
//             // Start the sequential setting process
//             setNextDropdown();
//     }
// });
