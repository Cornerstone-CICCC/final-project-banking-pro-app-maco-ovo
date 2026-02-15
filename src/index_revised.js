const fs = require('fs');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const Table = require('cli-table3');

// Import the business logic from core.js
const core = require('./core');

const dataPath = path.resolve(process.cwd(), 'bank-data.json');

// Global state for application data
let data = { accounts: [] };
let saving = false;

// Setup Readline interface for User Input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

// --- Data Management ---

function loadData() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return;
  }
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(raw);
    if (!data || !Array.isArray(data.accounts)) {
      data = { accounts: [] };
    }
  } catch (error) {
    console.log(chalk.yellow('Warning: Data file corrupted. Starting with empty data.'));
    data = { accounts: [] };
  }
}

function saveData() {
  if (saving) return;
  saving = true;
  fs.writeFile(dataPath, JSON.stringify(data, null, 2), (err) => {
    saving = false;
    if (err) {
      console.log(chalk.red('Failed to save data.'));
    }
  });
}

// --- UI Helper Functions ---

function renderHeader() {
  console.log(chalk.cyan('======================================'));
  console.log(chalk.cyan('=            BANKCLI PRO v1.1        ='));
  console.log(chalk.cyan('======================================'));
}

function renderMenu() {
  console.log('1. Create New Account');
  console.log('2. View Account Details');
  console.log('3. List All Accounts');
  console.log('4. Deposit Funds');
  console.log('5. Withdraw Funds');
  console.log('6. Transfer Between Accounts');
  console.log('7. View Transaction History');
  console.log('8. Delete Account');
  console.log('9. Exit Application');
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

async function pause() {
  await ask(chalk.gray('\nPress Enter to continue...'));
}

// --- Application Features (Using core.js) ---

async function createAccount() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Create New Account'));

  const holderName = await ask('Account holder name: ');
  const initialDepositInput = await ask('Initial deposit amount: ');
  const initialDeposit = parseFloat(initialDepositInput);

  // Call logic from core.js
  const result = core.createAccount(holderName, initialDeposit, data.accounts);

  if (result.error) {
    console.log(chalk.red(`Error: ${result.error}`));
  } else {
    saveData();
    console.log(chalk.green(`Account created successfully. ID: ${result.account.id}`));
  }
  
  await pause();
}

async function viewAccountDetails() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('View Account Details'));

  const id = await ask('Account ID: ');
  
  const result = core.viewAccountDetails(id.trim(), data.accounts);

  if (result.error) {
    console.log(chalk.red(`Error: ${result.error}`));
  } else {
    const account = result.account;
    const lines = [
      `Account: ${account.id}`,
      `Holder: ${account.holderName}`,
      `Balance: ${formatMoney(account.balance)}`,
      `Opened: ${account.createdAt.split('T')[0]}`,
    ];

    const width = Math.max(...lines.map((line) => line.length)) + 4;
    const border = `+${'-'.repeat(width - 2)}+`;

    console.log(border);
    lines.forEach((line) => console.log(`| ${line.padEnd(width - 4)} |`));
    console.log(border);
  }

  await pause();
}

async function listAllAccounts() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('All Accounts'));

  const result = core.listAllAccounts(data.accounts);

  if (result.error) {
    console.log(chalk.yellow(result.error));
  } else {
    const table = new Table({
      head: ['ID', 'Holder Name', 'Balance', 'Status'],
    });

    result.accounts.forEach((account) => {
      table.push([
        account.id,
        account.holderName,
        formatMoney(account.balance),
        'ACTIVE',
      ]);
    });

    console.log(table.toString());

    const totalBalance = result.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    console.log(`Total accounts: ${result.accounts.length}`);
    console.log(`Total balance: ${formatMoney(totalBalance)}`);
  }

  await pause();
}

async function depositFunds() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Deposit Funds'));

  const id = await ask('Account ID: ');
  const amountInput = await ask('Deposit amount: ');
  const amount = parseFloat(amountInput);

  const result = core.depositFunds(id.trim(), amount, data.accounts);

  if (result.error) {
    console.log(chalk.red(`Error: ${result.error}`));
  } else {
    saveData();
    console.log(chalk.green(`Deposit complete. New balance: ${formatMoney(result.account.balance)}`));
  }
  
  await pause();
}

async function withdrawFunds() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Withdraw Funds'));

  const id = await ask('Account ID: ');
  const amountInput = await ask('Withdrawal amount: ');
  const amount = parseFloat(amountInput);

  const result = core.withdrawFunds(id.trim(), amount, data.accounts);

  if (result.error) {
    console.log(chalk.red(`Error: ${result.error}`));
  } else {
    saveData();
    console.log(chalk.green(`Withdrawal complete. New balance: ${formatMoney(result.account.balance)}`));
  }

  await pause();
}

async function transferFunds() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Transfer Between Accounts'));

  const fromId = await ask('From Account ID: ');
  const toId = await ask('To Account ID: ');
  const amountInput = await ask('Transfer amount: ');
  const amount = parseFloat(amountInput);

  const result = core.transferFunds(fromId.trim(), toId.trim(), amount, data.accounts);

  if (result.error) {
    console.log(chalk.red(`Error: ${result.error}`));
  } else {
    saveData();
    console.log(chalk.green('Transfer completed successfully.'));
  }

  await pause();
}

async function viewTransactionHistory() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Transaction History'));

  const id = await ask('Account ID: ');

  const result = core.viewTransactionHistory(id.trim(), data.accounts);

  if (result.error) {
    console.log(chalk.red(`Error: ${result.error}`));
  } else {
    const table = new Table({
      head: ['Date', 'Type', 'Amount', 'Balance After'],
    });

    result.transactions.forEach((transaction) => {
      table.push([
        transaction.timestamp.split('T')[0],
        transaction.type,
        formatMoney(transaction.amount),
        formatMoney(transaction.balanceAfter),
      ]);
    });

    console.log(table.toString());
  }

  await pause();
}

async function deleteAccount() {
  console.clear();
  renderHeader();
  console.log(chalk.bold('Delete Account'));

  const id = await ask('Account ID: ');

  const result = core.deleteAccount(id.trim(), data.accounts);

  if (result.error) {
    console.log(chalk.red(`Error: ${result.error}`));
  } else {
    saveData();
    console.log(chalk.green('Account deleted successfully.'));
  }

  await pause();
}

async function exitApp() {
  console.log(chalk.cyan('Saving and exiting...'));
  saveData();
  rl.close();
  process.exit(0);
}

// --- Main Application Loop ---

async function main() {
  loadData();

  while (true) {
    console.clear();
    renderHeader();
    renderMenu();

    const choice = await ask('Select option (1-9): ');

    switch (choice.trim()) {
      case '1':
        await createAccount();
        break;
      case '2':
        await viewAccountDetails();
        break;
      case '3':
        await listAllAccounts();
        break;
      case '4':
        await depositFunds();
        break;
      case '5':
        await withdrawFunds();
        break;
      case '6':
        await transferFunds();
        break;
      case '7':
        await viewTransactionHistory();
        break;
      case '8':
        await deleteAccount();
        break;
      case '9':
        await exitApp();
        break;
      default:
        console.log(chalk.red('Invalid option. Please select 1-9.'));
        await pause();
        break;
    }
  }
}


main();