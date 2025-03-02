document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");
  
    // Check the value of the hidden input to determine if the form should be shown
    const showFormInput = document.getElementById("showFormInput");
    console.log("showFormInput:", showFormInput);
  
    if (showFormInput) {
      console.log("showFormInput value:", showFormInput.value); // Log its value
      if (showFormInput.value === "True") {
        console.log("Showing form");
        showForm();
      }
    } else {
      console.error("showFormInput element not found.");
    }
  
    // Display flash messages one by one
    const flashMessages = document.querySelectorAll(".flash-messages li");
    const messageDisplay = document.getElementById("message-display");
  
    // Create an array to store the messages
    const messagesArray = Array.from(flashMessages).map((msg) => msg.textContent);
  
    if (messagesArray.length > 0) {
      let delay = 3000; // Time in milliseconds between messages
      console.log("Messages are being retrieved properly:", messagesArray);
  
      // Function to display messages one by one
      function displayMessages(index) {
        if (index < messagesArray.length) {
          const messageText = document.createTextNode(messagesArray[index]);
          messageDisplay.appendChild(messageText); // Append text to <h3>
          messageDisplay.appendChild(document.createElement("br")); // Optional line break
  
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
  
    // Handle dropdown changes
    document.querySelectorAll("select").forEach(function (select) {
      var inputField = document.getElementById(select.id.replace("_option", "_response"));
  
      if (select.value === "user_input") {
        inputField.style.display = "block";
      } else {
        inputField.style.display = "none";
        // Clear the input field when hiding it
        inputField.value = "";
      }
  
      // Add an event listener to handle changes
      select.addEventListener("change", function () {
        console.log(`Dropdown changed to: ${select.value}`);
        var inputField = document.getElementById(select.id.replace("_option", "_response"));
        if (select.value === "user_input") {
          inputField.style.display = "block";
        } else {
          inputField.style.display = "none";
          // Clear the input field when hiding it
          inputField.value = "";
          if (select.value === "generate_llama") {
            fetchLlamaResponse(select.id.replace("_option", ""), function (response) {
              inputField.style.display = "block"; // Ensure the field is visible
              inputField.value = response; // Set the Llama response
            });
          }
        }
      });
    });
  
    // Add expand/collapse buttons to textareas
    document.querySelectorAll('input[type="textarea"]').forEach(function (textAreaField) {
      var expandBtn = document.createElement("button");
      expandBtn.textContent = "Expand";
      expandBtn.classList.add("expand-btn");
  
      // Add click event listener to toggle expansion
      expandBtn.addEventListener("click", function () {
        if (textAreaField.classList.contains("expanded")) {
          textAreaField.classList.remove("expanded");
          expandBtn.textContent = "Expand";
        } else {
          textAreaField.classList.add("expanded");
          expandBtn.textContent = "Collapse";
        }
      });
  
      // Insert the button after the textarea
      textAreaField.parentNode.insertBefore(expandBtn, textAreaField.nextSibling);
    });
  
    // Handle form submission for generating PDF
    const generatePdfForm = document.getElementById("generate-pdf-form");
    if (generatePdfForm) {
      generatePdfForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent default form submission
  
        // Validate textarea values
        let isValid = true;
        const textareas = document.querySelectorAll("textarea");
        textareas.forEach((textarea) => {
          if (!textarea.value.trim()) {
            isValid = false;
            textarea.style.border = "1px solid red"; // Highlight empty fields
          } else {
            textarea.style.border = ""; // Reset border
          }
        });
  
        if (!isValid) {
          alert("Please fill out all required fields.");
          return;
        }
  
        // Update hidden inputs
        textareas.forEach((textarea) => {
          const hiddenInput = document.getElementById(textarea.id + "_hidden");
          if (hiddenInput) {
            hiddenInput.value = textarea.value.trim();
          }
        });
  
        // Submit the form via AJAX
        const form = event.target;
        const formData = new FormData(form);
  
        fetch(form.action, {
          method: "POST",
          body: formData,
        })
          .then((response) => response.blob())
          .then((blob) => {
            // Create a link to download the generated PDF
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "generated_response.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          })
          .catch((error) => {
            console.error("Error generating PDF:", error);
            alert("An error occurred while generating the PDF. Please try again.");
          });
      });
    }
  });
  
  // Function to show the forms
  function showForm() {
    document.getElementById("response-form").style.display = "block";
    document.getElementById("llama-options").style.display = "block";
    document.getElementById("generate-pdf-form").style.display = "block";
  }
  
  // Function to toggle user input fields
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
  
  // Function to fetch Llama responses
  function fetchLlamaResponse(fieldName, callback) {
    var selectedOption = document.getElementById(fieldName + "_option").value;
    if (selectedOption === "generate_llama") {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/fetch_llama_response", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.onload = function () {
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
  
  // Function to set all dropdowns to 'Generate Llama Response' sequentially
  function setAllToLlamaSequentially() {
    const selectElements = document.querySelectorAll("select");
    let index = 0;
  
    function setNextDropdown() {
      if (index < selectElements.length) {
        const select = selectElements[index];
        select.value = "generate_llama"; // Set to 'Generate Llama Response'
  
        // Trigger the change event to handle display updates
        const inputField = document.getElementById(select.id.replace("_option", "_response"));
        inputField.style.display = "none"; // Hide the input field initially
        inputField.value = ""; // Clear previous value
  
        // Fetch the Llama response for the current field
        fetchLlamaResponse(select.id.replace("_option", ""), function (response) {
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
  
  // Handle scroll arrow behavior
  const scrollArrow = document.getElementById("scroll-down");
  
  // Function to toggle between top and bottom scrolling
  function toggleScroll() {
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight;
  
    if (atBottom) {
      // If at the bottom, change href to scroll to top and reverse the arrow
      scrollArrow.href = "#top";
      scrollArrow.classList.add("reversed"); // Add class to reverse the arrow
    } else {
      // If not at the bottom, change href to scroll to bottom and reset the arrow
      scrollArrow.href = "#bottom";
      scrollArrow.classList.remove("reversed"); // Remove class to reset the arrow
    }
  }
  
  // Event listener for click to handle smooth scrolling
  scrollArrow.addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default anchor behavior
  
    // Scroll based on href
    if (scrollArrow.href.includes("#bottom")) {
      window.scrollTo({
        top: document.body.scrollHeight, // Scroll to the bottom
        behavior: "smooth", // Smooth scrolling
      });
    } else {
      window.scrollTo({
        top: 0, // Scroll to the top
        behavior: "smooth", // Smooth scrolling
      });
    }
  });
  
  // Event listener to detect scrolling and toggle the arrow
  window.addEventListener("scroll", toggleScroll);
  
  // Initial check when the page loads
  toggleScroll();