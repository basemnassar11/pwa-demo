import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [hospitals, setHospitals] = useState([]);
    useEffect(() => {
        axios
            .get('http://localhost:4000/hospitals')
            .then((response) => {
                setHospitals(response.data);
            })
            .catch((err) => {
                console.log('error', err);
            });
    }, []);
    return (
        <div className="app">
            <h1>Hospitals</h1>
            {hospitals.map((hospital) => (
                <div key={hospital.id} className="card">
                    <h3>{hospital.name}</h3>
                    <div>Specialities: {hospital.specialities}</div>
                    <div>Doctors: {hospital.doctors}</div>
                    <div>Surgeries: {hospital.surgeries}</div>
                    <div>Bed count: {hospital.bedCount}</div>
                </div>
            ))}
        </div>
    );
}

export default App;
