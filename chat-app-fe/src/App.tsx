import React from 'react';
import './App.css';
import Chat from './components/Chat';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Chat />
      </header>
    </div>
  );
};

export default App;
