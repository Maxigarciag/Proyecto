import React, { useEffect, useState } from "react";
import "../css/Global.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const MAPS_API_KEY = "TU_CLAVE_DE_API_AQUI"; // 🔑 Reemplázala con tu clave

const Sucursales = () => {
    const [sucursales, setSucursales] = useState([]);
    const [nombre, setNombre] = useState("");
    const [direccion, setDireccion] = useState("");
    const [coordenadas, setCoordenadas] = useState(null);
    const [editando, setEditando] = useState(false);
    const [idEditando, setIdEditando] = useState(null);

    useEffect(() => {
        obtenerSucursales();
    }, []);

    const obtenerSucursales = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/sucursales");
            if (!res.ok) throw new Error("Error al obtener las sucursales");
            const data = await res.json();
            setSucursales(data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const obtenerCoordenadas = async (direccion) => {
        if (!direccion) return null;

        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${MAPS_API_KEY}`
            );
            const data = await response.json();
            if (data.results.length > 0) {
                return data.results[0].geometry.location;
            } else {
                alert("No se encontraron coordenadas para esta dirección.");
                return null;
            }
        } catch (error) {
            console.error("Error en la geocodificación:", error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nombre.trim() || !direccion.trim()) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const location = await obtenerCoordenadas(direccion);

        const sucursalData = {
            nombre,
            direccion,
            latitud: location?.lat || null,
            longitud: location?.lng || null,
        };

        try {
            let response;
            if (editando) {
                response = await fetch(`http://localhost:5000/api/sucursales/${idEditando}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(sucursalData),
                });
            } else {
                response = await fetch("http://localhost:5000/api/sucursales", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(sucursalData),
                });
            }

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Error al guardar la sucursal");

            alert(data.message);
            setSucursales(prev =>
                editando
                    ? prev.map(s => (s.IDSucursal === idEditando ? { ...s, ...sucursalData } : s))
                    : [...prev, data.sucursal]
            );

            setEditando(false);
            setIdEditando(null);
            setNombre("");
            setDireccion("");
        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar esta sucursal?")) return;

        try {
            const response = await fetch(`http://localhost:5000/api/sucursales/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Error al eliminar la sucursal");

            setSucursales(prev => prev.filter(s => s.IDSucursal !== id));
            alert("Sucursal eliminada con éxito.");
        } catch (error) {
            console.error("Error:", error);
            alert(error.message);
        }
    };

    const handleEdit = async (sucursal) => {
        setEditando(true);
        setIdEditando(sucursal.IDSucursal);
        setNombre(sucursal.Nombre);
        setDireccion(sucursal.Direccion);
    };

    return (
        <div className="sucursales-container">
            <h1 className="titulo-principal">Sucursales</h1>

            <h2>{editando ? "Editar Sucursal" : "Agregar Sucursal"}</h2>

            <form onSubmit={handleSubmit} className="sucursal-form">
                <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                <input type="text" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
                <button type="submit">{editando ? "Guardar Cambios" : "Agregar Sucursal"}</button>
                {editando && (
                    <button type="button" onClick={() => { setEditando(false); setNombre(""); setDireccion(""); }}>
                        Cancelar
                    </button>
                )}
            </form>

            {sucursales.length > 0 ? (
                <table className="sucursales-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Dirección</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sucursales.map((sucursal) => (
                            <tr key={sucursal.IDSucursal}>
                                <td>{sucursal.Nombre}</td>
                                <td>{sucursal.Direccion}</td>
                                <td className="acciones">
                                    <button className="edit-btn" onClick={() => handleEdit(sucursal)}>
                                        <FaEdit />
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDelete(sucursal.IDSucursal)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay sucursales registradas.</p>
            )}
        </div>
    );
};

export default Sucursales;
