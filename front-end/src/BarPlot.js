import React,{useEffect} from "react";
import {Bar,BarChart,XAxis,YAxis,Tooltip,Legend,CartesianGrid} from "recharts"


const data =[{
    name:"A",
    votes: 1
},
{
    name:"B",
    votes: 21
}]

export default function BarPlot(){
    useEffect(()=>{
        
    },[data])

    return (
        <BarChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray={"3 3"}/>
            <XAxis dataKey={"name"}/>
            <YAxis label={{ value: 'votes', angle: -90, position: 'insideLeft' }}/>
            <Tooltip />
            <Legend />
            <Bar dataKey={"votes"} fill={"#8884d8"}/>
        </BarChart>
    );

}