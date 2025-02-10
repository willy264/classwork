import React, { useState } from 'react'
import {ethers} from 'ethers'
import abi from './abi.json'

const App = () => {

  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null)
  const [tasks, setTasks] = useState([]);
  const [deleteTask, setDeleteTask] = useState([]);
  const contractAddress = "0xA7A642932D7D8bdf18b7cF9d27Fe612bFc84CFE3";

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function connectWallet() {
    requestAccount();
    try {
      if (window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        const myContract = new ethers.Contract(
          contractAddress,
          abi, 
          signer
        )

        setAccount(address)
        setContract(myContract)
        console.log('transaction successful', receipt)
      }
    } catch(err) {
      console.log('Error connecting wallet', err)
    }
  }

  return (
    <div>
      <input type="text" placeholder='write a task' />
      <button onClick={connectWallet}>Add task</button>
      <button>Delete task</button>
      <p>Show your task: </p>
    </div>

  )
}

export default App