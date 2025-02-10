import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import abi from './abi.json';
import './App.css';

const contractAddress = "0x764A9daCeF1dc6A52bA4B1050954cd1142bfeD32"; 
function App() {
  const [tasks, setTasks] = useState([]);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   connectWallet();
  // }, []);

  useEffect(() => {
    if (contract) {
      getTasks();
    }
  }, [contract]);

  const connectWallet = async () => {
    try {
      const provider = await detectEthereumProvider();
      
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();
        
        const taskContract = new ethers.Contract(
          contractAddress,
          abi,
          signer
        );

        setAccount(address);
        setContract(taskContract);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const getTasks = async () => {
    try {
      const allTasks = await contract.getMyTask();
      setTasks(allTasks.filter(task => !task.isDeleted));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    
    try {
      setLoading(true);
      const tx = await contract.addTask(description, title, false);
      await tx.wait();
      setTitle('');
      setDescription('');
      getTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      const tx = await contract.deleteTask(taskId);
      await tx.wait();
      getTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Blockchain Todo List</h1>
        {account ? (
          <p className="connected-account">Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
        ) : (
          <button onClick={connectWallet} className="connect-button">Connect Wallet</button>
        )}
      </header>

      {account && (
        <div className="main-content">
          <form onSubmit={addTask} className="task-form">
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
            <textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
            />
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </form>

          <div className="tasks-container">
            {tasks.map((task) => (
              <div key={task.id} className="task-card">
                <h3>{task.taskTitle}</h3>
                <p>{task.taskText}</p>
                <button
                  onClick={() => deleteTask(task.id)}
                  disabled={loading}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;