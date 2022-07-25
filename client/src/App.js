import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [hospitals, setHospitals] = useState([]);
    const [activeId, setActiveId] = useState();
    const [hospitalData, setHospitalData] = useState({
        id: null,
        email: '',
        first_name: '',
        last_name: '',
    });
    console.log(hospitalData)
    const [message, setMessage] = useState();

    useEffect(() => {
        fetchHospitals();
    }, []);

    function fetchHospitals() {
        axios
            .get('https://reqres.in/api/users')
            .then((response) => {
              console.log(response.data.data); 
                const dbOpenRequest = indexedDB.open('hospitalDB', 1);
                dbOpenRequest.onupgradeneeded = function (event) {
                    const db = event.target.result;
                    db.createObjectStore('hospitalStore', { keyPath: 'id' });
                };
                dbOpenRequest.onsuccess = function (event) {
                    const db = event.target.result;
                    const txn = db.transaction('hospitalStore', 'readwrite');
                    const store = txn.objectStore('hospitalStore');
                    const clearRequest = store.clear();
                    clearRequest.onsuccess = function () {
                        response.data.data.forEach((hospital) => {
                            store.add(hospital);
                        });
                    };
                };
                setHospitals(response.data.data);
            })
            .catch(() => {
                const dbOpenRequest = indexedDB.open('hospitalDB', 1);
                dbOpenRequest.onsuccess = function (event) {
                    const db = event.target.result;
                    const txn = db.transaction('hospitalStore', 'readonly');
                    const store = txn.objectStore('hospitalStore');
                    const getAllRequest = store.getAll();
                    getAllRequest.onsuccess = function () {
                        setHospitals(getAllRequest.result);
                    };
                };
            });
    }

    function handleEditClick(hospital) {
        setActiveId(hospital.id);
        setHospitalData(hospital);
    }

    function handleCancelClick() {
        setActiveId(null);
    }

    function handleDataChange(e, key) {
        setHospitalData({
            ...hospitalData,
            [key]: parseInt(e.target.value),
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        axios
            .post(`https://reqres.in/api/users/${activeId}`, hospitalData)
            .then(() => {
                setMessage('Data saved successfully');
                setActiveId(null);
                fetchHospitals();
                setTimeout(() => {
                    setMessage(null);
                }, 5000);
            })
            .catch(() => {
                setMessage('Data saved for syncing');
                setActiveId(null);
                setHospitals((hospitals) => {
                    const index = hospitals.findIndex(
                        (h) => h.id === hospitalData.id
                    );
                    if (index !== -1) {
                        const newHospitals = hospitals.slice();
                        newHospitals[index] = hospitalData;
                        return newHospitals;
                    }
                    return hospitals;
                });
                const dbOpenRequest = indexedDB.open('hospitalDB', 1);
                dbOpenRequest.onsuccess = function (event) {
                    const db = event.target.result;
                    const txn = db.transaction('hospitalStore', 'readwrite');
                    const store = txn.objectStore('hospitalStore');
                    store.put(hospitalData);
                };
                setTimeout(() => {
                    setMessage(null);
                }, 5000);
            });
    }

    return (
        <div className="app">
            <h1>CRM USERS</h1>
            {hospitals.map((hospital) =>
                activeId === hospital.id ? (
                    <form
                        className="form"
                        key={hospital.id}
                        onSubmit={handleSubmit}
                    >
                        <h3>{hospital.email}</h3>
                        <div className="form__control">
                            <label>first_name</label>
                            <input
                                type="text"
                                value={hospitalData.first_name}
                                onChange={(e) =>
                                    handleDataChange(e, 'first_name')
                                }
                            />
                        </div>
                        <div className="form__control">
                            <label>last_name</label>
                            <input
                                type="text"
                                value={hospitalData.last_name}
                                onChange={(e) => handleDataChange(e, 'last_name')}
                            />
                        </div>
                       
                       
                        <div className="buttons">
                            <button
                                type="button"
                                className="button"
                                onClick={handleCancelClick}
                            >
                                Cancel
                            </button>
                            <button className="button">Update</button>
                        </div>
                    </form>
                ) : (
                    <div key={hospital.id} className="card">
                        <h3>{hospital.email}</h3>
                        <div>first_name: {hospital.first_name}</div>
                        <div>last_name: {hospital.last_name}</div>
                        <div className="buttons">
                            <button
                                className="button"
                                onClick={() => handleEditClick(hospital)}
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                )
            )}
            {message && <div className="message">{message}</div>}
        </div>
    );
}

export default App;
