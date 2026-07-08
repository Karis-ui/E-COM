import { useEffect, useState } from 'react';

export const COUNTIES = () => {
    const [counties, setCounties] = useState([]);

    useEffect(() => {
        const fetchCounties = async () => {
            try {
                const response = await fetch(
                    'https://kenyaareadata.vercel.app/api/areas?apiKey=keyPub1569gsvndc123kg9sjhg'
                );
                const data = await response.json();

                const countyList = Object.keys(data).map((name, index) => ({
                    code: index + 1,
                    name: name
                }));

                setCounties(countyList);
            } catch (error) {
                console.error("Error fetching counties:", error);
            }
        };

        fetchCounties();
    }, []);

    return (
        <select>
            {counties.map((county) => (
                <option key={county.code} value={county.code}>
                    {county.name}
                </option>
            ))}
        </select>
    );
};

export const WS_BASE_URL = "https://ktech-production.up.railway.app/ws";

