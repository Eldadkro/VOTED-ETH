import Web3 from 'web3'
import fs from 'fs-extra'
import * as dotenv from 'dotenv'
dotenv.config()

const web3 = new Web3('http://127.0.0.1:8545') // Connect to the Ganache blockchain


const address = process.env['ADDRESS']
const private_key = process.env['PRIVATE']

const bytecode = fs.readFileSync('./build/VotedToken_sol_VotedToken.bin')
const abi = JSON.parse(fs.readFileSync('./build/VotedToken_sol_VotedToken.abi')) // ABI of your contract
const h2ms = (h) => h*(3600*100)


//take all of the addreses of the demo accounts in the ganache, in order to make them
// balots 
const accounts_file = await fs.readJSON("accounts.json")
const accounts_addresses = Object.values(accounts_file.addresses)
const names = ['a','b']
console.log(accounts_addresses.slice(0,2))

const contract = new web3.eth.Contract(abi)
const deploy = contract.deploy({
    data: '0x' + bytecode,
    arguments: [h2ms(1),
                accounts_addresses.slice(0,2),
                ['a','b']
            ]})

deploy.estimateGas().then((res) => console.log(res))
const deployTransaction = deploy.encodeABI()

web3.eth.getTransactionCount(address, async (err, nonce) => {
    // Prepare the contract deployment transaction
    //const data = '0x' + bytecode
    const txParams = {
        nonce: web3.utils.toHex(nonce),
        gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
        gasLimit: web3.utils.toHex(6000000),
        from: address,
        data: deployTransaction
    }
    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction(txParams, private_key)
    const rawTx = signedTx.rawTransaction
    // Send the transaction
    web3.eth.sendSignedTransaction(rawTx)
        .on('receipt', receipt => {
            console.log(receipt)
        }).catch(err => {
            console.log(err)
        })
})




