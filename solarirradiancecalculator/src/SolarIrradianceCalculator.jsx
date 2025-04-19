import React, { useState, useEffect } from 'react';
import './SolarIrradianceCalculator.css';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from 'recharts';

countries.registerLocale(enLocale);
const countryList = Object.entries(countries.getNames('en')).map(([code, name]) => ({ code, name }));

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const daysInMonth = {
  January: 31, February: 28, March: 31, April: 30, May: 31, June: 30,
  July: 31, August: 31, September: 30, October: 31, November: 30, December: 31
};

const SolarIrradianceCalculator = () => {
  const [country, setCountry] = useState('India');
  const [month, setMonth] = useState('January');
  const [efficiency, setEfficiency] = useState(18);
  const [panelType, setPanelType] = useState('Monocrystalline');
  const [years, setYears] = useState(1);
  const [voltage, setVoltage] = useState(12);
  const [current, setCurrent] = useState(5);
  const [dailyData, setDailyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [dailyFilter, setDailyFilter] = useState('Overall');
  const [yearlyFilter, setYearlyFilter] = useState('Overall');

  useEffect(() => {
    const baseIrradiance = 4;
    const factor =
      panelType === 'Monocrystalline' ? 1 :
      panelType === 'Polycrystalline' ? 0.95 : 0.9;

    const hourlyData = Array.from({ length: 24 }, (_, h) => ({
      name: `${h}:00`,
      energy: +(baseIrradiance * (efficiency / 100) * voltage * current * factor * (Math.random() * 0.2 + 0.9)).toFixed(2)
    }));

    const days = daysInMonth[month];
    const dailyEnergy = baseIrradiance * (efficiency / 100) * voltage * current * factor;

    const dailyResult = Array.from({ length: days }, (_, idx) => ({
      name: `Day ${idx + 1}`,
      energy: +(dailyEnergy * (Math.random() * 0.3 + 0.85)).toFixed(2)
    }));

    const yearly = months.map((m) => {
      const daysIn = daysInMonth[m];
      const avgDaily = dailyEnergy * (Math.random() * 0.3 + 0.85);
      return {
        name: m,
        energy: +(avgDaily * daysIn).toFixed(2)
      };
    });

    setYearlyData(yearly);
    setDailyData(dailyFilter === 'hourly' ? hourlyData : dailyResult);
  }, [country, month, efficiency, panelType, years, voltage, current, dailyFilter]);

  const filteredYearlyData =
    yearlyFilter === 'Overall'
      ? yearlyData
      : yearlyData.filter((d) => d.name === yearlyFilter);

  const exportToCSV = (data, fileName) => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="solar-container">
      <img src="https://cdn-icons-png.flaticon.com/512/869/869869.png" className="hovering-icon" alt="Sun icon" />
      <h1 className="solar-heading">🌞 Solar Irradiance Calculator</h1>

      <div className="solar-card">
        <div className="solar-grid">
          <div>
            <label>Country</label>
            <select className="blue-select animated-select" value={country} onChange={(e) => setCountry(e.target.value)}>
              {countryList.map((c) => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Month</label>
            <select className="blue-select animated-select" value={month} onChange={(e) => setMonth(e.target.value)}>
              {months.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Efficiency (%)</label>
            <input type="number" value={efficiency} onChange={(e) => setEfficiency(+e.target.value)} min="1" max="100" />
          </div>

          <div>
            <label>Panel Type</label>
            <select className="blue-select animated-select" value={panelType} onChange={(e) => setPanelType(e.target.value)}>
              <option value="Monocrystalline">Monocrystalline</option>
              <option value="Polycrystalline">Polycrystalline</option>
              <option value="Thin-Film">Thin-Film</option>
            </select>
          </div>

          <div>
            <label>No. of Years</label>
            <input type="number" value={years} onChange={(e) => setYears(+e.target.value)} min="1" max="50" />
          </div>

          <div>
            <label>Voltage (V)</label>
            <input type="number" value={voltage} onChange={(e) => setVoltage(+e.target.value)} />
          </div>

          <div>
            <label>Current (A)</label>
            <input type="number" value={current} onChange={(e) => setCurrent(+e.target.value)} />
          </div>
        </div>
      </div>

      <div className="solar-card">
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>
          Energy Output Graph
        </h2>

        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <select
            className="blue-select animated-select small-tab"
            value={dailyFilter}
            onChange={(e) => setDailyFilter(e.target.value)}
          >
            <option value="hourly">Hourly for Day</option>
            <option value="daily">Daily for Month</option>
          </select>

          <button
            className="export-button"
            onClick={() => exportToCSV(dailyData, dailyFilter === 'hourly' ? 'HourlyData' : 'DailyData')}
          >
            📥 Export to CSV
          </button>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Energy (kWh)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="energy" stroke="#e67e22" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="solar-card">
        <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>
          Yearly Estimated Energy Generation
        </h2>

        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <select
            className="blue-select animated-select small-tab"
            value={yearlyFilter}
            onChange={(e) => setYearlyFilter(e.target.value)}
          >
            <option value="Overall">Overall</option>
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <button
            className="export-button"
            onClick={() => exportToCSV(filteredYearlyData, 'YearlyData')}
          >
            📥 Export to CSV
          </button>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredYearlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Total Energy (kWh)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="energy" stroke="#2980b9" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SolarIrradianceCalculator;
