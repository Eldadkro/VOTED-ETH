import './App.css';
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Web3 from 'web3';
import ContByte from './contact/VotedToken_sol_VotedToken.bin';
import ContAbi from './contact/VotedToken_sol_VotedToken.abi';
import { ContextContract } from './App'
import BallotsList from './BallotsList';

const Contex_pk = createContext()
const providerUrl = 'http://127.0.0.1:8545'
const contract_path = './contract/'



export function DeployComp(props) {
    const contractHandler = useContext(ContextContract)
    const [gas, setGas] = useState(0)
    const [cAddress, setCAddress] = useState('')
    const Caddress_text = useRef()
    const [ballots, setBallots] = useState([])

    if (typeof window.ethereum === 'undefined') {
        console.log(`MetaMask isn't installed installed!`);
        alert("install Metamask");
    }

    if (gas === 0) {

        const func = async () => {

            const abi = await fetch(ContAbi).then(res => res.json())
            const bin = '0x' + (await fetch(ContByte).then(res => res.text()))

            const contract = new (new Web3(window.ethereum)).eth.Contract(abi)
            const h2ms = (h) => h * (3600 * 100)
            let ballots_addr = []
            let names = []
            if (ballots.length !== 0) {
                ballots_addr = ballots.map(ballot => ballot.address)
                names = ballots.map(ballot => ballot.name)
            }
            const gas = await contract.deploy({
                data: bin,
                arguments: [h2ms(1), ballots_addr, names]
            }).estimateGas()
            console.log(gas)
            setGas(gas)

        }
        func()

    }

    async function deploy(e) {

        const web3 = new Web3(window.ethereum)
        const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('address: ' + address)

        // read contract 
        const byteCode = await (fetch(ContByte).then(r => r.text()))
        const abi = JSON.parse(await (fetch(ContAbi).then(r => r.text())))
        const contract = new web3.eth.Contract(abi)
        const h2ms = (h) => h * (3600 * 100)
        let ballots_addr = ['0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', '0xffcf8fdee72ac11b5c542428b35eef5769c409f0']
        let names = ['a', 'b']
        if (ballots.length !== 0) {
            ballots_addr = ballots.map(ballot => ballot.address)
            names = ballots.map(ballot => ballot.name)
        }
        try {
            const gas = await contract.deploy({
                data: '0x'+byteCode,
                arguments: [h2ms(1), ballots_addr, names]
            }).estimateGas({
                from: address
            })

            console.log('gas: ' + gas)
            contract.deploy({
                data: "0x" + byteCode,
                arguments: [h2ms(1), ballots_addr, names]
            }).send({
                from: address,
                gas: web3.utils.toHex(6000000)
            })
                .on('receipt', (res) => {

                    setCAddress(res.contractAddress)
                    console.log(res.contractAddress)
                    // handleContractAddress(res.contractAddress)
                    contractHandler.setter(res.contractAddress)
                })
                .on('error', err => {
                    console.log(err)
                    console.log('this error')
                })

        }
        catch (err) {
            alert(`couldn't deploy`)
        }
    }

    async function enterContract(e) {
        contractHandler.setter(Caddress_text.current.value)
    }

    return (
        <>
            <div className='deploy-panel'>
                <h2>Deployment or enter contract</h2>
                <div>approximated gas: {gas}</div>

                <BallotsList dataHandle={{ data: ballots, dataSet: (val) => setBallots(val) }} />


                <div>
                    <button onClick={deploy}>Deploy</button> contract address: {cAddress}
                </div>


                <div>
                    Contract Address: <input className='text-box' type={'text'} ref={Caddress_text} />
                    <button onClick={enterContract}>enter</button>
                </div>
            </div>
        </>
    );
}


export function VoteButton({ ballot, setstatus }) {

    const contractContext = useContext(ContextContract)
    async function vote(e) {
        if (contractContext.addr == null) {
            return;
        }
        const web3 = new Web3(window.ethereum)
        const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const abi = JSON.parse(await fetch(ContAbi).then((res) => res.text()))
        const contract = new web3.eth.Contract(abi, contractContext.addr)
        try {
            const gas = await contract.methods.vote(ballot.address).estimateGas({ from: address })

            contract.methods.vote(ballot.address).send({
                from: address,
                gas: web3.utils.toHex(gas + 100)
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
    const [votingButtons, setvotingButtons] = useState()
    const [voting_status, setvoting_status] = useState('')
    const CaddressText = useRef()
    const web3Ref = useRef(new Web3(window.ethereum))
    const contractRef = useRef(null)


    useEffect(() => {

        if (contractHandler.addr != null) {
            fetch(ContAbi).then(async (res) => {
                const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log(contractHandler.addr)
                const abi = JSON.parse(await res.text())
                console.log(abi)
                const web3 = web3Ref.current
                contractRef.current = new web3.eth.Contract(abi, contractHandler.addr)
                const contract = contractRef.current
                let ballots_addr;
                try {
                    ballots_addr = await contract.methods.getBallotsAddr().call({
                        from : address
                    })
                }
                catch(e){
                    console.log('here')
                }
                console.log(ballots_addr)
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
            }).catch((err) => console.log(err))

        }
    }, [contractHandler.addr])

    return (
        <div className='deploy-panel'>
            <h3>Voting</h3>
            <div>{votingButtons}</div>
            {voting_status}
        </div>)

}

export function CreateVoter() {

    const contractHandle = useContext(ContextContract)
    const text_voter = useRef()
    const [result, setResults] = useState('')


    async function createvoter(e) {
        console.log('1')
        if (text_voter.current.value == null)
            return;
        if (text_voter.current.value.length != 42)
            return;
        if (contractHandle.addr == null)
            return;

        if (window.ethereum === 'undifined') {
            console.log('no metamask')
            alert('install metamask')
        }
        const web3 = new Web3(window.ethereum)
        const [address] = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log(address)

        const abi = (await (await fetch(ContAbi)).json())
        const contract = new web3.eth.Contract(abi, contractHandle.addr)
        try {
            const gas = await contract.methods.createVoter(text_voter.current.value).estimateGas({ from: address })
            console.log("create voter gas:" + gas)
            contract.methods.createVoter(text_voter.current.value).send({
                from: address,
                gasLimit: web3.utils.toHex(gas + 100)
            }).on('receipt', res => {
                console.log(res)
                setResults("created")
            }).on('error', err => {
                setResults("couldn't create")
                console.log(err)
            })
        } catch (e) {
            setResults("couldn't create")
            console.log(e)
        }
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
            <DeployComp />
            <CreateVoter />
            <Voting />
        </Contex_pk.Provider>
    </>
    )
}
