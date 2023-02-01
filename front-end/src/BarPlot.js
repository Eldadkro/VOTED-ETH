import React,{useEffect, useState} from "react";
import {Bar,BarChart,XAxis,YAxis,Tooltip,Legend,CartesianGrid} from "recharts"


const data1 =[{
    name:"A",
    votes: 1
},
{
    name:"B",
    votes: 21
}]
const size_per_ballot = 150
export default function BarPlot(){

    const [data,setdata] = useState(data1)
    if (data.length === 0) return (<></>)
    const width =data.length*size_per_ballot
    return (

        <BarChart width={width > size_per_ballot*10? size_per_ballot*10 : width} height={300} data={data}>
            <CartesianGrid strokeDasharray={"3 3"}/>
            <XAxis dataKey={"name"}/>
            <YAxis label={{ value: 'votes', angle: -90, position: 'insideLeft' }}/>
            <Tooltip />
            <Legend />
            <Bar dataKey={"votes"} fill={"#8884d8"}/>
        </BarChart>
    );

}