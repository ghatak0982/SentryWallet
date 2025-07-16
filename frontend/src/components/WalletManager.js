import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Import, 
  Shield, 
  Loader2, 
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Wallet,
  ArrowLeft,
  Key
} from 'lucide-react';
import WalletCard from './WalletCard';
import { 
  createWallet, 
  importWallet, 
  getWalletBalance, 
  sendTransaction,
  createSigner,
  getNetworkInfo
} from '../utils/blockdag';
import { 
  saveWallets, 
  loadWallets, 
  hasWallets,
  generateWalletId,
  validatePassword
} from '../utils/storage';

const WalletManager = ({ user, onBack }) => {
  const [wallets, setWallets] = useState([]);
  const [activeWallet, setActiveWallet] = useState(null);
  const [balances, setBalances] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showNewWalletDetails, setShowNewWalletDetails] = useState(false);
  const [newWalletData, setNewWalletData] = useState(null);
  const [latestTxHashes, setLatestTxHashes] = useState({});
  const [networkInfo, setNetworkInfo] = useState(null);

  // Password setup state
  const [passwordSetup, setPasswordSetup] = useState({
    password: '',
    confirmPassword: '',
    showPassword: false
  });

  // Import wallet state
  const [importForm, setImportForm] = useState({
    privateKey: '',
    walletName: '',
    showPrivateKey: false
  });

  useEffect(() => {
    initializeWalletManager();
    loadNetworkInfo();
  }, []);

  const initializeWalletManager = async () => {
    try {
      if (hasWallets()) {
        setShowPasswordSetup(true);
      } else {
        setShowPasswordSetup(true);
      }
    } catch (error) {
      console.error('Error initializing wallet manager:', error);
      setError('Failed to initialize wallet manager');
    }
  };

  const loadNetworkInfo = async () => {
    try {
      const info = await getNetworkInfo();
      setNetworkInfo(info);
    } catch (error) {
      console.error('Error loading network info:', error);
    }
  };

  const handlePasswordSetup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (passwordSetup.password !== passwordSetup.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (passwordSetup.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      setEncryptionPassword(passwordSetup.password);

      // Try to load existing wallets or create empty array
      let existingWallets = [];
      if (hasWallets()) {
        try {
          existingWallets = loadWallets(passwordSetup.password);
        } catch (error) {
          throw new Error('Invalid password');
        }
      } else {
        // Save empty wallet array to establish password
        saveWallets([], passwordSetup.password);
      }

      setWallets(existingWallets);
      setShowPasswordSetup(false);
      
      // Load balances for existing wallets
      if (existingWallets.length > 0) {
        setActiveWallet(existingWallets[0]);
        loadBalances(existingWallets);
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBalances = async (walletList) => {
    const balancePromises = walletList.map(async (wallet) => {
      try {
        const balance = await getWalletBalance(wallet.address);
        return { address: wallet.address, balance };
      } catch (error) {
        console.error(`Error loading balance for ${wallet.address}:`, error);
        return { address: wallet.address, balance: '0' };
      }
    });

    const balanceResults = await Promise.all(balancePromises);
    const newBalances = {};
    balanceResults.forEach(({ address, balance }) => {
      newBalances[address] = balance;
    });
    setBalances(newBalances);
  };

  const handleCreateWallet = async () => {
    try {
      setIsLoading(true);
      setError('');

      const newWallet = createWallet();
      const walletWithId = {
        id: generateWalletId(),
        ...newWallet,
        name: `Wallet ${wallets.length + 1}`,
        createdAt: new Date().toISOString()
      };

      setNewWalletData(walletWithId);
      setShowNewWalletDetails(true);

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmWalletCreation = async () => {
    try {
      const updatedWallets = [...wallets, newWalletData];
      setWallets(updatedWallets);
      setActiveWallet(newWalletData);
      
      // Save to storage
      saveWallets(updatedWallets, encryptionPassword);
      
      // Load balance for new wallet
      const balance = await getWalletBalance(newWalletData.address);
      setBalances(prev => ({ ...prev, [newWalletData.address]: balance }));
      
      setShowNewWalletDetails(false);
      setNewWalletData(null);

    } catch (error) {
      setError(error.message);
    }
  };

  const handleImportWallet = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const importedWallet = importWallet(importForm.privateKey);
      
      // Check if wallet already exists
      if (wallets.some(w => w.address.toLowerCase() === importedWallet.address.toLowerCase())) {
        throw new Error('Wallet already exists');
      }

      const walletWithId = {
        id: generateWalletId(),
        ...importedWallet,
        name: importForm.walletName || `Imported Wallet ${wallets.length + 1}`,
        createdAt: new Date().toISOString(),
        imported: true
      };

      const updatedWallets = [...wallets, walletWithId];
      setWallets(updatedWallets);
      setActiveWallet(walletWithId);
      
      // Save to storage
      saveWallets(updatedWallets, encryptionPassword);
      
      // Load balance
      const balance = await getWalletBalance(walletWithId.address);
      setBalances(prev => ({ ...prev, [walletWithId.address]: balance }));
      
      setShowImportForm(false);
      setImportForm({ privateKey: '', walletName: '', showPrivateKey: false });

    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTransaction = async ({ from, to, amount }) => {
    try {
      setError('');
      
      const wallet = wallets.find(w => w.address === from);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const signer = createSigner(wallet.privateKey);
      const result = await sendTransaction({ signer, to, amount });
      
      // Update latest transaction hash
      setLatestTxHashes(prev => ({ ...prev, [from]: result.hash }));
      
      // Refresh balance
      const newBalance = await getWalletBalance(from);
      setBalances(prev => ({ ...prev, [from]: newBalance }));
      
      return result;

    } catch (error) {
      console.error('Send transaction error:', error);
      throw error;
    }
  };

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (showPasswordSetup) {
    return (
      <div className="min-h-screen gradient-background flex items-center justify-center px-4">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="neumorphic rounded-3xl p-8"
            variants={itemVariants}
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-primary/20 rounded-3xl flex items-center justify-center">
                <Key className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-accent mb-2">
                {hasWallets() ? 'Enter Wallet Password' : 'Create Wallet Password'}
              </h1>
              <p className="text-gray-600">
                {hasWallets() 
                  ? 'Enter your password to decrypt your wallets' 
                  : 'Create a secure password to protect your wallets'
                }
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handlePasswordSetup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={passwordSetup.showPassword ? 'text' : 'password'}
                    value={passwordSetup.password}
                    onChange={(e) => setPasswordSetup(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder={hasWallets() ? "Enter your password" : "Create a secure password"}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordSetup(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {passwordSetup.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {!hasWallets() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type={passwordSetup.showPassword ? 'text' : 'password'}
                    value={passwordSetup.confirmPassword}
                    onChange={(e) => setPasswordSetup(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Confirm your password"
                    required
                    minLength={8}
                  />
                </div>
              )}

              <motion.button
                type="submit"
                className="w-full flex items-center justify-center px-6 py-4 rounded-2xl font-semibold transition-all duration-300 bg-primary hover:bg-primary/90 text-white shadow-lg"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  hasWallets() ? 'Unlock Wallets' : 'Create Password'
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onBack}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-background">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-accent hover:text-primary transition-colors mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="flex items-center">
                <Wallet className="w-8 h-8 text-primary mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-accent">My Wallets</h1>
                  {networkInfo && (
                    <p className="text-sm text-gray-600">
                      Connected to {networkInfo.name || 'BlockDAG Testnet'}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowImportForm(true)}
                className="flex items-center px-4 py-2 border border-accent text-accent rounded-xl hover:bg-accent hover:text-white transition-colors"
              >
                <Import className="w-4 h-4 mr-2" />
                Import Wallet
              </button>
              <button
                onClick={handleCreateWallet}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Wallet
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center"
              variants={itemVariants}
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </motion.div>
          )}

          {/* Wallet Grid */}
          {wallets.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wallets.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  balance={balances[wallet.address] || '0'}
                  isActive={activeWallet?.id === wallet.id}
                  onSend={handleSendTransaction}
                  latestTxHash={latestTxHashes[wallet.address]}
                  isLoading={!balances[wallet.address]}
                  onSetActive={(walletId) => {
                    const wallet = wallets.find(w => w.id === walletId);
                    setActiveWallet(wallet);
                  }}
                />
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-16"
              variants={itemVariants}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-3xl flex items-center justify-center">
                <Wallet className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-600 mb-2">
                No Wallets Yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first wallet to get started with BlockDAG
              </p>
              <button
                onClick={handleCreateWallet}
                className="flex items-center mx-auto px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Plus className="w-5 h-5 mr-2" />
                )}
                Create Your First Wallet
              </button>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* New Wallet Details Modal */}
      {showNewWalletDetails && newWalletData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-3xl flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-accent mb-2">
                Wallet Created Successfully!
              </h2>
              <p className="text-gray-600">
                Please save this information securely. You won't see it again.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address
                </label>
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <span className="text-sm text-gray-800 font-mono break-all">
                    {newWalletData.address}
                  </span>
                  <button
                    onClick={() => handleCopy(newWalletData.address, 'address')}
                    className="text-primary hover:text-primary/80 transition-colors ml-2"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Private Key
                </label>
                <div className="flex items-center justify-between bg-red-50 rounded-xl p-3">
                  <span className="text-sm text-red-800 font-mono break-all">
                    {newWalletData.privateKey}
                  </span>
                  <button
                    onClick={() => handleCopy(newWalletData.privateKey, 'privateKey')}
                    className="text-red-600 hover:text-red-800 transition-colors ml-2"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mnemonic Phrase
                </label>
                <div className="bg-yellow-50 rounded-xl p-3">
                  <span className="text-sm text-yellow-800 break-all">
                    {newWalletData.mnemonic}
                  </span>
                  <button
                    onClick={() => handleCopy(newWalletData.mnemonic, 'mnemonic')}
                    className="text-yellow-600 hover:text-yellow-800 transition-colors ml-2"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-800">Important Security Notice</h4>
                  <p className="text-red-700 text-sm mt-1">
                    Store your private key and mnemonic phrase securely offline. Anyone with access to these can control your wallet and funds.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowNewWalletDetails(false);
                  setNewWalletData(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmWalletCreation}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              >
                I've Saved This Information
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Import Wallet Modal */}
      {showImportForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-white rounded-3xl p-8 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-3xl flex items-center justify-center">
                <Import className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-accent mb-2">
                Import Wallet
              </h2>
              <p className="text-gray-600">
                Import an existing wallet using your private key
              </p>
            </div>

            <form onSubmit={handleImportWallet} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={importForm.walletName}
                  onChange={(e) => setImportForm(prev => ({ ...prev, walletName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="My Imported Wallet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Private Key
                </label>
                <div className="relative">
                  <input
                    type={importForm.showPrivateKey ? 'text' : 'password'}
                    value={importForm.privateKey}
                    onChange={(e) => setImportForm(prev => ({ ...prev, privateKey: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="0x..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setImportForm(prev => ({ ...prev, showPrivateKey: !prev.showPrivateKey }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {importForm.showPrivateKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowImportForm(false);
                    setImportForm({ privateKey: '', walletName: '', showPrivateKey: false });
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Import Wallet'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WalletManager;