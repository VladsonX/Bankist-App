'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [
    [200, '2019-11-18T21:31:17.178Z'],
    [455.23, '2019-12-23T07:42:02.383Z'],
    [-306.5, '2020-01-28T09:15:04.904Z'],
    [25000, '2020-04-01T10:17:24.185Z'],
    [-642.21, '2020-05-08T14:11:59.604Z'],
    [-133.9, '2020-05-27T17:01:17.194Z'],
    [79.97, '2020-07-11T23:36:17.929Z'],
    [1300, '2020-07-12T10:51:36.790Z'],
  ],
  interestRate: 1.2, // %
  pin: 1111,
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [
    [5000, '2019-11-01T13:15:33.035Z'],
    [3400, '2019-11-30T09:48:16.867Z'],
    [-150, '2019-12-25T06:04:23.907Z'],
    [-790, '2020-01-25T14:18:46.235Z'],
    [-3210, '2020-02-05T16:33:06.386Z'],
    [-1000, '2020-04-10T14:43:26.374Z'],
    [8500, '2020-06-25T18:49:59.371Z'],
    [-30, '2020-07-26T12:01:20.894Z'],
  ],
  interestRate: 1.5,
  pin: 2222,
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Event Handlers
let currentAccount;
btnLogin.addEventListener('click', e => {
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value,
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // display UI and welcome message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ').at(0)}`;

    const nowDate = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options,
    ).format(nowDate);
    containerApp.style.opacity = 100;
    updateUI(currentAccount);
    inputLoginPin.value = inputLoginUsername.value = '';
    inputLoginPin.blur();
  }
});

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  const recipient = accounts.find(
    acc => acc.username === inputTransferTo.value,
  );
  const amount = +inputTransferAmount.value;
  if (
    recipient &&
    amount > 0 &&
    currentAccount.balance >= amount &&
    recipient !== currentAccount
  ) {
    const deposit = [amount, new Date().toISOString()];
    recipient.movements.push(deposit);

    const withdrawal = [-amount, new Date().toISOString()];
    currentAccount.movements.push(withdrawal);
    console.log('Transfer valid');
    updateUI(currentAccount);
  }
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferTo.blur();
  inputTransferAmount.blur();
});

btnClose.addEventListener('click', e => {
  e.preventDefault();
  if (
    currentAccount.username === inputCloseUsername.value &&
    currentAccount.pin === +inputClosePin.value
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username,
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
  }
});

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  const loanAmount = Math.floor(+inputLoanAmount.value);
  if (
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov[0] >= loanAmount * 0.1)
  ) {
    const loan = [loanAmount, new Date().toISOString()];
    currentAccount.movements.push(loan);
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

btnSort.addEventListener('click', e => {
  e.preventDefault();
  if (!sortType) sortType = 'ascending';
  else if (sortType === 'ascending') sortType = 'descending';
  else sortType = undefined;
  console.log(sortType);

  displayMovements(currentAccount, sortType);
});
// functions
function calcDaysPassed(date1, date2) {
  return Math.floor(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
}
function updateUI(account) {
  displayMovements(account);
  calcDisplayBalance(account);
  calcDisplaySummary(account);
}

function createDateMovementsDescr(date) {
  const daysPassed = calcDaysPassed(new Date(), date.now);
  switch (true) {
    case daysPassed === 0:
      return 'today';
    case daysPassed === 1:
      return 'yesterday';
    case daysPassed <= 7:
      return `${daysPassed} days ago`;
    default:
      return `${date.day}/${date.month}/${date.year}`;
  }
}

function createDateNow(date = new Date().toISOString()) {
  const objDate = {};
  objDate.now = new Date(date);
  objDate.day = String(objDate.now.getDate()).padStart(2, 0);
  objDate.month = String(objDate.now.getMonth() + 1).padStart(2, 0);
  objDate.year = objDate.now.getFullYear();
  objDate.hour = String(objDate.now.getHours()).padStart(2, 0);
  objDate.min = String(objDate.now.getMinutes()).padStart(2, 0);
  return objDate;
}
function displayMovements(account, sort) {
  containerMovements.innerHTML = '';
  const movs =
    sort === 'ascending'
      ? account.movements.toSorted((a, b) => a[0] - b[0])
      : sort === 'descending'
        ? account.movements.toSorted((a, b) => b[0] - a[0])
        : account.movements;

  movs.forEach(([movement, movDate], index) => {
    const date = createDateNow(movDate);
    const dateString = createDateMovementsDescr(date);
    console.log(dateString);

    const type = movement < 0 ? 'withdrawal' : 'deposit';
    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${index + 1} ${type}</div>
      <div class="movements__date">${dateString}</div>
      <div class="movements__value">${movement.toFixed(2)}€</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

function createUserName(account) {
  account.username = account.owner
    .split(' ')
    .map(name => name.at(0).toLocaleLowerCase())
    .join('');
}

function createUserNameForAllUsers(users) {
  return users.forEach(user => createUserName(user));
}

function calcDisplayBalance(account) {
  const balance = account.movements.reduce((acc, mov) => acc + mov[0], 0);
  console.log(balance);

  account.balance = balance.toFixed(2);
  labelBalance.textContent = account.balance + '€';
}

function calcDisplaySummary(account) {
  const depositsSum = account.movements
    .filter(deposit)
    .reduce((sum, mov) => sum + mov[0], 0)
    .toFixed(2);
  labelSumIn.textContent = `${depositsSum}€`;

  const withdrawalsSum = account.movements
    .filter(withdrawal)
    .reduce((sum, mov) => sum + mov[0], 0)
    .toFixed(2);
  labelSumOut.textContent = `${Math.abs(withdrawalsSum)}€`;

  const interest = account.movements
    .filter(deposit)
    .map(mov => (mov * account.interestRate) / 100)
    .filter(interest => interest >= 1)
    .reduce((acc, mov) => acc + mov, 0)
    .toFixed(2);
  labelSumInterest.textContent = `${interest}€`;
}

function deposit(movement) {
  return movement[0] > 0;
}

function withdrawal(movement) {
  return movement[0] < 0;
}

// variables
const eurToUsd = 1.1;
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

let sortType;

const deposits = movements.filter(mov => mov > 0);
const withdrawals = movements.filter(mov => mov < 0);
const balance = movements.reduce((acc, mov) => acc + mov, 0);

// main
createUserNameForAllUsers(accounts);

// FAKE LOGIN
currentAccount = account1;
updateUI(account1);
containerApp.style.opacity = 100;

const numThousandDeposits = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov >= 1000).length;
console.log(numThousandDeposits);

const convertTitleCase = function (string) {
  const words = string.split(' ');
  console.log(words);

  return words.reduce((result, word) => {
    result = `${result} ${word.length <= 2 ? word : word.replace(word[0], word[0].toUpperCase())}`;
    return result;
  }, '');
};

console.log(convertTitleCase('hello my name is aboba'));
