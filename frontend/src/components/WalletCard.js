import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  Send, 
  ExternalLink, 
  Loader2, 
  Check,
  Wallet,
  AlertCircle 
} from 'lucide-react';
import { isValidAddress } from '../utils/blockdag';

const WalletCard = ({ 
  wallet, 
  balance, 
  isActive, 
  onSend, 
  latestTxHash,
  isLoading,
  onSetActive 
}) => {
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendForm, setSendForm] = useState({
    to: '',
    amount: ''
  });
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [copied, setCopied] = useState('');

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSendFormSubmit = async (e) => {
    e.preventDefault();
    setSendLoading(true);
    setSendError('');

    try {
      // Validate inputs
      if (!sendForm.to || !sendForm.amount) {
        throw new Error('Please fill in all fields');
      }

      if (!isValidAddress(sendForm.to)) {
        throw new Error('Invalid recipient address');
      }

      if (isNaN(parseFloat(sendForm.amount)) || parseFloat(sendForm.amount) <= 0) {
        throw new Error('Please enter a valid amount greater than 0');
      }

      if (parseFloat(sendForm.amount) > parseFloat(balance)) {
        throw new Error(`Insufficient balance. Available: ${parseFloat(balance).toFixed(4)} BDAG`);
      }

      // Call the send function
      await onSend({
        from: wallet.address,
        to: sendForm.to,
        amount: sendForm.amount
      });

      // Reset form on success
      setSendForm({ to: '', amount: '' });
      setShowSendForm(false);
    } catch (error) {
      setSendError(error.message);
    } finally {
      setSendLoading(false);
    }
  };

  const cardVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: { 
      scale: 1.02,
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <motion.div
      className={`neumorphic rounded-3xl p-6 ${
        isActive ? 'ring-2 ring-primary shadow-xl' : ''
      } cursor-pointer`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onClick={() => onSetActive(wallet.id)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isActive ? 'bg-primary/20' : 'bg-gray-100'
          }`}>
            <Wallet className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-gray-600'}`} />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-bold text-accent">
              {wallet.name || 'Wallet'}
            </h3>
            <p className="text-sm text-gray-500">
              {formatAddress(wallet.address)}
            </p>
          </div>
        </div>
        
        {isActive && (
          <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            Active
          </div>
        )}
      </div>

      {/* Address */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Wallet Address
        </label>
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
          <span className="text-sm text-gray-800 font-mono">
            {formatAddress(wallet.address)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(wallet.address, 'address');
            }}
            className="text-primary hover:text-primary/80 transition-colors"
            title="Copy address"
          >
            {copied === 'address' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Balance
        </label>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-accent">
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading...
              </div>
            ) : (
              `${parseFloat(balance).toFixed(4)} BDAG`
            )}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSendForm(!showSendForm);
            }}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
            disabled={isLoading || parseFloat(balance) <= 0}
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </button>
        </div>
      </div>

      {/* Send Form */}
      {showSendForm && (
        <motion.div
          className="border-t pt-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <form onSubmit={handleSendFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={sendForm.to}
                onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="0x..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Amount (BDAG)
              </label>
              <input
                type="number"
                step="0.0001"
                value={sendForm.amount}
                onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="0.0000"
                max={balance}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {parseFloat(balance).toFixed(4)} BDAG
              </p>
            </div>

            {sendError && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {sendError}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowSendForm(false);
                  setSendForm({ to: '', amount: '' });
                  setSendError('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendLoading}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {sendLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send BDAG
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Latest Transaction */}
      {latestTxHash && (
        <div className="mt-4 pt-4 border-t">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Latest Transaction
          </label>
          <div className="flex items-center justify-between bg-green-50 rounded-xl p-3">
            <span className="text-sm text-green-800 font-mono">
              {formatAddress(latestTxHash)}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(latestTxHash, 'tx');
                }}
                className="text-green-600 hover:text-green-800 transition-colors"
                title="Copy transaction hash"
              >
                {copied === 'tx' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={`https://testnet-explorer.blockdag.network/tx/${latestTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 transition-colors"
                title="View on explorer"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WalletCard;