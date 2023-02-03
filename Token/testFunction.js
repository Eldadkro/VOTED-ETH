import Web3 from 'web3'
import fs from 'fs-extra'
import * as dotenv from 'dotenv'
dotenv.config()

const web3 = new Web3('http://127.0.0.1:8545') // Connect to the Ganache blockchain

const address = process.env['ADDRESS']
const private_key = process.env['PRIVATE']

web3.eth.accounts.wallet.add(private_key)
web3.eth.getBalance(address).then(res => console.log(web3.utils.fromWei(res,'Gwei')))

const bytecode = fs.readFileSync('./build/VotedToken_sol_VotedToken.bin')
const abi = JSON.parse(fs.readFileSync('./build/VotedToken_sol_VotedToken.abi')) // ABI of your contract
const h2ms = (h) => h*(3600*100)

const contract_addr = fs.readFileSync("contractaddress.txt")
const contract = new web3.eth.Contract(abi,contract_addr.toString())


//total voters
// contract.methods.totalVoters().call().then(result => console.log(result))

// //voting rights
// contract.methods.votingRights(address).call().then(result => console.log(result))

contract.methods.getBallotsAddr().call().then(result => console.log(result)) 

// //ballot
// contract.methods.ballot("0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1").call().then(result => console.log(result))



// //add new voter
// await contract.methods.createVoter(address).send({
//     from:address,
//     gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
//     gas: web3.utils.toHex(6000000)
// })
// .on('receipt', receipt =>{
//     console.log(receipt)
// })
// .on('error',err => {
//     console.log(err)
// })


// //vote
// await contract.methods.vote("0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1").send({
//     from:address,
//     gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'gwei')),
//     gas: web3.utils.toHex(6000000)
// })
// .on('receipt', receipt =>{
//     console.log("voted")
// })
// .on('error',err => {
//     console.log(err)
// })

// await contract.methods.ballot("0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1").call().then(result => console.log(result))





