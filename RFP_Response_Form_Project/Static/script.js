document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed");
    
    // Check the value of the hidden input to determine if the form should be shown
    const showFormInput = document.getElementById("showFormInput");
    console.log("showFormInput:", showFormInput); 

    // if (showFormInput && showFormInput.value === "True") {
    //     console.log("Showing form");
    //     showForm();  // Call the function to show forms
    // }

    if (showFormInput) {
        console.log("showFormInput value:", showFormInput.value);  // Log its value
        if (showFormInput.value === "True") {
            console.log("Showing form");
            showForm();  
        }
    } else {
        console.error("showFormInput element not found.");
    }

    // Check for flash messages and display them
    // const flashMessages = document.querySelectorAll('.flash-messages li');
    // if (flashMessages.length > 0) {
    //     flashMessages.forEach(msg => {
    //         // alert(msg.textContent);
    //         var messageDisplay = document.getElementById('messages');

    //         // Set the text content of the <h4> element
    //         messageDisplay.textContent += msg.textContent + '\n'; 
    //     });
    // }

    // document.addEventListener("DOMContentLoaded", function() {
    //     console.log("DOM fully loaded and parsed");
    
    //     const flashMessages = document.querySelectorAll('.flash-messages li');
    //     console.log(`Found ${flashMessages.length} flash messages.`);
    //     const messageDisplay = document.getElementById('message-display');
    
    //     if (flashMessages.length > 0) {
    //         let delay = 5000; // Time in milliseconds between messages
    //         console.log("Messages are being retrieved properly");
    
    //         flashMessages.forEach((msg, index) => {
    //             console.log(`Setting timeout for message ${index + 1}: ${msg.textContent}`);
    //             setTimeout(() => {
    //                 const messageText = document.createTextNode(msg.textContent);
    //                 messageDisplay.appendChild(messageText); // Append text to <h4>
                    
    //                 // Optionally add a line break for each message
    //                 messageDisplay.appendChild(document.createElement('br'));
    //             }, delay * index); // Multiply delay by index to space out messages
    //         });
    //     } else {
    //         console.log("No flash messages found.");
    //     }
    // });

    // document.addEventListener("DOMContentLoaded", function() {
    //     console.log("DOM fully loaded and parsed");
    
    //     const flashMessages = document.querySelectorAll('.flash-messages li');
    //     const messageDisplay = document.getElementById('message-display');
    
    //     // Create an array to store the messages
    //     const messagesArray = Array.from(flashMessages).map(msg => msg.textContent);
        
    //     if (messagesArray.length > 0) {
    //         let delay = 10000; // Time in milliseconds between messages
    //         console.log("Messages are being retrieved properly:", messagesArray);
    
    //         // Function to display messages one by one
    //         function displayMessages(index) {
    //             console.log(`Attempting to display message at index: ${index}`);
                
    //             if (index < messagesArray.length) {
    //                 const messageText = document.createTextNode(messagesArray[index]);
    //                 messageDisplay.appendChild(messageText); // Append text to <h4>
    //                 messageDisplay.appendChild(document.createElement('br')); // Optional line break
    
    //                 console.log(`Displayed message ${index + 1}: ${messagesArray[index]}`); // Log each displayed message
                    
    //                 // Set a timeout to display the next message
    //                 setTimeout(() => {
    //                     console.log(`Setting up next message display after ${delay}ms`);
    //                     displayMessages(index + 1);
    //                 }, delay);
    //             } else {
    //                 console.log("All messages displayed.");
    //             }
    //         }
    
    //         // Start displaying messages from the first one
    //         displayMessages(0);
    //     } else {
    //         console.log("No flash messages found.");
    //     }
    // });

    document.addEventListener("DOMContentLoaded", function() {
        console.log("DOM fully loaded and parsed");
    
        // Select all flash messages in the list
        const flashMessages = document.querySelectorAll('.flash-messages li');
        const messageDisplay = document.getElementById('message-display');
    
        // Create an array to store the messages
        const messagesArray = Array.from(flashMessages).map(msg => msg.textContent);
        
        if (messagesArray.length > 0) {
            let delay = 3000; // Time in milliseconds between messages
            console.log("Messages are being retrieved properly:", messagesArray);
    
            // Function to display messages one by one
            function displayMessages(index) {
                if (index < messagesArray.length) {
                    const messageText = document.createTextNode(messagesArray[index]);
                    messageDisplay.appendChild(messageText); // Append text to <h3>
                    messageDisplay.appendChild(document.createElement('br')); // Optional line break
    
                    console.log(`Displayed message ${index + 1}: ${messagesArray[index]}`); // Log each displayed message
                    
                    // Set a timeout to display the next message after the current delay
                    setTimeout(() => {
                        displayMessages(index + 1); // Call the function recursively to display the next message
                    }, delay);
                } else {
                    console.log("All messages displayed.");
                }
            }
    
            // Start displaying messages from the first one
            displayMessages(0);
        } else {
            console.log("No flash messages found.");
        }


         // Add new functionality for textarea content submission
        // const generatePdfForm = document.getElementById("generate-pdf-form");
        // if (generatePdfForm) {
        //     generatePdfForm.addEventListener("submit", function () {
        //         console.log("Form is being submitted, ensuring textarea content is captured.");
        //         document.querySelectorAll("textarea").forEach(function (textarea) {
        //             textarea.value = textarea.value.trim();
        //         });
        //     });
        // }
    });
    
    
    
    

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

// Function to show the forms
function showForm() {
    document.getElementById('response-form').style.display = 'block';
    document.getElementById('llama-options').style.display = 'block';
    document.getElementById('generate-pdf-form').style.display = 'block';
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

// document.getElementById('scroll-down').addEventListener('click', function(event) {
//     event.preventDefault(); // Prevent default anchor behavior
//     window.scrollTo({
//         top: document.body.scrollHeight, // Scroll to the bottom
//         behavior: 'smooth' // Smooth scrolling
//     });
// });

// Get the arrow element
const scrollArrow = document.getElementById('scroll-down');

// Function to toggle between top and bottom scrolling
function toggleScroll() {
    const atBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
    
    if (atBottom) {
        // If at the bottom, change href to scroll to top and reverse the arrow
        scrollArrow.href = "#top";
        scrollArrow.classList.add('reversed'); // Add class to reverse the arrow
    } else {
        // If not at the bottom, change href to scroll to bottom and reset the arrow
        scrollArrow.href = "#bottom";
        scrollArrow.classList.remove('reversed'); // Remove class to reset the arrow
    }
}

// Event listener for click to handle smooth scrolling
scrollArrow.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default anchor behavior

    // Scroll based on href
    if (scrollArrow.href.includes("#bottom")) {
        window.scrollTo({
            top: document.body.scrollHeight, // Scroll to the bottom
            behavior: 'smooth' // Smooth scrolling
        });
    } else {
        window.scrollTo({
            top: 0, // Scroll to the top
            behavior: 'smooth' // Smooth scrolling
        });
    }
});

// Event listener to detect scrolling and toggle the arrow
window.addEventListener('scroll', toggleScroll);

// Initial check when the page loads
toggleScroll();


// document.addEventListener("DOMContentLoaded", function () {
//     const scrollArrow = document.getElementById("scroll-arrow");
//     const arrowIcon = scrollArrow.querySelector("i");

//     // Function to scroll to the top
//     function scrollToTop() {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     }

//     // Function to scroll to the bottom
//     function scrollToBottom() {
//         window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
//     }

//     // Toggle the arrow direction based on scroll position
//     function toggleArrow() {
//         const scrollPosition = window.scrollY;
//         const windowHeight = window.innerHeight;
//         const documentHeight = document.body.scrollHeight;

//         // Check if the user is at the bottom of the page
//         if (scrollPosition + windowHeight >= documentHeight - 50) {
//             // User is at the bottom, reverse the arrow to point upwards
//             scrollArrow.classList.add('reversed');
//         } else {
//             // User is not at the bottom, show the arrow pointing down
//             scrollArrow.classList.remove('reversed');
//         }
//     }

//     // Scroll event listener to detect when the user scrolls
//     window.addEventListener("scroll", toggleArrow);

//     // Initial call to set the arrow direction
//     toggleArrow();

//     // Click event listener for the arrow
//     scrollArrow.addEventListener("click", function () {
//         if (scrollArrow.classList.contains('reversed')) {
//             scrollToTop(); // Scroll to the top if the arrow is reversed
//         } else {
//             scrollToBottom(); // Scroll to the bottom if the arrow is pointing down
//         }
//     });
// });




