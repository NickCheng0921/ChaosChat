import React from 'react';
import './App.css';
import Chat from './components/Chat';
import TickerChart from './components/TickerChart';
import StrategyCreator from './components/StrategyCreator';

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <div id="main-chart-container">
          <TickerChart />
        </div>
        <div id="bottom-container">
          <div id="control-container">
            <StrategyCreator />
          </div>
          <div id="chat-container">
            <Chat />
          </div>
        </div>
      </header>
    </div>
  );
};

export default App;
