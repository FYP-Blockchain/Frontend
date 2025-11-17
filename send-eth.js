// Transfer ETH from Hardhat Account #7 to your account
import { ethers } from 'ethers';

async function transferETH() {
    // Connect to local Hardhat network
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    
    // Hardhat account #7 (sender with 10,000 ETH)
    const senderPrivateKey = '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356';
    const sender = new ethers.Wallet(senderPrivateKey, provider);
    
    // Your account (recipient)
    const recipientPrivateKey = '0x40fcc8eef6db34b8f2e234c14edc795e7e1ca2d58f69f9ccf617229e16b3e393';
    const recipient = new ethers.Wallet(recipientPrivateKey, provider);
    
    console.log('Sender (Account #7):', sender.address);
    console.log('Recipient (Your Account):', recipient.address);
    console.log('');
    console.log('Sender balance:', ethers.formatEther(await provider.getBalance(sender.address)), 'ETH');
    console.log('Recipient balance before:', ethers.formatEther(await provider.getBalance(recipient.address)), 'ETH');
    console.log('');
    
    // Transfer 500 ETH
    console.log('Transferring 500 ETH...');
    const tx = await sender.sendTransaction({
        to: recipient.address,
        value: ethers.parseEther('500')
    });
    
    console.log('Transaction hash:', tx.hash);
    await tx.wait();
    
    console.log('');
    console.log('✓ Transfer complete!');
    console.log('Recipient balance after:', ethers.formatEther(await provider.getBalance(recipient.address)), 'ETH');
}

transferETH().catch(console.error);
