import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await axios('http://localhost:3001/api/sample');  
                setData(result.data); 
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };
        fetchData();
    }, []);
// puts the data on the website
    return (
    <div>
        <h1>NIST Manufacturing Data</h1>
        <div className="data-container">
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    </div>
);
}

export default App;
