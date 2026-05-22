// src/routes/index.tsx

import { Routes, Route } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";
import BookingForm from "../pages/BookingForm";

// Pages 
import SitterList from "../pages/SitterList";
import SitterProfile from "../pages/SitterProfile";
import Dashboard from "../pages/Dashboard";
import Dogs from "../pages/Dogs";
import AddDog from "../pages/AddDog";
import BookingConfirmed from "../pages/BookingConfirmed"
import BookingCancelled from "../pages/BookingCancelled"
import EditDogProfile from "../pages/EditDogProfile"
import EditSitterProfile from "../pages/EditSitterProfile"
import MatchResults from '../pages/MatchResults'
import EditOwnerProfile from '../pages/EditOwnerProfile'

export default function AppRoutes() {
    return (
        <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/booking-confirmed" element={<BookingConfirmed />} />
        <Route path="/booking-cancelled" element={<BookingCancelled />} />
        <Route
            path="/dogs/:id/edit-profile"
            element={
                <ProtectedRoute>
                <EditDogProfile />
                </ProtectedRoute>
            }
        />
        

        {/* Protected */}
        <Route path="/sitters" element={
            <ProtectedRoute><SitterList /></ProtectedRoute>
        } />
        <Route path="/sitters/:id" element={
            <ProtectedRoute><SitterProfile /></ProtectedRoute>
        } />
        <Route path="/dogs" element={<ProtectedRoute><Dogs /></ProtectedRoute>} />
        <Route path="/dogs/new" element={
            <ProtectedRoute><AddDog /></ProtectedRoute>
        } />
        <Route path="/book/:sitterId" element={
            <ProtectedRoute><BookingForm /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route
            path="/sitter/edit-profile"
            element={
                <ProtectedRoute>
                <EditSitterProfile />
                </ProtectedRoute>
            }
        />
        <Route path="/matches/results" element={<ProtectedRoute><MatchResults /></ProtectedRoute>} />
        <Route path="/owner/edit-profile" element={
            <ProtectedRoute><EditOwnerProfile /></ProtectedRoute>
        } />
        </Routes>
        
        
    );
}