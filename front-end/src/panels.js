import './App.css';
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Web3 from 'web3';

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

    const Owner_pk = useContext(Contex_pk)
    const [gas, setGas] = useState(0)
    const [address,setAddress] = useState('')
    const handleContractAddress = props.handleContractAddress

    useEffect(() => {
        const web3 = new Web3(providerUrl)
        console.log(Owner_pk)
        if(Owner_pk == null)
            return 
        const Owner = web3.eth.accounts.privateKeyToAccount(Owner_pk)
        web3.eth.getBalance(Owner.address).then(res => {
            setGas(web3.utils.fromWei(res, 'Gwei'))
            setAddress(Owner.address)
        })
        .catch(err => console.log(err))
    },[Owner_pk])

    function deploy(e){
        
    }
    return (
        <>
            <div className='deploy-panel'>
                <h2>Deployment</h2>
                <div>address: {address}</div>
                <div>gas: {gas}</div>
                <div>approximated gas: {1439887 }</div>

                <div>
                    <button onClick={deploy}>Deploy</button>
                </div>

            </div>
        </>
    );
}


export default function Panels(props) {


    const [owner_pk, setOwner_pk] = useState(null)
    return (<>
        <Contex_pk.Provider value={owner_pk}>
            <KeysPanel handleOwner={owner => setOwner_pk(owner)} />
            <DeployComp setContractAddr={props.handleContractAddress} />

        </Contex_pk.Provider>
    </>
    )
}
