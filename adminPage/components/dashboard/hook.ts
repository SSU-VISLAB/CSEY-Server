import { ApiClient } from "adminjs";
import {useState, useEffect} from "react";
const api = new ApiClient();

export const useLog = () => {
    const [log, setLog] = useState('');

    useEffect(() => {
        const fetchLog = () => {
            console.log('get log');
            api.getDashboard<string>().then(d => setLog(d.data));
        };
        fetchLog();

        const intervalId = setInterval(fetchLog, 5000);
        return () => {
            clearInterval(intervalId);
            console.log('clear get log interval');
        }
    }, []);

    return log;
};