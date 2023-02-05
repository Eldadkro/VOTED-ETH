import React, { useContext, useEffect, useState, useRef } from "react";
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import Web3 from "web3";
import {ContextContract} from './App'
import ContAbi from './contact/VotedToken_sol_VotedToken.abi';

const providerUrl = 'http://127.0.0.1:8545'

const data1 = [{
    name: "A",
    votes: 1
},
{
    name: "B",
    votes: 21
}]
const size_per_ballot = 150


export default function BarPlot() {

    const contract_handle = useContext(ContextContract);
    const contract_addr = contract_handle.addr;
    const [data, setdata] = useState([])
    const web3Ref = useRef(null)
    const contRef = useRef(null)
    const interval = useRef(null)

    useEffect(()=>{
        web3Ref.current = new Web3(providerUrl)
    },[])

    useEffect(()=>{
        const func = async ()=>{
        if(web3Ref.current == null)
            return;
        if(contract_addr == null)
            return;
        const web3 = web3Ref.current;
        // const web3 = new Web3(providerUrl)
        const abi = await fetch(ContAbi).then(res=> res.json())
        const contract = new web3.eth.Contract(abi,contract_addr);
        contRef.current = contract
        const ballots_addrs = await contract.methods.getBallotsAddr().call()
        const ballots_prom = ballots_addrs.map(addr =>contract.methods.ballot(addr).call())
        const ballots = await Promise.all(ballots_prom)
        setdata(ballots)
        clearInterval(interval.current)
        interval.current = setInterval(async () => {
            const contract = contRef.current
            const ballots_addrs = await contract.methods.getBallotsAddr().call()
            const ballots_prom = ballots_addrs.map(addr =>contract.methods.ballot(addr).call())
            const ballots = await Promise.all(ballots_prom)
            setdata(ballots)
        }, 10000);
    }
    func()
    },[contract_addr,web3Ref.current])
    
    if (data.length === 0) return (<></>)
    const width = data.length * size_per_ballot
    return (
        <>
            <BarChart width={width > size_per_ballot * 10 ? size_per_ballot * 10 : width} height={300} data={data}>
                <CartesianGrid strokeDasharray={"3 3"} />
                <XAxis dataKey={"name"} />
                <YAxis label={{ value: 'votes', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey={"votes"} fill={"#8884d8"} />
            </BarChart>
        </>
    );

}