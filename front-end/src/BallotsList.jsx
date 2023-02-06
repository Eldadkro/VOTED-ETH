import React, { useEffect, useRef, useState } from "react";



export function BallotRow(prop) {

    const ballot = prop.ballot;
    const del = prop.del

    return (
        <tr>
            <td>{ballot.name}</td>
            <td>{ballot.address}</td>
            <td><button onClick={del}>Delete</button></td>
        </tr>
    );
}


export default function BallotsList({dataHandle}) {

    
    const {data:ballots,dataSet:setBallots} = dataHandle
    const nameRef = useRef('')
    const addressRef = useRef('')
       
    function add(e){
        console.log('hello')
        dataHandle.dataSet((bals) =>{
            return [...bals,{name:nameRef.current.value, address: addressRef.current.value}]    
    })
    }

    function rows(){
        return dataHandle.data.map((ballot) =>{
            return <BallotRow key={ballot.address} ballot={ballot} del={()=>{
                dataHandle.dataSet((ballots) =>{
                    return ballots.filter((bal) => bal.address !== ballot.address)
                })
            }} />
        })
    }


    let row = rows()
    return (
        <>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Address</th>
                    <th>Delete</th>
                </tr>
                {row}
            </table>
            <div>
                Name: <input type={'text'} ref={nameRef}/>
                Address: <input type={'text'} ref={addressRef}/>
                <button onClick={add}>enter</button>
            </div>
        </>
    );
}