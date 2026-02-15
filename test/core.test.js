const bank = require('../src/core');

describe('Bank Logic Tests', () => {
  let accounts;
  beforeEach(() => {
    accounts = [];      // Reset the accounts array before each test 
  });



  // ==========================================
  // //       1. CREATE ACCOUNT
  // ==========================================

  describe('Create Account (createAccount)', () => {
    test('TP-001: Should create a new account successfully', () => {
  
      const result = bank.createAccount('Makoto', 1000, accounts);
      

      expect(result.success).toBe(true);
      expect(result.account.holderName).toBe('Makoto');
      expect(result.account.balance).toBe(1000);
      expect(accounts.length).toBe(1);
    });

    test('TP-002: Should NOT create account with negative deposit', () => {
      const result = bank.createAccount('BadUser', -500, accounts);
      
      expect(result.error).toBe('Negative amount not accepted');
      expect(accounts.length).toBe(0); // Ensure no account was saved
    });

    test('TP-003: Should NOT create account with non-numeric deposit', () => {
      const result = bank.createAccount('BadUser', 'abc', accounts);
      
      expect(result.error).toBe('Invalid input');
      expect(accounts.length).toBe(0);
    });

    test('TP-004: Should allow duplicate names with unique IDs', () => {
      bank.createAccount('Makoto', 1000, accounts);
      bank.createAccount('Makoto', 500, accounts);
      
      expect(accounts.length).toBe(2);
      expect(accounts[0].id).not.toBe(accounts[1].id); // IDs must be different
    });
  });



  // ==========================================
  // //       2. VIEW ACCOUNT DETAILS
  // ==========================================

  describe('View Account Details ', () => {
    test('Should return account details successfully', () => {
      bank.createAccount('Makoto', 1000, accounts);
      const accountId = accounts[0].id;

      const result = bank.viewAccountDetails(accountId, accounts);
      expect(result.success).toBe(true);
      expect(result.account.holderName).toBe('Makoto');
    });

    test('Should return error if account not found ', () => {
      const result = bank.viewAccountDetails('ACC-MISSING', accounts);
      expect(result.error).toBe('Account not found');
    });
  });





  // ==========================================
  // //       3. LIST ALL ACCOUNTS
  // ==========================================

  describe('List All Accounts ', () => {
    test('Should list all accounts successfully ', () => {
      bank.createAccount('Jamie', 1000, accounts);
      bank.createAccount('Awshaf', 500, accounts);

      const result = bank.listAllAccounts(accounts);
      expect(result.success).toBe(true);
      expect(result.accounts.length).toBe(2);
    });

    test('Should return error if no accounts exist ', () => {
      const result = bank.listAllAccounts(accounts);
      expect(result.error).toBe('No accounts found');
    });
  });





  // ==========================================
  // //          4. DEPOSIT FUNDS
  // ==========================================

  describe('Deposit Funds', () => {
    test('TP-005: Should deposit funds correctly', () => {
      // Setup: Create an account first
      bank.createAccount('Makoto', 1000, accounts);
      const accountId = accounts[0].id;

      // Act
      const result = bank.depositFunds(accountId, 500, accounts);

      // Assert
      expect(result.success).toBe(true);
      expect(result.account.balance).toBe(1500); 
    });

    test('TP-006: Should block negative deposit', () => {
      bank.createAccount('Makoto', 1000, accounts);
      const accountId = accounts[0].id;

      const result = bank.depositFunds(accountId, -500, accounts);

      expect(result.error).toBe('Invalid amount');
      expect(accounts[0].balance).toBe(1000); // Balance should remain unchanged
    });

    test('Should return error for non-existent account', () => {
      const result = bank.depositFunds('ACC-MISSING', 500, accounts);
      expect(result.error).toBe('Account not found');
    });
  });



  // ==========================================
  // //         5. WITHDRAW FUNDS
  // ==========================================

  describe('Withdraw Funds ', () => {
    test('TP-007: Should withdraw funds correctly', () => {
      bank.createAccount('Makoto', 1000, accounts);
      const accountId = accounts[0].id;

      const result = bank.withdrawFunds(accountId, 300, accounts);

      expect(result.success).toBe(true);
      expect(result.account.balance).toBe(700); 
    });

    test('TP-008: Should block negative withdrawal', () => {
      bank.createAccount('Makoto', 1000, accounts);
      const accountId = accounts[0].id;

      const result = bank.withdrawFunds(accountId, -100, accounts);

      expect(result.error).toBe('Invalid amount');
      expect(accounts[0].balance).toBe(1000);
    });

    test('TP-010: Should block withdrawal exceeding balance', () => {
      bank.createAccount('Makoto', 100, accounts);
      const accountId = accounts[0].id;

      const result = bank.withdrawFunds(accountId, 500, accounts);

      expect(result.error).toBe('Insufficient funds');
      expect(accounts[0].balance).toBe(100);
    });
  });



  // ==========================================
  // //         6. TRANSFER FUNDS
  // ==========================================

  describe('Transfer Funds', () => {
    test('TP-011: Should transfer funds correctly', () => {
      bank.createAccount('Alice', 1000, accounts);
      bank.createAccount('Bob', 0, accounts);
      const aliceId = accounts[0].id;
      const bobId = accounts[1].id;

      const result = bank.transferFunds(aliceId, bobId, 200, accounts);

      expect(result.success).toBe(true);
      expect(accounts[0].balance).toBe(800);
      expect(accounts[1].balance).toBe(200);
    });

    test('TP-021: Should block transfer if recipient missing', () => {
      bank.createAccount('Alice', 1000, accounts);
      const aliceId = accounts[0].id;

      const result = bank.transferFunds(aliceId, 'ACC-MISSING', 200, accounts);

      expect(result.error).toBe('Recipient account not found');
      expect(accounts[0].balance).toBe(1000); // Sender should not lose money
    });

    test('TP-022: Should block transfer if source missing', () => {
      bank.createAccount('Bob', 0, accounts);
      const bobId = accounts[0].id;

      const result = bank.transferFunds('ACC-MISSING', bobId, 200, accounts);

      expect(result.error).toBe('Source account not found');
    });

    test('TP-023 & TP-024: Should block invalid transfer amount', () => {
      bank.createAccount('Alice', 1000, accounts);
      bank.createAccount('Bob', 0, accounts);
      const aliceId = accounts[0].id;
      const bobId = accounts[1].id;

      const resultNegative = bank.transferFunds(aliceId, bobId, -200, accounts);
      const resultString = bank.transferFunds(aliceId, bobId, 'abc', accounts);

      expect(resultNegative.error).toBe('Input valid transfer amount');
      expect(resultString.error).toBe('Input valid transfer amount');
    });

    test('Should block transfer exceeding balance', () => {
      bank.createAccount('Alice', 100, accounts);
      bank.createAccount('Bob', 0, accounts);
      const aliceId = accounts[0].id;
      const bobId = accounts[1].id;

      const result = bank.transferFunds(aliceId, bobId, 500, accounts);

      expect(result.error).toBe('Insufficient funds');
    });
  });



  // ==========================================
  // //       7. VIEW TRANSACTION HISTORY
  // ==========================================

  describe('View Transaction History ', () => {
    test('TP-015: Should view transaction history successfully', () => {
      bank.createAccount('Makoto', 1000, accounts);
      const accountId = accounts[0].id;
      bank.depositFunds(accountId, 500, accounts); // Make a transaction

      const result = bank.viewTransactionHistory(accountId, accounts);
      
      expect(result.success).toBe(true);
      // createAccount and depositFunds = 2 transactions
      expect(result.transactions.length).toBe(2); 
    });

    test('Should return error if account not found for history ', () => {
      const result = bank.viewTransactionHistory('ACC-MISSING', accounts);
      expect(result.error).toBe('Account not found');
    });
  });




  // ==========================================
  // //       8. DELETE ACCOUNT
  // ==========================================
  describe('Delete Account ', () => {
    test('Should delete account successfully ', () => {
      bank.createAccount('Makoto', 1000, accounts);
      const accountId = accounts[0].id;

      const result = bank.deleteAccount(accountId, accounts);
      
      expect(result.success).toBe(true);
      expect(accounts.length).toBe(0); // Account should be gone
    });

    test('Should return error if account to delete is not found', () => {
      const result = bank.deleteAccount('ACC-MISSING', accounts);
      expect(result.error).toBe('Account not found');
    });
  });


  
});