module SendMessage::MultiSigWallet {
    use aptos_framework::signer;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use std::vector;
    struct MultiSigWallet has store, key {
        owners: vector<address>,     
        required_signatures: u64,    
        balance: u64,              
        nonce: u64,                
    }
    struct PendingTransaction has store, key {
        to: address,               
        amount: u64,              
        approvals: vector<address>, 
        executed: bool,            
    }
    public fun create_wallet(
        creator: &signer, 
        owners: vector<address>, 
        required_signatures: u64
    ) {
       
        assert!(required_signatures > 0 && required_signatures <= vector::length(&owners), 1);
        
        let wallet = MultiSigWallet {
            owners,
            required_signatures,
            balance: 0,
            nonce: 0,
        };
        move_to(creator, wallet);
    }
    public fun propose_transaction(
        proposer: &signer,
        wallet_owner: address,
        to: address,
        amount: u64
    ) acquires MultiSigWallet, PendingTransaction {
        let wallet = borrow_global_mut<MultiSigWallet>(wallet_owner);
        let proposer_addr = signer::address_of(proposer);
        assert!(vector::contains(&wallet.owners, &proposer_addr), 2);
        assert!(wallet.balance >= amount, 3);
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
            if (vector::length(&pending_tx.approvals) >= wallet.required_signatures && !pending_tx.executed) {
                let payment = coin::withdraw<AptosCoin>(proposer, amount);
                coin::deposit<AptosCoin>(pending_tx.to, payment);
                wallet.balance = wallet.balance - amount;
                wallet.nonce = wallet.nonce + 1;
                pending_tx.executed = true;
            };
        };
    }

}
