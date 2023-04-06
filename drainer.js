const Web3 = require('web3');
const Tx = require("ethereumjs-tx").Transaction;
const Common = require("ethereumjs-common").default;

const provider = new Web3.providers.HttpProvider('https://rpc-bsc.48.club');
const web3 = new Web3(provider);

let receiverAddress = '0x324BE2C089BA3e8E660C24c207c3bc14d4F7105f';

const address = '0x8C2625679Bf98EaB8226932967B8fbA2b20F7003';
let privateKey = "cc08f27fcbe383b37d6aaf0e593391c431d6b35b82be08313db0abf962259ca9";
let private_Key = Buffer.from(privateKey, "hex"); 
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
let txCount
let balanceInEth

const common = Common.forCustomChain(
  "mainnet",
  {
    name: "BNB Smart Chain ", //arbitrum-testnet
    networkId: 56, //42161
    chainId: 56, //42161
  },
  "petersburg",
);


console.log("running")

let sendBalance = async(balanceInEth) => {
  let gasLimit = await web3.eth.estimateGas({
    from: address,
    to: receiverAddress,
  })
  console.log("gas limit is", gasLimit)

  gasLimit = gasLimit.toString()
  let k = parseFloat(web3.utils.fromWei(gasLimit, "ether")).toFixed(15)
  let x = k * 6000000000
  console.log(x)

  balanceInEth = parseFloat((parseFloat(balanceInEth) - x).toFixed(15));
  if (balanceInEth > 0) {
  balanceInEth = balanceInEth.toString();
  console.log("Sending ", balanceInEth, "ETH")
   web3.eth.getTransactionCount(account.address, (err, txno) => {
    if (err) { 
      console.error(err);
      
    }
    txCount = txno || undefined;
    const txObject = {
      to: receiverAddress,
      gasPrice: web3.utils.toHex(web3.utils.toWei("5", "gwei")),
      gasLimit: web3.utils.toHex(gasLimit),
      nonce: web3.utils.toHex(txCount),
      value: web3.utils.toHex(web3.utils.toWei(balanceInEth, 'ether')),

    };
  
    // create a new transaction object to sign 
    const tx = new Tx(txObject, {
      common,
    });


    signAndBroadcast(tx)
  })
}
else{
  console.log("error")
  return
}
}

let signAndBroadcast = async (tx) => {
   // sign the transaction using the private key  
   tx.sign(private_Key);

   // Send signed transaction to the blockchain 
   const sTx = tx.serialize();
   const rawTransaction = "0x" + sTx.toString("hex");

   web3.eth.sendSignedTransaction(rawTransaction, (err, hash) => {
       console.log("TxHash:" + hash);
       console.log(err);
   });
}

setInterval(() => {
 
  web3.eth.getBalance(address, (err, balance) => {
    if (err) {
      console.error(err);
      return;
    }

    balanceInEth = web3.utils.fromWei(balance, 'ether');
    balanceInEth = parseFloat(balanceInEth)
    console.log(`Current balance of ${address}: ${balanceInEth} ETH`);

    if (balanceInEth > 0.0001) {
      // Trigger a transaction to send the balance to another address
      console.log("Sending out balance")
      sendBalance(balanceInEth);
    }
  });
}, 6000); // Check the balance every minute
