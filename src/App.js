
import React, { useState, useEffect } from 'react';
import { Wallet, Users, Send, Shield, Plus, CheckCircle, Clock } from 'lucide-react';


const MultiSigWallet = () => {
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [pendingTxs, setPendingTxs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Create Wallet State
  const [newWalletOwners, setNewWalletOwners] = useState(['']);
  const [requiredSigs, setRequiredSigs] = useState(2);
  
  // Transaction State
  const [txRecipient, setTxRecipient] = useState('');
  const [txAmount, setTxAmount] = useState('');
  
  // Mock data for demonstration
  useEffect(() => {
    if (connectedWallet) {
      setWalletData({
        balance: 1250.75,
        owners: [
          '0xff7888ecbb1359446f7babaf2eca50e13eac98532d4443d251d4992f149c63da',
          '0x1234567890abcdef1234567890abcdef12345678',
          '0xabcdef1234567890abcdef1234567890abcdef12'
        ],
        requiredSignatures: 2,
        nonce: 5
      });
      
      setPendingTxs([
        {
          id: 1,
          to: '0x9876543210fedcba9876543210fedcba98765432',
          amount: 100,
          approvals: ['0xff7888ecbb1359446f7babaf2eca50e13eac98532d4443d251d4992f149c63da'],
          requiredSigs: 2,
          executed: false
        }
      ]);
    }
  }, [connectedWallet]);

  const connectWallet = () => {
    // Mock wallet connection
    setConnectedWallet('0xff7888ecbb1359446f7babaf2eca50e13eac98532d4443d251d4992f149c63da');
  };

  const addOwnerField = () => {
    setNewWalletOwners([...newWalletOwners, '']);
  };

  const updateOwner = (index, value) => {
    const updated = [...newWalletOwners];
    updated[index] = value;
    setNewWalletOwners(updated);
  };

  const removeOwner = (index) => {
    if (newWalletOwners.length > 1) {
      setNewWalletOwners(newWalletOwners.filter((_, i) => i !== index));
    }
  };

  const createWallet = async () => {
    const validOwners = newWalletOwners.filter(owner => owner.trim());
    if (validOwners.length < requiredSigs) {
      alert('Number of owners must be >= required signatures');
      return;
    }
    
    // Mock wallet creation
    alert(`Creating wallet with ${validOwners.length} owners, requiring ${requiredSigs} signatures`);
    setActiveTab('overview');
  };

  const proposeTransaction = async () => {
    if (!txRecipient || !txAmount) {
      alert('Please fill in all transaction fields');
      return;
    }
    
    // Mock transaction proposal
    const newTx = {
      id: pendingTxs.length + 1,
      to: txRecipient,
      amount: parseFloat(txAmount),
      approvals: [connectedWallet],
      requiredSigs: walletData.requiredSignatures,
      executed: false
    };
    
    setPendingTxs([...pendingTxs, newTx]);
    setTxRecipient('');
    setTxAmount('');
    alert('Transaction proposed successfully!');
  };

  const approveTx = (txId) => {
    setPendingTxs(pendingTxs.map(tx => {
      if (tx.id === txId && !tx.approvals.includes(connectedWallet)) {
        const newApprovals = [...tx.approvals, connectedWallet];
        return {
          ...tx,
          approvals: newApprovals,
          executed: newApprovals.length >= tx.requiredSigs
        };
      }
      return tx;
    }));
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  if (!connectedWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md w-full border border-white/20">
          <Shield className="h-16 w-16 text-purple-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Multi-Sig Wallet</h1>
          <p className="text-purple-200 mb-8">Secure your assets with multi-signature protection</p>
          <button
            onClick={connectWallet}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Multi-Sig Wallet</h1>
                <p className="text-purple-200">Connected: {formatAddress(connectedWallet)}</p>
              </div>
            </div>
            {walletData && (
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{walletData.balance} APT</p>
                <p className="text-purple-200">{walletData.requiredSignatures}/{walletData.owners.length} signatures required</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 mb-6 border border-white/20">
          <div className="flex gap-2">
            {['overview', 'create', 'send', 'pending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-purple-200 hover:bg-white/10'
                }`}
              >
                {tab === 'overview' && <Wallet className="h-4 w-4 inline mr-2" />}
                {tab === 'create' && <Plus className="h-4 w-4 inline mr-2" />}
                {tab === 'send' && <Send className="h-4 w-4 inline mr-2" />}
                {tab === 'pending' && <Clock className="h-4 w-4 inline mr-2" />}
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          {activeTab === 'overview' && walletData && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Wallet Overview</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5" /> Owners
                  </h3>
                  <div className="space-y-2">
                    {walletData.owners.map((owner, i) => (
                      <div key={i} className="text-purple-200 text-sm font-mono">
                        {formatAddress(owner)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-3">Wallet Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-200">Balance:</span>
                      <span className="text-white font-bold">{walletData.balance} APT</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Nonce:</span>
                      <span className="text-white">{walletData.nonce}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-200">Required Sigs:</span>
                      <span className="text-white">{walletData.requiredSignatures}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Create New Wallet</h2>
              
              <div>
                <label className="block text-white font-medium mb-2">Wallet Owners</label>
                {newWalletOwners.map((owner, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={owner}
                      onChange={(e) => updateOwner(i, e.target.value)}
                      placeholder="0x..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {newWalletOwners.length > 1 && (
                      <button
                        onClick={() => removeOwner(i)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addOwnerField}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Owner
                </button>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Required Signatures</label>
                <input
                  type="number"
                  value={requiredSigs}
                  onChange={(e) => setRequiredSigs(parseInt(e.target.value))}
                  min="1"
                  max={newWalletOwners.length}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={createWallet}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                Create Wallet
              </button>
            </div>
          )}

          {activeTab === 'send' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Propose Transaction</h2>
              
              <div>
                <label className="block text-white font-medium mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={txRecipient}
                  onChange={(e) => setTxRecipient(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Amount (APT)</label>
                <input
                  type="number"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={proposeTransaction}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                Propose Transaction
              </button>
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white mb-4">Pending Transactions</h2>
              
              {pendingTxs.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-purple-200">No pending transactions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingTxs.map((tx) => (
                    <div key={tx.id} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {tx.executed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                          <span className="text-white font-medium">
                            {tx.executed ? 'Executed' : 'Pending'}
                          </span>
                        </div>
                        <span className="text-white font-bold">{tx.amount} APT</span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-200">To:</span>
                          <span className="text-white font-mono">{formatAddress(tx.to)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-200">Approvals:</span>
                          <span className="text-white">{tx.approvals.length}/{tx.requiredSigs}</span>
                        </div>
                      </div>

                      {!tx.executed && !tx.approvals.includes(connectedWallet) && (
                        <button
                          onClick={() => approveTx(tx.id)}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve Transaction
                        </button>
                      )}

                      {tx.approvals.includes(connectedWallet) && !tx.executed && (
                        <div className="text-center text-green-400 font-medium">
                          ✓ You have approved this transaction
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiSigWallet;