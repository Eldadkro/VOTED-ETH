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

const contract = new web3.eth.Contract(abi)

