const searchBar = document.querySelector('.searchbar.tables');
const tables = document.querySelectorAll('.table');

const noResultsMessage = document.createElement('p');
    searchBar.parentNode.appendChild(noResultsMessage);

searchBar.addEventListener('input', (e) => {
    noResultsMessage.textContent = '';
  const searchTerm = e.target.value.toLowerCase();

  tables.forEach(table => {
    const tableNumber = table.textContent.toLowerCase();
    if (tableNumber.includes(searchTerm)) {
      table.style.display = 'block';
    } else {
      table.style.display = 'none';
    }
  });

      // Check if any tables are displayed
  const displayedTables = Array.from(tables).filter(table => table.style.display !== 'none');
  if (displayedTables.length === 0) {
    noResultsMessage.textContent = 'No tables found....';
  } 
});



const menusearchBar = document.querySelector('.searchbar.menu');
const items = document.querySelectorAll('.items');

const noitemsMessage = document.createElement('p'); 
menusearchBar.parentNode.appendChild(noitemsMessage);


menusearchBar.addEventListener('input', (e) => {
  noitemsMessage.textContent = ''; 
  const query = e.target.value.toLowerCase();

  items.forEach(item => {
    const itemName = item.getAttribute('name').toLowerCase();

    if (itemName.includes(query)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });

  // Check for displayed items
  const displayedItems = Array.from(items).filter(item => item.style.display !== 'none');
  if (displayedItems.length === 0) {
    noitemsMessage.textContent = 'No items found...';
  } 
});





// Drag and Drop Functionality

items.forEach(itm => {
  itm.setAttribute('draggable', true);
  itm.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', itm.getAttribute('name'));
  });

  itm.addEventListener('click', () => {
      showMenuPopup(itm);
  });
});

// Handle table dragover and drop events
tables.forEach(table => {
  table.addEventListener('dragover', (e) => {
      e.preventDefault();
      table.classList.add('hovered');
  });

  table.addEventListener('dragleave', () => {
      table.classList.remove('hovered');
  });

  table.addEventListener('drop', (e) => {
      e.preventDefault();
      const itemName = e.dataTransfer.getData('text/plain');
      const draggedItem = Array.from(items).find(item => item.getAttribute('name').toLowerCase() === itemName.toLowerCase());
      if (draggedItem) {
          selectedItem = draggedItem;
          addToTable(table.id);
      }
      table.classList.remove('hovered');
  });

  // Show table details on click
  table.addEventListener('click', () => {
      showTableDetails(table.id);
  });
});

// Show menu popup with table selection
function showMenuPopup(item) {
  selectedItem = item;
  const menuPopup = document.createElement('div');
  menuPopup.classList.add('menu-popup');
  menuPopup.innerHTML = `
      <h3>${item.querySelector('h3').textContent}</h3>
      <p>Price: ${item.querySelector('span:nth-child(2)').textContent.split(': ')[1]}</p>
      <label for="tableSelect">Select Table:</label>
      <select id="tableSelect">
          ${Array.from(tables).map(table => `<option value="${table.id}">${table.querySelector('h3').textContent}</option>`).join('')}
      </select>
      <button onclick="addToSelectedTable()">Add to Selected Table</button>
      <button onclick="hideMenuPopup()">Close</button>
  `;
  document.body.appendChild(menuPopup);

  // Close popup on clicking outside
  setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
  }, 0);
}

// Hide menu popup
function hideMenuPopup() {
  const menuPopup = document.querySelector('.menu-popup');
  if (menuPopup) {
      menuPopup.remove();
      document.removeEventListener('click', handleClickOutside);
  }
  selectedItem = null;
}

// Handle click outside of menu popup
function handleClickOutside(event) {
  const menuPopup = document.querySelector('.menu-popup');
  if (menuPopup && !menuPopup.contains(event.target)) {
      hideMenuPopup();
  }
}

// Add selected item to a specific table's order
function addToTable(tableId) {
  const table = document.getElementById(tableId);
  if (table && selectedItem) {
      const tableOrder = JSON.parse(sessionStorage.getItem(tableId)) || [];
      const itemName = selectedItem.getAttribute('name');
      const itemPrice = parseInt(selectedItem.querySelector('span:nth-child(2)').textContent.split(': ')[1]);

      // Check if the item is already in the order, increase quantity if so
      const existingItem = tableOrder.find(item => item.name === itemName);
      if (existingItem) {
          existingItem.quantity += 1;
      } else {
          tableOrder.push({ name: itemName, price: itemPrice, quantity: 1 });
      }

      sessionStorage.setItem(tableId, JSON.stringify(tableOrder));
      updateTableInfo(table);
  }
}

// Add selected item to the table from the popup
function addToSelectedTable() {
  const tableSelect = document.getElementById('tableSelect');
  const selectedTableId = tableSelect.value;
  addToTable(selectedTableId);
  hideMenuPopup();
}

// Show table details (items list, quantity, delete option, and Bill button)
function showTableDetails(tableId) {
  const table = document.getElementById(tableId);
  const tableOrder = JSON.parse(sessionStorage.getItem(tableId)) || [];

  const tableDetailsPopup = document.createElement('div');
  tableDetailsPopup.classList.add('table-details-popup');
  tableDetailsPopup.innerHTML = `
      <h3>Order Details for ${table.querySelector('h3').textContent}</h3>
      <ul>
          ${tableOrder.map((item, index) => `
              <li>
                  ${item.name} - Rs: ${item.price} x ${item.quantity}
                  <button onclick="increaseItemQuantity('${tableId}', ${index})">+</button>
                  <button onclick="decreaseItemQuantity('${tableId}', ${index})">-</button>
                  <button onclick="removeItem('${tableId}', ${index})">Delete</button>
              </li>`).join('')}
      </ul>
      <button onclick="generateBill('${tableId}')">Generate Bill</button>
      <button onclick="hideTableDetailsPopup()">Close</button>
  `;
  document.body.appendChild(tableDetailsPopup);

  // Close popup on clicking outside
  setTimeout(() => {
      document.addEventListener('click', handleClickOutsideTableDetails);
  }, 0);
}

// Function to hide the table details popup
function hideTableDetailsPopup() {
  const tableDetailsPopup = document.querySelector('.table-details-popup');
  if (tableDetailsPopup) {
      tableDetailsPopup.remove();
      document.removeEventListener('click', handleClickOutsideTableDetails);
  }
}

// Handle click outside of table details popup
function handleClickOutsideTableDetails(event) {
  const tableDetailsPopup = document.querySelector('.table-details-popup');
  if (tableDetailsPopup && !tableDetailsPopup.contains(event.target)) {
      hideTableDetailsPopup();
  }
}


// Increase item quantity
function increaseItemQuantity(tableId, index) {
  const tableOrder = JSON.parse(sessionStorage.getItem(tableId)) || [];
  tableOrder[index].quantity += 1;
  sessionStorage.setItem(tableId, JSON.stringify(tableOrder));
  updateTableInfo(document.getElementById(tableId));
  showTableDetails(tableId); // Refresh the details popup
}

// Decrease item quantity (prevent decrementing below 1)
function decreaseItemQuantity(tableId, index) {
  const tableOrder = JSON.parse(sessionStorage.getItem(tableId)) || [];
  if (tableOrder[index].quantity > 1) {
      tableOrder[index].quantity -= 1;
      sessionStorage.setItem(tableId, JSON.stringify(tableOrder));
      updateTableInfo(document.getElementById(tableId));
      showTableDetails(tableId); // Refresh the details popup
  } else {
      alert("Quantity cannot be less than 1.");
  }
}
// Remove item from the order
function removeItem(tableId, index) {
  let tableOrder = JSON.parse(sessionStorage.getItem(tableId)) || [];
  tableOrder.splice(index, 1);
  sessionStorage.setItem(tableId, JSON.stringify(tableOrder));
  updateTableInfo(document.getElementById(tableId));
  showTableDetails(tableId); // Refresh the details popup
}

// Update table info (total items and cost)
function updateTableInfo(table) {
  const tableId = table.id;
  const order = JSON.parse(sessionStorage.getItem(tableId)) || [];
  const totalElement = table.querySelector(`#total${tableId.slice(-1)}`);
  const nitemsElement = table.querySelector(`#nitems${tableId.slice(-1)}`);

  let total = order.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  totalElement.textContent = total;
  nitemsElement.textContent = order.reduce((acc, item) => acc + item.quantity, 0);
}

// Generate bill and clear session (only if items are present)
function generateBill(tableId) {
  const table = document.getElementById(tableId);
  const order = JSON.parse(sessionStorage.getItem(tableId)) || [];

  if (order.length === 0) {
      alert("No items added to generate a bill.");
      return;
  }

  let bill = `Table: ${tableId}\n`;
  order.forEach(item => {
      bill += `${item.name} - Rs: ${item.price} x ${item.quantity} = Rs: ${item.price * item.quantity}\n`;
  });
  bill += `Total: Rs: ${order.reduce((acc, item) => acc + (item.price * item.quantity), 0)}`;
  alert(bill);
  sessionStorage.removeItem(tableId);
  updateTableInfo(table);
  hideTableDetailsPopup();
}


// Initialize table information on page load
function initializeTableInfo() {
  tables.forEach(table => {
      updateTableInfo(table);
  });
}

// Call the initialization function when the page loads
window.addEventListener('load', initializeTableInfo);