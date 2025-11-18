const DEFAULT_CHAIN_ID_HEX = '0x7a69'; // 31337 in hex (Hardhat)
const normalizeChainId = (chainId) => {
	if (!chainId) return DEFAULT_CHAIN_ID_HEX;
	if (typeof chainId === 'number') {
		return `0x${chainId.toString(16)}`;
	}
	const trimmed = chainId.trim();
	if (trimmed.startsWith('0x')) {
		return trimmed.toLowerCase();
	}
	const parsed = Number(trimmed);
	if (Number.isNaN(parsed)) {
		console.warn('Unable to parse VITE_TARGET_CHAIN_ID, falling back to Hardhat default');
		return DEFAULT_CHAIN_ID_HEX;
	}
	return `0x${parsed.toString(16)}`;
};

const TARGET_CHAIN_ID = normalizeChainId(import.meta.env.VITE_TARGET_CHAIN_ID);
const TARGET_CHAIN_NAME = import.meta.env.VITE_TARGET_CHAIN_NAME || 'Hardhat Localhost';
const TARGET_RPC_URL = import.meta.env.VITE_TARGET_RPC_URL || 'http://127.0.0.1:8545';
const TARGET_CURRENCY_NAME = import.meta.env.VITE_TARGET_CHAIN_CURRENCY_NAME || 'Ether';
const TARGET_CURRENCY_SYMBOL = import.meta.env.VITE_TARGET_CHAIN_CURRENCY_SYMBOL || 'ETH';
const TARGET_BLOCK_EXPLORER_URL = import.meta.env.VITE_TARGET_BLOCK_EXPLORER_URL;

const getEthereum = () => (typeof window !== 'undefined' ? window.ethereum : undefined);
const getTargetChainId = () => TARGET_CHAIN_ID;

export const isMetaMaskAvailable = () => Boolean(getEthereum());

export const requestConnectedAccount = async () => {
	const ethereum = getEthereum();
	if (!ethereum) {
		throw new Error('MetaMask is not available in this browser.');
	}
	const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
	if (!accounts || accounts.length === 0) {
		throw new Error('User did not authorize any accounts.');
	}
	return accounts[0];
};

export const fetchExistingAccount = async () => {
	const ethereum = getEthereum();
	if (!ethereum) {
		return null;
	}
	const accounts = await ethereum.request({ method: 'eth_accounts' });
	return accounts && accounts.length > 0 ? accounts[0] : null;
};

export const disconnectWalletSession = async () => {
	// MetaMask does not expose a programmatic disconnect; clear client state only.
	return Promise.resolve();
};

export const subscribeAccountChanges = (handler) => {
	const ethereum = getEthereum();
	ethereum?.on('accountsChanged', handler);
};

export const unsubscribeAccountChanges = (handler) => {
	const ethereum = getEthereum();
	ethereum?.removeListener('accountsChanged', handler);
};

export const ensureMetaMask = () => {
	if (!isMetaMaskAvailable()) {
		throw new Error('MetaMask extension is required for this action.');
	}
};

export const ensureTargetNetwork = async () => {
	const ethereum = getEthereum();
	if (!ethereum) {
		throw new Error('MetaMask is required to select the correct network.');
	}

	const currentChainId = await ethereum.request({ method: 'eth_chainId' });
	if (currentChainId?.toLowerCase() === getTargetChainId()) {
		return;
	}

	try {
		await ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: getTargetChainId() }],
		});
		return;
	} catch (err) {
		if (err?.code !== 4902) {
			throw err;
		}
	}

	await ethereum.request({
		method: 'wallet_addEthereumChain',
		params: [
			{
				chainId: getTargetChainId(),
				chainName: TARGET_CHAIN_NAME,
				rpcUrls: [TARGET_RPC_URL],
				nativeCurrency: {
					name: TARGET_CURRENCY_NAME,
					symbol: TARGET_CURRENCY_SYMBOL,
					decimals: 18,
				},
				...(TARGET_BLOCK_EXPLORER_URL
					? { blockExplorerUrls: [TARGET_BLOCK_EXPLORER_URL] }
					: {}),
			},
		],
	});

	await ethereum.request({
		method: 'wallet_switchEthereumChain',
		params: [{ chainId: getTargetChainId() }],
	});
};

export const addNFTToWallet = async (tokenId, tokenAddress) => {
	const ethereum = getEthereum();
	if (!ethereum) {
		throw new Error('MetaMask is not available.');
	}

	// Ensure we're on the correct network first
	await ensureTargetNetwork();

	try {
		// For local networks, MetaMask's wallet_watchAsset may not work well
		// Instead, we'll use wallet_switchEthereumChain to ensure network is correct
		// and then return the details for manual import
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		
		// Try to add the NFT (this may fail on local networks, which is expected)
		try {
			const wasAdded = await ethereum.request({
				method: 'wallet_watchAsset',
				params: {
					type: 'ERC721',
					options: {
						address: tokenAddress,
						tokenId: tokenId.toString(),
					},
				},
			});
			return { success: true, method: 'auto' };
		} catch (watchError) {
			// If auto-add fails (common on local networks), return info for manual import
			console.log('Auto-add not supported, will use manual import', watchError);
			return { 
				success: false, 
				method: 'manual',
				contractAddress: tokenAddress,
				tokenId: tokenId.toString(),
				chainId
			};
		}
	} catch (error) {
		console.error('Error adding NFT to wallet:', error);
		throw error;
	}
};
