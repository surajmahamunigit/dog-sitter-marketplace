// src/routes/index.tsx

import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";

// Pages 
import SitterList from "../pages/SitterList";
import SitterProfile from "../pages/SitterProfile";
import Dashboard from "../pages/Dashboard";

export default function AppRoutes() {
    return (
        <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route path="/sitters" element={
            <ProtectedRoute><SitterList /></ProtectedRoute>
        } />
        <Route path="/sitters/:id" element={
            <ProtectedRoute><SitterProfile /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        </Routes>
    );
}