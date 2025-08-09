module SendMessage::MultiSigWallet {
    use aptos_framework::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::vector;

    /// Struct representing a multi-signature wallet
    struct MultiSigWallet has store, key {
        owners: vector<address>,     // List of wallet owners
        required_signatures: u64,    // Number of signatures required for transactions
        balance: u64,               // Wallet balance
        nonce: u64,                 // Transaction nonce to prevent replay attacks
    }

    /// Struct to track transaction approvals
    struct PendingTransaction has store, key {
        to: address,                // Recipient address
        amount: u64,               // Transaction amount
        approvals: vector<address>, // List of owners who approved
        executed: bool,            // Whether transaction was executed
    }

    /// Function to create a new multi-sig wallet
    public fun create_wallet(
        creator: &signer, 
        owners: vector<address>, 
        required_signatures: u64
    ) {
        // Ensure required signatures is valid
        assert!(required_signatures > 0 && required_signatures <= vector::length(&owners), 1);
        
        let wallet = MultiSigWallet {
            owners,
            required_signatures,
            balance: 0,
            nonce: 0,
        };
        move_to(creator, wallet);
    }

    /// Function to propose and potentially execute a transaction
    public fun propose_transaction(
        proposer: &signer,
        wallet_owner: address,
        to: address,
        amount: u64
    ) acquires MultiSigWallet, PendingTransaction {
        let wallet = borrow_global_mut<MultiSigWallet>(wallet_owner);
        let proposer_addr = signer::address_of(proposer);
        
        // Verify proposer is an owner
        assert!(vector::contains(&wallet.owners, &proposer_addr), 2);
        
        // Check sufficient balance
        assert!(wallet.balance >= amount, 3);
        
        // Create or update pending transaction
        if (!exists<PendingTransaction>(wallet_owner)) {
            let pending_tx = PendingTransaction {
                to,
                amount,
                approvals: vector::singleton(proposer_addr),
                executed: false,
            };
            move_to(proposer, pending_tx);
        } else {
            let pending_tx = borrow_global_mut<PendingTransaction>(wallet_owner);
            if (!vector::contains(&pending_tx.approvals, &proposer_addr)) {
                vector::push_back(&mut pending_tx.approvals, proposer_addr);
            };
            
            // Execute if enough approvals
            if (vector::length(&pending_tx.approvals) >= wallet.required_signatures && !pending_tx.executed) {
                // Transfer coins
                let payment = coin::withdraw<AptosCoin>(proposer, amount);
                coin::deposit<AptosCoin>(pending_tx.to, payment);
                
                // Update wallet state
                wallet.balance = wallet.balance - amount;
                wallet.nonce = wallet.nonce + 1;
                pending_tx.executed = true;
            };
        };
    }
}