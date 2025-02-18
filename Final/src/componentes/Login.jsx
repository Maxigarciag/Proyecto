import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";
import "../css/Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                localStorage.setItem("userName", data.userName);
                localStorage.setItem("userRole", data.userRole);
                navigate("/home");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert("Error al conectar con el servidor.");
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <div className="avatar">
                    <FontAwesomeIcon icon={faUserCircle} size="5x"/>
                </div>
                <h2>Iniciar Sesión</h2>
                <input
                    type="email"
                    placeholder="Correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="login-button">
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
};

export default Login;


