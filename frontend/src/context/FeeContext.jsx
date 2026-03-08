import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FeeContext = createContext();

export const FeeProvider = ({ children }) => {
    const { token, user } = useAuth();
    const [feeStructures, setFeeStructures] = useState([]);
    const [myFees, setMyFees] = useState([]);
    const [stats, setStats] = useState(null);
    const [defaulters, setDefaulters] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFeeStructures = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setFeeStructures(data);
        } catch (error) {
            console.error('Error fetching fee structures:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyFees = async () => {
        if (!token || user?.role?.toLowerCase() !== 'student') return;
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setMyFees(data);
        } catch (error) {
            console.error('Error fetching personal fees:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        if (!token || user?.role?.toLowerCase() !== 'admin') return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching fee stats:', error);
        }
    };

    const fetchDefaulters = async () => {
        if (!token || user?.role?.toLowerCase() !== 'admin') return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fees`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setDefaulters(data);
        } catch (error) {
            console.error('Error fetching defaulters:', error);
        }
    };

    const submitPayment = async (paymentData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(paymentData)
            });
            const data = await response.json();
            if (response.ok) {
                await fetchMyFees();
                await fetchStats();
                return { success: true, data };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const createFeeStructure = async (structureData) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/fees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(structureData)
            });
            const data = await response.json();
            if (response.ok) {
                await fetchFeeStructures();
                return { success: true, data };
            }
            return { success: false, message: data.message };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    useEffect(() => {
        if (token) {
            fetchFeeStructures();
            if (user?.role?.toLowerCase() === 'student') fetchMyFees();
            if (user?.role?.toLowerCase() === 'admin') {
                fetchStats();
                fetchDefaulters();
            }
        }
    }, [token, user]);

    return (
        <FeeContext.Provider value={{
            feeStructures,
            myFees,
            stats,
            defaulters,
            loading,
            fetchMyFees,
            fetchStats,
            fetchDefaulters,
            submitPayment,
            createFeeStructure
        }}>
            {children}
        </FeeContext.Provider>
    );
};

export const useFees = () => useContext(FeeContext);
