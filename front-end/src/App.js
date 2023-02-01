import './App.css';
import React, { useState} from 'react';
import BarPlot from './BarPlot';
import logo from './logo192.png'
// import DeployComp from './DeployComp';
// import KeysPanel from './KeysPanel';
import Panels from "./panels"

function App() {
  // const [contractAddress,setContractAddress] = useState()
  
  return (<>
    <div className='title'>
      <img src={logo} className='App-logo' /> <h1>Voting Control Panel</h1>
    </div>

    <div className='panels'>
      <div className='control-panels'>

        <Panels />
        <div>hello</div>

      </div >
      <div className='plot-panel'>
        <BarPlot />
      </div>
      
    </div>
  </>);
}

export default App;