import { BrowserRouter, Routes, Route } from "react-router-dom"
import Landing from "../pages/Landing"
import Login from "../pages/login"
import Register from "../pages/Register"


export default function AppRouter(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </BrowserRouter>
    )
}