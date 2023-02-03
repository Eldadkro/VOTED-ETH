import './App.css';
import React, { createContext, useState } from 'react';
import BarPlot from './BarPlot';
import logo from './logo192.png'
// import DeployComp from './DeployComp';
// import KeysPanel from './KeysPanel';
import Panels from "./panels"
export const ContextContract = createContext()
function App() {
  const [contractAddr, setContractAddr] = useState()
  return (<>
    <div className='title'>
      <img src={logo} className='App-logo' /> <h1>Voting Control Panel</h1>
    </div>

    <div className='panels'>
      <ContextContract.Provider value={{ addr: contractAddr, setter: setContractAddr }}>
        <div className='control-panels'>

          <Panels />

        </div >
        <div className='plot-panel'>
          <BarPlot />
        </div>
      </ContextContract.Provider>
    </div>
  </>);
}

export default App;