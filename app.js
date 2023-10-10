// Function to calculate time difference
function calculateTimeSince(specificDate) {
  const currentTime = new Date();
  const timeDifference = currentTime - specificDate;

  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

// Function to get a formatted date string
function getFormattedDate(date) {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}, ${date.toLocaleTimeString()}`;
}

// Function to store a block in local storage
function storeBlock(block) {
  try {
    const titleInput = block.querySelector(".titleInput");
    const specificDateTimeInput = block.querySelector(".specificDateTimeInput");

    const blockData = {
      id: block.id,
      title: titleInput.value,
      date: new Date(specificDateTimeInput.value),
      formattedDate: getFormattedDate(new Date(specificDateTimeInput.value)),
    };

    localStorage.setItem(`block_${blockData.id}`, JSON.stringify(blockData));
  } catch (error) {
    console.error("Error storing block:", error);
  }
}

// Function to update the HTML content for a specific block
function updateHTML(block) {
  const titleInput = block.querySelector(".titleInput");
  const specificDateTimeInput = block.querySelector(".specificDateTimeInput");
  const timeSinceElement = block.querySelector(".timeSince");

  // Parse user input date and time
  const userInputDate = new Date(specificDateTimeInput.value);

  // Check if the input is a valid date and time
  if (isNaN(userInputDate.getTime())) {
    // If not valid, don't proceed
    return;
  }

  // Calculate time difference
  const time = calculateTimeSince(userInputDate);

  // Update HTML content with the user input title
  const formattedDate = getFormattedDate(userInputDate);
  timeSinceElement.textContent = `It has been ${time.days} days, ${time.hours} hours and ${time.minutes} minutes of days without ${titleInput.value} that started on ${formattedDate}.`;

  // Store user input in localStorage
  localStorage.setItem(`${block.id}_userInputDate`, userInputDate.toISOString());
  localStorage.setItem(`${block.id}_titleInput`, titleInput.value);
  localStorage.setItem(`${block.id}_formattedDate`, formattedDate); // Store the formatted date

  // Store block in local storage
  storeBlock(block);
}

// Function to add a new block
function addBlock() {
  const blocksContainer = document.getElementById("blocksContainer");

  // Create a new block div
  const newBlock = document.createElement("div");
  newBlock.className = "block";

  // Set unique ID for the new block using a timestamp
  const blockId = Date.now();
  newBlock.id = blockId;

  // Append HTML for the new block
  newBlock.innerHTML = `
    <label for="${blockId}_titleInput">Days without</label>
    <input type="text" class="titleInput" id="${blockId}_titleInput">
    <label for="${blockId}_specificDateTimeInput">Date and Time:</label>
    <input type="datetime-local" class="specificDateTimeInput" id="${blockId}_specificDateTimeInput">
    <button class="updateButton">Update</button>
    <button class="removeButton">Remove</button>
    <p class="timeSince" id="${blockId}_timeSince"></p>
  `;

  // Attach event listener for the "Update" button within the new block
  const updateButton = newBlock.querySelector(".updateButton");
  updateButton.addEventListener("click", function () {
    updateHTML(newBlock);
  });

  // Attach event listener for the "Remove" button within the new block
  const removeButton = newBlock.querySelector(".removeButton");
  removeButton.addEventListener("click", function () {
    removeBlock(newBlock);
  });

  // Append the new block to the container
  blocksContainer.appendChild(newBlock);

  // Retrieve and set stored input for the new block
  const storedInput = getUserInputFromLocalStorage(blockId);
  if (storedInput) {
    const { date, title } = storedInput;
    const titleInput = newBlock.querySelector(".titleInput");
    const specificDateTimeInput = newBlock.querySelector(".specificDateTimeInput");

    titleInput.value = title;
    specificDateTimeInput.value = date.toISOString().slice(0, 16);

    updateHTML(newBlock);
  }
}

// Function to remove a block
function removeBlock(block) {
  const blocksContainer = document.getElementById("blocksContainer");
  blocksContainer.removeChild(block);

  // Remove data from localStorage
  localStorage.removeItem(`${block.id}_userInputDate`);
  localStorage.removeItem(`${block.id}_titleInput`);
  localStorage.removeItem(`${block.id}_formattedDate`); // Remove formatted date

  // Remove block from local storage
  removeBlockFromStorage(block.id);
}

// Function to remove a block from local storage
function removeBlockFromStorage(blockId) {
  localStorage.removeItem(`block_${blockId}`);
}

// Function to get user input from localStorage for a specific block
function getUserInputFromLocalStorage(blockId) {
  const storedUserInput = localStorage.getItem(`${blockId}_userInputDate`);
  const storedTitleInput = localStorage.getItem(`${blockId}_titleInput`);

  if (storedUserInput && storedTitleInput) {
    const storedDate = new Date(storedUserInput);
    return { date: storedDate, title: storedTitleInput };
  }
  return null;
}

// Function to retrieve all stored blocks from local storage
function getStoredBlocks() {
  const storedBlocks = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("block_")) {
      try {
        const storedBlock = JSON.parse(localStorage.getItem(key));
        storedBlocks.push(storedBlock);
      } catch (error) {
        console.error("Error parsing stored block:", error);
      }
    }
  }
  return storedBlocks;
}

// Function to display existing blocks from local storage
function displayBlocksFromLocalStorage() {
  const blocksContainer = document.getElementById("blocksContainer");
  const storedBlocks = getStoredBlocks();

  if (storedBlocks && storedBlocks.length > 0) {
    storedBlocks.forEach((storedBlock) => {
      const newBlock = createBlock(storedBlock.id);
      blocksContainer.appendChild(newBlock);

      // Set values
      setBlockValues(newBlock, storedBlock);
      
      // Display time difference
      const timeSinceElement = newBlock.querySelector(".timeSince");
      const userInputDate = new Date(storedBlock.date);
      const time = calculateTimeSince(userInputDate);
      const formattedDate = getFormattedDate(userInputDate);
      timeSinceElement.textContent = `It has been ${time.days} days, ${time.hours} hours and ${time.minutes} minutes of days without ${storedBlock.title} that started on ${formattedDate}.`;

      // Update HTML content
      updateHTML(newBlock);
    });
  }
}

// Function to create a block with a specific ID
function createBlock(blockId) {
  const newBlock = document.createElement("div");
  newBlock.className = "block";
  newBlock.id = blockId;

  newBlock.innerHTML = `
    <label for="${blockId}_titleInput">Days without</label>
    <input type="text" class="titleInput" id="${blockId}_titleInput">
    <label for="${blockId}_specificDateTimeInput">Date and Time:</label>
    <input type="datetime-local" class="specificDateTimeInput" id="${blockId}_specificDateTimeInput">
    <button class="updateButton">Update</button>
    <button class="removeButton">Remove</button>
    <p class="timeSince" id="${blockId}_timeSince"></p>
  `;

  // Attach event listeners
  const updateButton = newBlock.querySelector(".updateButton");
  updateButton.addEventListener("click", function () {
    updateHTML(newBlock);
  });

  const removeButton = newBlock.querySelector(".removeButton");
  removeButton.addEventListener("click", function () {
    removeBlock(newBlock);
  });

  return newBlock;
}

// Function to set values for a block from stored data
function setBlockValues(block, storedBlock) {
  const titleInput = block.querySelector(".titleInput");
  const specificDateTimeInput = block.querySelector(".specificDateTimeInput");

  titleInput.value = storedBlock.title;

  // Check if the stored date is a valid Date object
  if (storedBlock.date instanceof Date && !isNaN(storedBlock.date.getTime())) {
    specificDateTimeInput.value = storedBlock.date.toISOString().slice(0, 16);
  }
}

// Event listener for the container to handle updates
const blocksContainer = document.getElementById("blocksContainer");
blocksContainer.addEventListener("click", function (event) {
  const target = event.target;

  // Check if the clicked element is an "Update" button within a block
  if (target.classList.contains("updateButton")) {
    const block = target.closest(".block");

    if (block) {
      // If the button is within a block, update that block
      updateHTML(block);
    }
  }
});

// Trigger addBlock function on page load
document.addEventListener("DOMContentLoaded", function () {
  // Display existing blocks from local storage
  displayBlocksFromLocalStorage();
});

// Trigger addBlock function when the "+" button is clicked
const addButton = document.getElementById("addButton");
addButton.addEventListener("click", addBlock);