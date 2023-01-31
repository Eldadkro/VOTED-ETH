import Web3 from 'web3'
import fs from 'fs-extra'


export default class ContractApi {
    constructor(private_key,address,dep_node,contract_addr,abi){
        this.address
        this.web3 = new Web3(dep_node)
        this.web3.eth.accounts.wallet.add(private_key)
        this.contract  = new this.web3.eth.Contract(abi,contract_addr)
    }

    async totalVoters(){
        return contract.methods.totalVoters().call()
    }

    async votingRights(addr){
        return this.contract.methods.votingRights(addr).call()
    }

    async ballotInfo(addr){
        return contract.methods.ballot(addr).call()
    }
    
    async createVoter(addr){
        return contract.methods.createVoter(addr).send({
            from:this.address,
            gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('20', 'gwei')),
            gas: this.web3.utils.toHex(6000000)
        })
    } 

    async vote(addr){
        return contract.methods.vote(addr).send({
            from:this.address,
            gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('20', 'gwei')),
            gas: this.web3.utils.toHex(6000000)
        })
    }

}
 



