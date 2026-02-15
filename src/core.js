

function generateAccountId(accounts) {
    let id = '';
    do {
      id = `ACC-${Math.floor(1000 + Math.random() * 9000)}`;
    } while (accounts.some((account) => account.id === id));
    return id;
}

// =================================
// //  1. Create a new account
// =================================

function createAccount(name, amount, accounts) {
    // Bug fix　[TP-003]: Return error if initial deposit is not a number (NaN) 
    if (typeof amount !== 'number' || isNaN(amount)) {
        return { error: 'Invalid input' };
    }
    // Bug fix [TP-002]: Return error if initial deposit is negative
    if (amount < 0) {
        return { error: 'Negative amount not accepted' };
    }

    const id = generateAccountId(accounts);
    const now = new Date().toISOString();

    // Create the new account data structure
    const newAccount = {
        id,
        holderName: name,
        balance: amount,
        createdAt: now,
        transactions: [{
            type: 'DEPOSIT',
            amount: amount,
            timestamp: now,
            balanceAfter: amount,
            description: 'Initial deposit',
        }],
    };

    // Add to account list and return success result
    accounts.push(newAccount);
    return { success: true, account: newAccount };
}



// =================================
// //  2. View Account Details
// =================================
function viewAccountDetails(id, accounts) {
    const account = accounts.find((a) => a.id === id);
    if (!account) return { error: 'Account not found' };
    
    return { success: true, account };
}



// =================================
// //  3. List All Accounts
// =================================
function listAllAccounts(accounts) {
    if (accounts.length === 0) return { error: 'No accounts found' };
    
    return { success: true, accounts };
}



// =================================
// //.    4. Deposit Funds
// =================================

function depositFunds(id, amount, accounts) {
    // Find the target account by ID
    const account = accounts.find((a) => a.id === id);
    
    if (!account) return { error: 'Account not found' };
    
    // Bug fix [TP-006,009,019]: Block deposit if amount is not a number or is zero/negative
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        return { error: 'Invalid amount' };
    }


    account.balance += amount;
    account.transactions.push({
        type: 'DEPOSIT',
        amount,
        timestamp: new Date().toISOString(),
        balanceAfter: account.balance,
        description: 'Deposit',
    });

    return { success: true, account };
}

// ==================================
// //     5. Withdraw Funds
// ==================================

function withdrawFunds(id, amount, accounts) {
    // Find the target account by ID
    const account = accounts.find((a) => a.id === id);
    
    if (!account) return { error: 'Account not found' };

    // Bug fix [TP-008]: Block withdrawal if amount is not a number or is zero/negative
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        return { error: 'Invalid amount' };
    }

    // Bug fix [TP-010]: Return error if balance is less than withdrawal amount (insufficient funds)
    if (amount > account.balance) {
        return { error: 'Insufficient funds' };
    }

    // Decrease balance and record transaction history
    account.balance -= amount;
    account.transactions.push({
        type: 'WITHDRAWAL',
        amount,
        timestamp: new Date().toISOString(),
        balanceAfter: account.balance,
        description: 'Withdrawal',
    });

    return { success: true, account };
}

// ===========================================
// // 6. Transfer Funds between accounts
// ===========================================

function transferFunds(fromId, toId, amount, accounts) {
    const fromAccount = accounts.find((a) => a.id === fromId);
    const toAccount = accounts.find((a) => a.id === toId);

    // Bug fix [TP-022]: Prevent transfer if source account does not exist
    if (!fromAccount) return { error: 'Source account not found' };
    // Bug fix [TP-021]: Prevent transfer if recipient account does not exist 
    if (!toAccount) return { error: 'Recipient account not found' };
    
    // Bug fix [TP-023] [TP-024]: Block transfer if amount is not a number or is zero/negative
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
        return { error: 'Input valid transfer amount' };
    }

    // Bug fix: Return error if source account has insufficient funds
    if (fromAccount.balance < amount) {
        return { error: 'Insufficient funds' };
    }

    // Deduct from source and add to recipient
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    const timestamp = new Date().toISOString();

    // Record source transaction history
    fromAccount.transactions.push({
        type: 'TRANSFER_OUT',
        amount,
        timestamp,
        balanceAfter: fromAccount.balance,
        description: `To ${toId}`,
    });

    // Record recipient transaction history
    toAccount.transactions.push({
        type: 'TRANSFER_IN',
        amount,
        timestamp,
        balanceAfter: toAccount.balance,
        description: `From ${fromId}`,
    });

    return { success: true };
}


// =================================
// //  7. View Transaction History
// =================================
function viewTransactionHistory(id, accounts) {
    const account = accounts.find((a) => a.id === id);
    if (!account) return { error: 'Account not found' };
    if (account.transactions.length === 0) return { error: 'No transactions found' };
    
    return { success: true, transactions: account.transactions };
}



// =================================
// //  8. Delete Account
// =================================
function deleteAccount(id, accounts) {
    const index = accounts.findIndex((a) => a.id === id);
    if (index === -1) return { error: 'Account not found' };
    
    accounts.splice(index, 1);
    return { success: true };
}




module.exports = {
    createAccount,
    depositFunds,
    withdrawFunds,
    transferFunds,
    viewAccountDetails,
    listAllAccounts,
    viewTransactionHistory,
    deleteAccount
};