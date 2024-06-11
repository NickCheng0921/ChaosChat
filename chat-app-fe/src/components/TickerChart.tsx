// src/components/TickerChart.tsx
import { useState, useEffect} from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './TickerChart.css'

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface Prices {
	closes: Array<number>,
  opens: Array<number>,
  dates: Array<Date>,
}

const TickerChart = () => {
  const [tickerInput, setTickerInput] = useState("AAPL");
  const [years, setYears] = useState("1");
  const [months, setMonths] = useState("0");

  const [dates, setDates] = useState([]);
  const [closes, setCloses] = useState([]);
  const [label, setLabel] = useState();

  const data = {
    labels: dates,
    datasets: [
      {
        label: label,
        data: closes,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
        fill: true,
      },
    ],
  };

  const onSearch = () => {
    axios.post(prod+'ticker/', {
      ticker: tickerInput,
      years_ago: parseInt(years),
      months_ago: parseInt(months),
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(response => {
      if (response.status === 200) {
        setDates(response.data.dates);
        setCloses(response.data.adj_close);
        setLabel(response.data.name);
      }
    });
  }
    

  const local = "http://127.0.0.1:5000/";
  const prod = "https://nuckchead-be-70d6747d3acd.herokuapp.com/";
  useEffect(() => {
    axios.post(prod+'ticker/', {
      ticker: 'AAPL',
      years_ago: parseInt(years),
      months_ago: parseInt(months),
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(response => {
      if (response.status === 200) {
        setDates(response.data.dates);
        setCloses(response.data.adj_close);
        setLabel(response.data.name);
      }
    });
  }, []);

  const options = {
    maintainAspectRatio: false,
  }

  return (
    <div id="chart">
        <div id="searchBar">
            <input id="ticker_input" 
              value={tickerInput}
              className="searchInput"
              onChange={(e) => {
                setTickerInput(e.target.value);
              }}
            />
            <input id="ticker_search_year" className="searchInput timeInput" value={years} 
                onChange={(e) => {
                  setYears(e.target.value);
                }}/>
            Year
            <input id="ticker_search_month" className="searchInput timeInput" value={months}
              onChange={(e) => {
                setMonths(e.target.value);
              }} />
            Month
            <input id="ticker_submit" type="submit" className="searchButton" value="Search Tickers" onClick={onSearch} />
        </div>
      <Line data={data} options={options}/>
    </div>
  );
};

export default TickerChart;
