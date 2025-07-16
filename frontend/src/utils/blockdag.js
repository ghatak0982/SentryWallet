import { ethers } from 'ethers';

// Get the provider for BlockDAG network
export const getProvider = () => {
  const rpcUrl = process.env.REACT_APP_BLOCKDAG_RPC_URL || 'https://testnet-rpc.blockdag.network';
  return new ethers.providers.JsonRpcProvider(rpcUrl);
};

// Create a new wallet
export const createWallet = () => {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic.phrase,
    publicKey: wallet.publicKey
  };
};

// Import wallet from private key
export const importWallet = (privateKey) => {
  try {
    const wallet = new ethers.Wallet(privateKey);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey
    };
  } catch (error) {
    throw new Error('Invalid private key');
  }
};

// Get wallet balance
export const getWalletBalance = async (address) => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw new Error('Failed to fetch wallet balance');
  }
};

// Send transaction
export const sendTransaction = async ({ signer, to, amount }) => {
  try {
    const provider = getProvider();
    const connectedSigner = signer.connect(provider);
    
    // Create transaction
    const transaction = {
      to: to,
      value: ethers.utils.parseEther(amount),
      gasLimit: 21000, // Standard gas limit for simple transfer
    };
    
    // Get current gas price
    const gasPrice = await provider.getGasPrice();
    transaction.gasPrice = gasPrice;
    
    // Send transaction
    const tx = await connectedSigner.sendTransaction(transaction);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    return {
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status
    };
  } catch (error) {
    console.error('Error sending transaction:', error);
    throw new Error(error.message || 'Failed to send transaction');
  }
};

// Get transaction history (basic implementation)
export const getTransactionHistory = async (address) => {
  try {
    const provider = getProvider();
    // This is a basic implementation. For a full transaction history,
    // you'd typically use a blockchain indexing service
    const latestBlock = await provider.getBlockNumber();
    const transactions = [];
    
    // Check last 100 blocks for transactions involving this address
    for (let i = Math.max(0, latestBlock - 100); i <= latestBlock; i++) {
      try {
        const block = await provider.getBlockWithTransactions(i);
        const relevantTxs = block.transactions.filter(tx => 
          tx.to?.toLowerCase() === address.toLowerCase() || 
          tx.from?.toLowerCase() === address.toLowerCase()
        );
        transactions.push(...relevantTxs);
      } catch (blockError) {
        console.warn(`Error fetching block ${i}:`, blockError);
      }
    }
    
    return transactions.map(tx => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: ethers.utils.formatEther(tx.value),
      blockNumber: tx.blockNumber,
      timestamp: null // Would need block timestamp
    }));
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return [];
  }
};

// Validate address format
export const isValidAddress = (address) => {
  return ethers.utils.isAddress(address);
};

// Create signer from private key
export const createSigner = (privateKey) => {
  return new ethers.Wallet(privateKey);
};

// Get network info
export const getNetworkInfo = async () => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    return {
      name: network.name,
      chainId: network.chainId,
      rpcUrl: process.env.REACT_APP_BLOCKDAG_RPC_URL
    };
  } catch (error) {
    console.error('Error getting network info:', error);
    throw new Error('Failed to get network information');
  }
};