import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../pages/auth-context"; 


export default function ProtectedRoute({ children }) {
    const  {isAuthenticated}  = useContext(AuthContext);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }   
    return children;
}