import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/CardRoutine.css';
import logoShort from '../assets/images/logo-short.png';

const CardRoutine = ({ routineName, routineId, onDelete }) => {
  const [numEjercicios, setNumEjercicios] = useState(null);
  const [editableTitle, setEditableTitle] = useState(routineName);
  const [tiempo, setTiempo] = useState(localStorage.getItem(`tiempo_rutina_${routineId}`) || ''); // Se inicializa desde el localStorage
  const [pecho, setPecho] = useState(localStorage.getItem(`pecho_rutina_${routineId}`) || 'Musculo'); // Se inicializa con "Pecho" o el valor guardado
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // Estado para mostrar el modal de confirmación
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

  // Función para obtener el número de ejercicios de una rutina
  const fetchRutinasConEjercicios = async () => {
    try {
      const response = await fetch(`${API_URL}/rutina_ejercicios/${routineId}`);
      const data = await response.json();

      // Si la API devuelve una lista de ejercicios, simplemente contamos su longitud
      setNumEjercicios(data.length); // data debe ser un array de ejercicios
    } catch (error) {
      console.error('Error al obtener las rutinas con ejercicios:', error);
    }
  };

  useEffect(() => {
    fetchRutinasConEjercicios();
  }, [routineId]); // Se ejecuta cuando el routineId cambia

  const handleClick = () => {
    navigate(`/rutina/${routineId}`); // Redirige a la página de ejercicios de la rutina
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/rutinas/${routineId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la rutina');
      }

      onDelete(routineId); // Llama la función del padre para actualizar la UI
      setShowConfirmDelete(false); // Cierra el modal después de eliminar
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelDelete = (event) => {
    event.stopPropagation(); // Evita que el clic en el botón de cancelar dispare la redirección
    setShowConfirmDelete(false); // Cierra el modal si el usuario cancela
  };

  const handleTiempoChange = (event) => {
    const nuevoTiempo = event.target.value;
    setTiempo(nuevoTiempo); // Actualiza el estado
    localStorage.setItem(`tiempo_rutina_${routineId}`, nuevoTiempo); // Guarda el tiempo en el localStorage
  };

  const handlePechoChange = (event) => {
    const nuevoPecho = event.target.value;
    setPecho(nuevoPecho); // Actualiza el estado
    localStorage.setItem(`pecho_rutina_${routineId}`, nuevoPecho); // Guarda el valor en el localStorage
  };

  const handleTiempoClick = (event) => {
    event.stopPropagation(); // Evita que el clic en el input redirija
  };

  const handlePechoClick = (event) => {
    event.stopPropagation(); // Evita que el clic en el input redirija
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation(); // Evita que el clic en el botón de eliminar dispare la redirección
    setShowConfirmDelete(true); // Muestra el modal de confirmación
  };

  const handleTitleChange = (event) => {
    event.stopPropagation();
    setEditableTitle(event.target.value); // Actualiza el estado con el nuevo título
  };

  const handleTitleBlur = async () => {
    if (editableTitle.trim() === '' || editableTitle === routineName) return;

    const token = localStorage.getItem("token"); // Obtener el token antes de usarlo

    if (!token) {
      console.error("No hay token disponible");
      return;
    }

    try {
      // Actualizar el título en el backend
      await fetch(`${API_URL}/rutinas/nombre/${routineId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editableTitle })
      });

      // Verifica si tienes un array de rutinas para actualizar el orden
      const ordenActualizado = JSON.parse(localStorage.getItem("ordenRutinas")) || []; // Ajusta esta lógica según tu app

      updateOrder(ordenActualizado);

    } catch (error) {
      console.error('Error al actualizar la rutina:', error);
    }
  };


  const updateOrder = async (newOrder) => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No hay token disponible");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/rutinas/updateOrder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order: newOrder }) // El backend espera un array de IDs
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el orden');
      }

    } catch (error) {
      console.error('Error al actualizar el orden en el backend:', error);
    }
  };

  return (
    <>
      <div className="card-routine" onClick={handleClick}>
        <div className="top-section">
          <div className="border" />
          <input
            type="text"
            value={editableTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onClick={(event) => event.stopPropagation()} // Evita que el clic en el input redirija
            onMouseDown={(event) => event.stopPropagation()} // Detiene la propagación antes de que el input reciba el foco
            className="routine-name"
          />

          <div className="icons">
            <div className="logo">
              <img className="img" src={logoShort} alt="" />
            </div>
          </div>
        </div>
        <div className="bottom-section">
          <input
            type="text"
            value={pecho}
            onChange={handlePechoChange}
            onClick={handlePechoClick} // Evita la redirección al hacer clic en el input
            className="body-part-input"
          />
          <div className="row row1">
            <div className="item">
              <span className="big-text">{numEjercicios !== null ? numEjercicios : 'Cargando...'}</span>
              <span className="regular-text">ejercicios</span>
            </div>
            <div className="item">
              <input
                type="text"
                value={tiempo}
                onChange={handleTiempoChange}
                onClick={handleTiempoClick} // Evita la redirección al hacer clic en el input
                className="input-time big-text"
              />
              <span className="regular-text">Tiempo</span>
            </div>
          </div>

          {/* Botón para mostrar el modal de confirmación */}
          <button className="delete-card-routine-button" onClick={handleDeleteClick}>
            Eliminar rutina
          </button>
        </div>

      </div>
      {/* Modal de confirmación */}
      {
        showConfirmDelete && (
          <div className="popup" onClick={handleCancelDelete}>
            <div className='container-popup'>
              <h4>¿Seguro que quieres eliminar la rutina {routineName}?</h4>
              <div className='container-buttons'>
                <button className='save-btn' onClick={() => { onDelete(routineId); }}>Eliminar</button>
                <button onClick={handleCancelDelete} className="cancel-btn">Cancelar</button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

export default CardRoutine;
