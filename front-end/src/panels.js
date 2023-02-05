import './App.css';
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Web3 from 'web3';
import ContByte from './contact/VotedToken_sol_VotedToken.bin';
import ContAbi from './contact/VotedToken_sol_VotedToken.abi';
import { ContextContract } from './App'

const Contex_pk = createContext()
const providerUrl = 'http://127.0.0.1:8545'
const contract_path = './contract/'

export function KeysPanel(props) {

    const privateKey = useRef(null)
    const [a, seta] = useState('')

    function addOwner(e) {
        if (privateKey.current.value == null ||
            privateKey.current.value.length < 66) {
            console.log("not ready")
            return
        }
        // props.handleOwner(privateKey.current.value)
        const web3 = new Web3(providerUrl)
        const acc = web3.eth.accounts.privateKeyToAccount(privateKey.current.value)
        seta(acc.address)
        props.handleOwner(privateKey.current.value)

    }

    return (
        <div className='deploy-panel'>
            <h3>Owner's private-key: </h3><input type={'text'} defaultValue={"private-key"} className={"text-box"} ref={privateKey} />
            {a}
            <h2><button onClick={addOwner}>enter-keys</button></h2>
        </div>
    );
}



export function DeployComp(props) {
    const contractHandler = useContext(ContextContract)
    const Owner_pk = useContext(Contex_pk)
    const [gas, setGas] = useState(0)
    const [address, setAddress] = useState('')
    const [cAddress, setCAddress] = useState('')

    useEffect(() => {
        const web3 = new Web3(providerUrl)
        console.log("deployComp PK: " + Owner_pk)
        if (Owner_pk == null)
            return
        const Owner = web3.eth.accounts.privateKeyToAccount(Owner_pk)
        web3.eth.getBalance(Owner.address).then(res => {
            setGas(web3.utils.fromWei(res, 'Gwei'))
            setAddress(Owner.address)
        })
            .catch(err => console.log(err))
    }, [Owner_pk])

    async function deploy(e) {
        const web3 = new Web3(providerUrl)
        if (Owner_pk == null)
            return
        web3.eth.accounts.wallet.add(Owner_pk)

        // read contract 
        const byteCode = await (fetch(ContByte).then(r => r.text()))
        const abi = JSON.parse(await (fetch(ContAbi).then(r => r.text())))
        const h2ms = (h) => h * (3600 * 100)
        const names = ['a', 'b']
        const ballots_addr = ["0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1", "0xffcf8fdee72ac11b5c542428b35eef5769c409f0"]
        const contract = new web3.eth.Contract(abi)
        const dep = contract.deploy({
            data: "0x" + byteCode,
            arguments: [h2ms(1), ballots_addr, names]
        }).send({
            from: address,
            gas: web3.utils.toHex(5000000),
            gasPrice: web3.utils.toHex(web3.utils.toWei('20', 'Gwei'))
        })
            .on('receipt', (res) => {
                setCAddress(res.contractAddress)
                // handleContractAddress(res.contractAddress)
                contractHandler.setter(res.contractAddress)
            })
            .on('error', err => console.log(err))
    }
    return (
        <>
            <div className='deploy-panel'>
                <h2>Deployment</h2>
                <div>address: {address}</div>
                <div>gas: {gas}</div>
                <div>approximated gas: {1439887}</div>

                <div>
                    <button onClick={deploy}>Deploy</button> contract address: {cAddress}
                </div>

            </div>
        </>
    );
}


export function VoteButton({ ballot, setstatus }) {

    const contractContext = useContext(ContextContract)
    const Owner_pk = useContext(Contex_pk)
    async function vote(e) {
        if (contractContext.addr == null || Owner_pk == null) {
            return
        }
        const web3 = new Web3(providerUrl)
        web3.eth.accounts.wallet.add(Owner_pk)
        const abi = JSON.parse(await fetch(ContAbi).then((res) => res.text()))
        const contract = new web3.eth.Contract(abi, contractContext.addr)
        try {
            const gas = await contract.methods.vote(ballot.address).estimateGas({ from: web3.eth.accounts.privateKeyToAccount(Owner_pk).address })

            contract.methods.vote(ballot.address).send({
                from: web3.eth.accounts.privateKeyToAccount(Owner_pk).address,
                gas: web3.utils.toHex(gas)
            })
                .on('receipt', (res) => {
                    console.log("yay")
                    setstatus('success')
                })
                .on('error', err => {
                    console.log(err)
                    setstatus('failed')
                })
        }
        catch {
            setstatus('failed')
            return;
        }
    }

    return <button onClick={vote}>{ballot.name}</button>
}

export function Voting(props) {

    const contractHandler = useContext(ContextContract)
    const owner_pk = useContext(Contex_pk)
    const [web3, x] = useState(new Web3(providerUrl))
    const [votingButtons, setvotingButtons] = useState()
    const [voting_status, setvoting_status] = useState('')
    const CaddressText = useRef()
    let contract
    useEffect(() => {
        if (owner_pk != null)
            web3.eth.accounts.wallet.add(owner_pk)
    }, [owner_pk])

    useEffect(() => {

        if (contractHandler.addr != null) {
            fetch(ContAbi).then(async (res) => {
                const abi = JSON.parse(await res.text())
                contract = new web3.eth.Contract(abi, contractHandler.addr)
                CaddressText.current.value = contractHandler.addr
            }).catch((err) => console.log(err))

        }
    }, [contractHandler.addr])

    async function enterContract(e) {
        if (contractHandler.addr == null)
            return
        const ballots_addr = await contract.methods.getBallotsAddr().call()
        const ballots = ballots_addr.map(async (address_ballot) => {
            const ballot = await contract.methods.ballot(address_ballot).call()
            return {
                name: ballot.name,
                address: address_ballot
            }
        })

        Promise.all(ballots).then(bal => {
            setvotingButtons(bal.map(ballot => (<VoteButton key={ballot.name} ballot={ballot} setstatus={status => setvoting_status(status)} />)))
        })


    }


    return (
        <div className='deploy-panel'>
            <h3>Voting</h3>
            contract address:<input className='text-box' type={'text'} ref={CaddressText} /><button onClick={enterContract}>enter</button>
            <div>{votingButtons}</div>
            {voting_status}
        </div>)

}

export function CreateVoter() {

    const owner_pk = useContext(Contex_pk)
    const contractHandle = useContext(ContextContract)
    const text_voter = useRef()
    const [web3, setweb3] = useState(new Web3(providerUrl))
    const [result, setResults] = useState('')
    async function createvoter(e) {
        if (owner_pk == null)
            return;
        if (text_voter.current.value == null)
            return;
        if (text_voter.current.value.length != 42)
            return;
        if (contractHandle.addr == null)
            return;
        // console.log(owner_pk)
        web3.eth.accounts.wallet.clear()
        // web3.eth.accounts.wallet.add(owner_pk)
        // console.log(web3.eth.accounts.wallet)
        const abi = (await (await fetch(ContAbi)).json())
        const contract = new web3.eth.Contract(abi, contractHandle.addr)
        console.log(contract.defaultAccount)
        // console.log(web3.eth.accounts.privateKeyToAccount(owner_pk).address)
        // console.log(web3.eth.defaultAccount)
        const gas = await contract.methods.createVoter(text_voter.current.value).estimateGas({ from: web3.eth.accounts.privateKeyToAccount(owner_pk).address })
        console.log(gas)
        contract.methods.createVoter(text_voter.current.value).send({
            from: web3.eth.accounts.privateKeyToAccount(owner_pk).address,
            gasLimit: web3.utils.toHex(gas + 100),
            gasPrice: web3.utils.toHex(2000000000)
        }).on('receipt', res => {
            console.log(res)
            setResults("created")
        }).on('error', err => {
            setResults("couldn't create")
            console.log(err)
        })
    }
    return (
        <div className='deploy-panel'>
            <h3>Create a new Voter</h3>
            voters address:<input type={'text'} className='text-box' ref={text_voter} /><button onClick={createvoter}>Create</button>
            <div>
                voter: {result}
            </div>
        </div>
    );
}

export default function Panels(props) {


    const [owner_pk, setOwner_pk] = useState(null)


    return (<>
        <Contex_pk.Provider value={owner_pk}>
            <KeysPanel handleOwner={owner => setOwner_pk(owner)} />
            <DeployComp />
            <CreateVoter />
            <Voting />
        </Contex_pk.Provider>
    </>
    )
}
