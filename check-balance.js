// Check balance
import { ethers } from 'ethers';

async function checkBalance() {
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const address = '0xB31D0E76Ea4Ef962Cd1Fda609Ab9a8DF8ecd5236';
    
    const balance = await provider.getBalance(address);
    console.log('Address:', address);
    console.log('Balance:', ethers.formatEther(balance), 'ETH');
    console.log('Balance (wei):', balance.toString());
}

checkBalance().catch(console.error);
