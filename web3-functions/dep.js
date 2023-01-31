import Web3 from 'web3'
import fs from 'fs-extra'

/**
 * @param {*obj} ballots containt names,addresses 
 * @param {*integer} time_in_hours integers
 * 
 * deploy the contract located in ../Token/build
 * 
 */
export default async function deploy_contract(dep_node,ballots,time_in_hours,owner){
    const web3 = new Web3(dep_node)

    const address = owner.address
    const private_key = owner.private_key

    const bytecode = fs.readFileSync('../Token/build/VotedToken_sol_VotedToken.bin')
    const abi = JSON.parse(fs.readFileSync('../Token/build/VotedToken_sol_VotedToken.abi')) // ABI of your contract
    const h2ms = (h) => h * (3600 * 100)


    const contract = new web3.eth.Contract(abi)
    const deploy = contract.deploy({
        data: '0x' + bytecode,
        arguments: [h2ms(time_in_hours),
        ballots.addresses,
        ballots.names
        ]
    })

    await deploy.estimateGas().then((res) => console.log(res))
    const deployTransaction = deploy.encodeABI()

    const nonce = await web3.eth.getTransactionCount(address)
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
                fs.mkdir("contract")
                fs.writeFile("contract/contractaddress.txt", receipt.contractAddress)
                
            }).catch(err => {
                console.log(err)
            })
}
