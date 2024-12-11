
// the initial state of all the store object
const initialState = {
  isShopping: false,
  shoppingBag: [],
  currentItem: null,
  shippingCost: 0,
  USState: undefined,
  state: 'set-item',
  tax: 0.15,
  itemTotal: 0,
  subTotal: 0,
  taxAmount: 0,
}
// store is assigned the initial state with empty values
let store = { ...initialState }; 
// the list of items. added a plural name to ask for quantities
const items = [ 
  {name: 'Chair', pluralName: 'Chairs', price: 25.50},
  {name: 'Recliner', pluralName: 'Recliners', price: 37.75},
  {name: 'Table', pluralName: 'Tables', price: 49.95},
  {name: 'Umbrella', pluralName: 'Umbrellas', price: 24.89}
]

// an array of items containing the name only
// used later to compare the user input easily
const itemArray = items.map(i => i.name.toLowerCase());
// the list of shipping cost by zones
const shippingCost = [0, 20, 30, 35, 45, 50];
// the list of US states ordered by zones
const statesByZone = [
  "MN", "ND", "SD", "NE", "IA", "WI", "KS", "MO", "IL", "WY", // Zone 1
  "MT", "ID", "WA", "OR", // Zone 2
  "CA", "NV", "UT", "AZ", "CO", "NM", // Zone 3
  "OK", "TX", "AR", "LA", "MS", "AL", "TN", "KY", "OH", "IN", "MI", // Zone 4
  "WV", "VA", "NC", "MD", "DE", "PA", "NJ", "NY", "CT", "RI", "MA", "VT", "NH", "ME", // Zone 5
  "GA", "FL", "SC" // Zone 6
];
// this function takes a state and returns the cost of shipping
const getShippingCost = state => {
  // state index
  const index = statesByZone.findIndex(st => st === state.toUpperCase())
  switch (true) {
    // compare the index to retrieve the shipping zone cost
    case (index <= 9) : return shippingCost[0];
    case (index <= 13) : return shippingCost[1];
    case (index <= 19) : return shippingCost[2];
    case (index <= 30) : return shippingCost[3];
    case (index <= 44) : return shippingCost[4];
    case (index <= 47) : return shippingCost[5];
    default : return index;
  }
}
// all the instructions to the user
const prompts = {
  itemQuestion: 'What item would you like to buy today: Chair, Recliner, Table or Umbrella?',
  // function instead of static string
  // takes an "item" parameter and add this to the string
  itemQuantity: item => `How many ${item || ''} would you like to buy?`,
  continueQuestion: 'Continue shopping? y/n',
  enterState: 'Please enter the two letter state abbreviation.'
}

const errors = { // stores all error texts
  invalidYesNo: 'Error: Only "Yes" or "No" allowed.',
  invalidNumber: 'Error: Invalid number.',
  invalidState: 'Error: Invalid state abbreviation.',
  emptyInput: 'Error: Input is empty.',
  nullInput: 'Error: Operation canceled.',
  invalidEntry: 'Error: Invalid Entry.',
}
// search the item in the store shopping bag
// if item exists, adds the quantity
// if not found, adds to the list 
const addItems = (item, quantity) => {
  const index = store.shoppingBag.findIndex(i => i.name === item.name);
  if(index !== -1) {
    store.shoppingBag[index].quantity += quantity;
  } else {
    store.shoppingBag.push({...item, ...{ quantity }});
  }
  // update store total for invoice
  store.itemTotal += (item.price * quantity);
}
// outputs the html for the invoice items table
const getTableItems = () => {
  let itemsOutput = '';
  store.shoppingBag.forEach(item => {
    itemsOutput += '<tr>';
    itemsOutput += `<td>${item.name}</td>`;
    itemsOutput += `<td>${item.quantity}</td>`;
    itemsOutput += `<td>$${item.price.toFixed(2)}</td>`;
    itemsOutput += `<td>$${(item.price * item.quantity).toFixed(2)}</td>`;
    itemsOutput += '</tr>';
  });
  return itemsOutput;
}
// outputs the html of the transaction details
const getTransactionOutput = () => {
  let transactionOutput = `<tr><td>Item Total:</td><td>$${store.itemTotal.toFixed(2)}</td></tr>`;
      transactionOutput += `<tr><td>Shipping to ${store.USState}: <td>$${store.shippingCost.toFixed(2)}</td></tr>`;
      transactionOutput += `<tr><td>Subtotal:</td><td>$${store.subTotal.toFixed(2)}</td></tr>`;
      transactionOutput += `<tr><td>Tax:</td><td>$${store.taxAmount.toFixed(2)}</td></tr>`;
      transactionOutput += `<tr><td>Invoice Total:</td><td>$${(store.subTotal + store.taxAmount).toFixed(2)}</td></tr>`;
  return transactionOutput;
}
// does some transaction calculations
const calculateTransactions = () => {
  store.subTotal = store.itemTotal + store.shippingCost;
  store.taxAmount = store.itemTotal * store.tax;
}
// resets the store and start it again
const restartStore = () => {
  // set store as the initial object
  store = { ...initialState };
  // shallow copy of the array needs to be updated manually
  store.shoppingBag = [];
  startStore();
}
// dinamyc prompt and error catching
const askUser = (message) => {
  const input = prompt(message);
  let error;
  if(input?.trim() === '' || input === null) 
    error = input?.trim() === '' ? errors.emptyInput : errors.nullInput;
  return { input, error };
}
// shows error messages
const showError = error => alert(error);
// the main function of the store
const startStore = () => {
  store.isShopping = true;
  // main store loop
  while(store.isShopping) {
    let res = {}; // local response for every prompt
    // the switch will show prompts and run logic using the store state
    switch(store.state) {
      case 'set-item': // initial state
        res = askUser(prompts.itemQuestion); // response (input & error)
        // item exists validation
        const isItem = res.input && itemArray.includes(res.input.toLowerCase());
        // evaluates for error
        if(!res.error && isItem) { 
          // get item index
          const index = itemArray.findIndex(i => i === res.input.toLowerCase());
          store.currentItem = items[index]; // save item in the store
          store.state = 'set-quantity'; // move to next state
        } else {
          // if is error choose the error message to show
          showError(!isItem ? errors.invalidEntry : res.error);
        }
        break;

      case 'set-quantity': // ask the quantity of the iten selected
        // response (input & error)
        res = askUser(prompts.itemQuantity(store.currentItem.pluralName));
        const quatity = parseInt(res.input);
        // validate the input for number
        const isNumber = !isNaN(quatity) && quatity > 0;
        // evaluate for errors
        if(!res.error && isNumber) {
          addItems(store.currentItem, quatity); // add item
          store.state = 'continue'; // move to next state
        } else {
          // if is error choose the error message to show
          showError(!isNumber ? errors.invalidNumber : res.error)
        }
        break;

      case 'continue': // ask the user if continue shopping
        res = askUser(prompts.continueQuestion); // response (input & error)
        // valid yes input
        const isYes = res.input && res.input.toLowerCase() === 'y';
        // valid no input
        const isNo = res.input && res.input.toLowerCase() === 'n';
        // evaluate for errors
        if(!res.error && (isYes || isNo)) {
          // yes moves the state to the initial
          // no moves the state forward
          store.state = isYes ? 'set-item' : 'set-shipping';
        } else {
          // if is error choose the error message to show
          showError(res.error ? res.error : errors.invalidEntry);
        }
        break;

      case 'set-shipping': // ask user the US state 
        res = askUser(prompts.enterState); // response (input & error)
        // valid US state
        const isUSState = res.input && statesByZone.includes(res.input.toUpperCase());
        // evaluate for errors
        if(!res.error && isUSState) {
          // save US state in the store
          store.USState = res.input.toUpperCase();
          // save shipping cost in the store
          store.shippingCost = getShippingCost(res.input);
          store.state = 'show-invoice'; // move to next state
        } else {
          // if is error choose the error message to show
          showError(!isUSState ? errors.invalidState : res.error);
        }
        break;
      
      case 'show-invoice': // show invoice tables and stop the loop
        // get container with the initial button
        const buttonContainer = document.getElementById('button-container');
        // get container with the invoice tables
        const invoiceContainer = document.getElementById('invoice-container');
        // get tbody element of items table
        const tableItems = document.getElementById('invoice-items');
        // get tbody element of transaction details table
        const tableTransaction = document.getElementById('invoice-transaction');
        // calculate some of the totals for the invoice
        calculateTransactions();
        // get html outputs
        const itemsOutput = getTableItems();
        const transactionOutput = getTransactionOutput();
        // add outputs to the corresponfing table elements
        tableItems.innerHTML = itemsOutput;
        tableTransaction.innerHTML = transactionOutput;
        // toggle containers visibility
        buttonContainer.style.display = 'none';
        invoiceContainer.style.display = 'block';
        // stop the loop
        store.isShopping = false;
        break;
    }
  }
}