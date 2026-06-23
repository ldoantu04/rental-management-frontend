import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const RentalContext = createContext();

const RentalContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [token, setToken] = useState('');
    const [user, setUser] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const navigate = useNavigate();

    // Khôi phục token từ localStorage khi khởi động
    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'));
        }
    }, []);

    // Cấu hình axios mặc định kèm Authorization header khi token thay đổi
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

        // Lấy thông tin user khi có token
    const fetchUserProfile = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(response.data);
        } catch (error) {
            console.log('Lỗi khi lấy thông tin user:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                logout();
            }
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserProfile();
        }
    }, [token]);

    // Hàm logout
    const logout = () => {
        setToken('');
        setUser(null);
        localStorage.removeItem('token');
        navigate('/login');
    };

    const value = {
        backendUrl,
        token, setToken,
        user, setUser,
        navigate,
        logout,
        showLogoutConfirm, setShowLogoutConfirm,
    };

    return (
        <RentalContext.Provider value={value}>
            {props.children}
        </RentalContext.Provider>
    );
};

export default RentalContextProvider;
