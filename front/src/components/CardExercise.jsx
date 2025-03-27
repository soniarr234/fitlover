import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/styles/CardExercise.css'; // Si tienes estilos

const CardExercise = ({ ejercicio, isInRoutinePage, isInExercisesPage, onDelete, onDeleteFromRoutine, rutinaComenzada }) => {
    const isCardio = typeof ejercicio.musculos === 'string'
        ? ejercicio.musculos.toLowerCase().includes('cardio')
        : Array.isArray(ejercicio.musculos) && ejercicio.musculos.some(musculo => musculo.toLowerCase().includes('cardio'));

    const [showPopup, setShowPopup] = useState(false);
    const [routines, setRoutines] = useState([]); // Estado para almacenar las rutinas

    const [showInputs, setShowInputs] = useState(false);

    const [series, setSeries] = useState([]);
    const [newReps, setNewReps] = useState('');
    const [newPeso, setNewPeso] = useState('');
    const [newVueltas, setNewVueltas] = useState('');
    const [newTiempo, setNewTiempo] = useState('');

    const [activeIndex, setActiveIndex] = useState(null); // Estado para rastrear el botón activo
    const [selectedSeries, setSelectedSeries] = useState(null);

    const [showRestPopup, setShowRestPopup] = useState(false);
    const [countdown, setCountdown] = useState(60);

    const [superSerieActive, setSuperSerieActive] = useState(false);

    const [isEditingExercise, setIsEditingExercise] = useState(false);
    const [editedTitle, setEditedTitle] = useState(ejercicio.nombre);
    const [editedMuscles, setEditedMuscles] = useState(Array.isArray(ejercicio.musculos) ? ejercicio.musculos.join(', ') : ejercicio.musculos);
    const [editedDescription, setEditedDescription] = useState(ejercicio.descripcion);
    const [editedObservaciones, setEditedObservaciones] = useState(ejercicio.observaciones || '');
    const [ejercicioData, setEjercicioData] = useState(ejercicio);


    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [exerciseToDelete, setExerciseToDelete] = useState(null);
    const [deleteType, setDeleteType] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' o 'error'
    const [showMessagePopup, setShowMessagePopup] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

    // Obtener las rutinas desde la base de datos al montar el componente
    useEffect(() => {
        const fetchRoutines = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get(`${API_URL}/rutinas`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setRoutines(response.data); // Guardar las rutinas en el estado
                } catch (error) {
                    console.error('Error al obtener las rutinas:', error);
                }
            }
        };
        fetchRoutines();
    }, []); // Solo se ejecuta al montar el componente

    const [userId, setUserId] = useState(null); // Estado para almacenar el ID del usuario

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No hay token en el localStorage");
                return;
            }

            try {
                const response = await axios.get(`${API_URL}/usuario`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.id) {
                    setUserId(response.data.id); // Guardamos el ID del usuario
                } else {
                    console.warn("⚠️ El backend no está devolviendo el ID del usuario.");
                }
            } catch (error) {
                console.error("❌ Error al obtener el usuario:", error.response ? error.response.data : error);
            }
        };

        fetchUser();
    }, []);


    useEffect(() => {
        if (userId) { // Verificar que userId tenga valor antes de usarlo
            const storedSeries = JSON.parse(localStorage.getItem('seriesData')) || {};
            if (storedSeries[userId] && storedSeries[userId][ejercicio.id]) {
                setSeries(storedSeries[userId][ejercicio.id]);
            }
        }
    }, [userId, ejercicio.id]); // Agrega userId como dependencia

    useEffect(() => {
        let timer;
        if (showRestPopup && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0) {
            setShowRestPopup(false);
            setCountdown(60);
        }
        return () => clearInterval(timer);
    }, [showRestPopup, countdown]);

    const saveSeriesToLocalStorage = (updatedSeries) => {
        if (!userId) return; // Si userId no está definido, no hacer nada

        const storedSeries = JSON.parse(localStorage.getItem('seriesData')) || {};
        storedSeries[userId] = storedSeries[userId] || {};
        storedSeries[userId][ejercicio.id] = updatedSeries;
        localStorage.setItem('seriesData', JSON.stringify(storedSeries));
    };


    const handleAddSerie = () => {
        if (isCardio) {
            // Verificar si las vueltas y el tiempo están completos
            if (newVueltas && newTiempo) {
                const updatedSeries = [...series, { vueltas: newVueltas, tiempo: newTiempo }];
                setSeries(updatedSeries);
                saveSeriesToLocalStorage(updatedSeries); // Guardar en localStorage
                setNewVueltas(''); // Limpiar el campo de vueltas
                setNewTiempo('');  // Limpiar el campo de tiempo
            } else {
                // Mostrar un mensaje de advertencia si falta algún campo
                setMessage('Por favor, completa tanto las vueltas como el tiempo.');
                setMessageType('error');
                setShowMessagePopup(true);
            }
        } else {
            // Si no es cardio, verificar que las repeticiones y peso estén completos
            if (newReps && newPeso) {
                const updatedSeries = [...series, { reps: newReps, peso: newPeso }];
                setSeries(updatedSeries);
                saveSeriesToLocalStorage(updatedSeries); // Guardar en localStorage
                setNewReps(''); // Limpiar el campo de repeticiones
                setNewPeso(''); // Limpiar el campo de peso
            } else {
                // Mostrar un mensaje de advertencia si falta algún campo
                setMessage('Por favor, completa tanto las repeticiones como el peso.');
                setMessageType('error');
                setShowMessagePopup(true);
            }
        }

        setShowInputs(false); // Cerrar los campos de entrada después de agregar la serie
    };

    const handleEditSerie = (index) => {
        setActiveIndex(index); // Activar la edición para la serie seleccionada
    };

    const handleSaveEditSerie = (index) => {
        const updatedSeries = [...series];

        if (isCardio) {
            updatedSeries[index].vueltas = newVueltas || updatedSeries[index].vueltas;
            updatedSeries[index].tiempo = newTiempo || updatedSeries[index].tiempo;
        } else {
            updatedSeries[index].reps = newReps || updatedSeries[index].reps;
            updatedSeries[index].peso = newPeso || updatedSeries[index].peso;
        }

        setSeries(updatedSeries);
        saveSeriesToLocalStorage(updatedSeries);
        setActiveIndex(null); // Cerrar el modo edición
        setNewReps('');
        setNewPeso('');
        setNewVueltas('');
        setNewTiempo('');
    };

    const handleDeleteSerie = (index) => {
        const updatedSeries = series.filter((_, i) => i !== index);
        setSeries(updatedSeries);
        saveSeriesToLocalStorage(updatedSeries);
    };

    const handleEditExercise = () => {
        setIsEditingExercise(true);
    };

    const saveExerciseChanges = async () => {
        const token = localStorage.getItem("token");

        const payload = {
            nombre: editedTitle,
            musculos: editedMuscles.split(',').map(m => m.trim()), // Convierte en array
            descripcion: editedDescription,
            observaciones: editedObservaciones
        };

        try {
            const response = await axios.put(
                `${API_URL}/ejercicios/${ejercicio.id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEjercicioData((prev) => ({
                ...prev,
                ...payload
            }));

            setIsEditingExercise(false);
            setMessage('Ejercicio actualizado correctamente');
            setMessageType('success');
            setShowMessagePopup(true);
        } catch (error) {
            console.error('Error al actualizar el ejercicio:', error);
            setMessage('Hubo un problema al actualizar el ejercicio.');
            setMessageType('error');
            setShowMessagePopup(true);
        }
    };

    const handleAddExercise = async (routineId) => {
        try {
            const token = localStorage.getItem("token");

            // Si no hay token, muestra un mensaje de error
            if (!token) {
                setMessage('Necesitas iniciar sesión.');
                setMessageType('error');
                setShowMessagePopup(true);
                return;
            }

            // Realiza la solicitud POST para agregar el ejercicio a la rutina
            const response = await axios.post(
                `${API_URL}/rutina_ejercicios`,
                {
                    rutina_id: routineId,
                    ejercicio_id: ejercicio.id,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Cierra el popup y muestra mensaje de éxito
            setShowPopup(false);
            setMessage('Ejercicio agregado correctamente.');
            setMessageType('success');
            setShowMessagePopup(true);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setMessage(error.response.data.message); // Si el error es por ejercicio ya agregado
                setMessageType('error');
            } else {
                console.error('Error al agregar el ejercicio:', error);
                setMessage('Hubo un problema al agregar el ejercicio.');
                setMessageType('error');
            }
            setShowMessagePopup(true);
        }
    };

    useEffect(() => {
        if (isInRoutinePage) { // Solo en la página de rutina
            const storedSuperSerie = JSON.parse(localStorage.getItem(`superSerie_${ejercicio.id}`));
            if (storedSuperSerie !== null) {
                setSuperSerieActive(storedSuperSerie);
            }
        }
    }, [isInRoutinePage, ejercicio.id]);


    const toggleSuperSerie = () => {
        const newState = !superSerieActive;
        setSuperSerieActive(newState);

        // Guardar en localStorage solo si estamos en la página de rutinas
        if (isInRoutinePage) {
            localStorage.setItem(`superSerie_${ejercicio.id}`, JSON.stringify(newState));
        }
    };

    const handleDeleteExercise = (exerciseId) => {
        setExerciseToDelete(exerciseId);
        setDeleteType('db'); // Indica que se eliminará de la base de datos
        setShowConfirmPopup(true);
    };

    const confirmDelete = () => {
        if (deleteType === 'db') {
            onDelete(exerciseToDelete);
        } else if (deleteType === 'routine') {
            onDeleteFromRoutine(exerciseToDelete);
        }
        setShowConfirmPopup(false);
        setMessage('Ejercicio eliminado con éxito');
        setMessageType('success');
        setShowMessagePopup(true);
        setTimeout(() => window.location.reload(), 3000); // Recargar la página después de 2 segundos
    };

    return (
        <div className="card-exercise" style={{ backgroundColor: superSerieActive ? '#d1f61d' : 'white' }}>
            <div className='container-title'>
                {isEditingExercise ? (
                    <input
                        className='title-exercice'
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                    />
                ) : (
                    <h3>{ejercicioData.nombre}</h3>
                )}
                {/* Mostrar el botón de eliminar solo en ExercisesPage */}
                {isInExercisesPage ? (
                    <button className='delete-btn' onClick={() => handleDeleteExercise(ejercicio.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24">
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18 9l-.84 8.398c-.127 1.273-.19 1.909-.48 2.39a2.5 2.5 0 0 1-1.075.973C15.098 21 14.46 21 13.18 21h-2.36c-1.279 0-1.918 0-2.425-.24a2.5 2.5 0 0 1-1.076-.973c-.288-.48-.352-1.116-.48-2.389L6 9m7.5 6.5v-5m-3 5v-5m-6-4h4.615m0 0l.386-2.672c.112-.486.516-.828.98-.828h3.038c.464 0 .867.342.98.828l.386 2.672m-5.77 0h5.77m0 0H19.5" />
                        </svg>
                    </button>
                ) : (
                    // Mostrar el botón de eliminar solo en RoutineDetailsPage
                    isInRoutinePage && (
                        <button className='delete-btn' onClick={() => onDeleteFromRoutine(ejercicio.id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.8em" height="1.8em" viewBox="0 0 24 24">
                                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m18 9l-.84 8.398c-.127 1.273-.19 1.909-.48 2.39a2.5 2.5 0 0 1-1.075.973C15.098 21 14.46 21 13.18 21h-2.36c-1.279 0-1.918 0-2.425-.24a2.5 2.5 0 0 1-1.076-.973c-.288-.48-.352-1.116-.48-2.389L6 9m7.5 6.5v-5m-3 5v-5m-6-4h4.615m0 0l.386-2.672c.112-.486.516-.828.98-.828h3.038c.464 0 .867.342.98.828l.386 2.672m-5.77 0h5.77m0 0H19.5" />
                            </svg>
                        </button>
                    )
                )}
            </div>
            {showConfirmPopup && (
                <div className="popup">
                    <div className="container-popup">
                        <h4>¿Estás seguro de que quieres eliminar este ejercicio?</h4>
                        <div className='container-button-delete'>
                            <button className='save-btn' onClick={confirmDelete}>Sí</button>
                            <button className='cancel-btn' onClick={() => setShowConfirmPopup(false)}>No</button>
                        </div>
                    </div>
                </div>
            )}
            {showMessagePopup && (
                <div className={`message-popup ${messageType}`}>
                    <div className="success">
                        <p>{message}</p>
                    </div>
                </div>
            )}

            {isEditingExercise ? (
                <input
                    className='edited-muscle-exercice'
                    type="text"
                    value={editedMuscles}
                    onChange={(e) => setEditedMuscles(e.target.value)}
                />
            ) : (
                <p><strong>Músculos ejercitados:</strong> {Array.isArray(ejercicioData.musculos) ? ejercicioData.musculos.join(', ') : ejercicioData.musculos}</p>
            )}

            {ejercicio.video_o_imagen_url &&
                (ejercicio.video_o_imagen_url.endsWith('.jpg') || ejercicio.video_o_imagen_url.endsWith('.png') || ejercicio.video_o_imagen_url.endsWith('.webp') ? (
                    <img src={ejercicio.video_o_imagen_url} alt={ejercicio.nombre} loading="lazy" />
                ) : (
                    <video src={ejercicio.video_o_imagen_url} title={ejercicio.nombre} controls>
                        Tu navegador no soporta este formato de video.
                    </video>
                ))
            }

            {isEditingExercise ? (
                <textarea
                    className='observation-textarea'
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                />
            ) : (
                <p><strong>Descripción:</strong> {ejercicioData.descripcion}</p>
            )}
            {/* Sección para añadir series */}
            {isInRoutinePage && (
                <div>
                    <p className='text-card'><strong>Series:</strong></p>
                    {series.length > 0 ? (
                        <ul className='series-section'>
                            {series
                                .filter(serie => (isCardio ? serie.vueltas && serie.tiempo : serie.reps && serie.peso)) // Filtra elementos vacíos
                                .map((serie, index) => (
                                    <div className='form-edit-serie'>
                                        <li key={index}>
                                            {activeIndex === index ? (
                                                <>
                                                    {isCardio ? (
                                                        <>
                                                            <input
                                                                type="text"
                                                                value={newVueltas || serie.vueltas}
                                                                onChange={(e) => setNewVueltas(e.target.value)}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={newTiempo || serie.tiempo}
                                                                onChange={(e) => setNewTiempo(e.target.value)}
                                                            />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <input
                                                                type="text"
                                                                value={newReps || serie.reps}
                                                                onChange={(e) => setNewReps(e.target.value)}
                                                            />
                                                            <input
                                                                type="text"
                                                                value={newPeso || serie.peso}
                                                                onChange={(e) => setNewPeso(e.target.value)}
                                                            />
                                                        </>
                                                    )}
                                                    <button className='button-save-edit-series' onClick={() => handleSaveEditSerie(index)}>Guardar</button>
                                                </>
                                            ) : (
                                                <>
                                                    {isCardio
                                                        ? `${serie.vueltas} vueltas / ${serie.tiempo}`
                                                        : `${serie.reps} reps / ${serie.peso} kg`
                                                    }
                                                    <button className='edit-btn' onClick={() => handleEditSerie(index)}><svg xmlns="http://www.w3.org/2000/svg" width="1.75em" height="1.6em" viewBox="0 0 1792 1408"><path fill="currentColor" d="m888 1056l116-116l-152-152l-116 116v56h96v96zm440-720q-16-16-33 1L945 687q-17 17-1 33t33-1l350-350q17-17 1-33m80 594v190q0 119-84.5 203.5T1120 1408H288q-119 0-203.5-84.5T0 1120V288Q0 169 84.5 84.5T288 0h832q63 0 117 25q15 7 18 23q3 17-9 29l-49 49q-14 14-32 8q-23-6-45-6H288q-66 0-113 47t-47 113v832q0 66 47 113t113 47h832q66 0 113-47t47-113V994q0-13 9-22l64-64q15-15 35-7t20 29m-96-738l288 288l-672 672H640V864zm444 132l-92 92l-288-288l92-92q28-28 68-28t68 28l152 152q28 28 28 68t-28 68" /></svg></button>
                                                </>
                                            )}
                                            {/* Botón adicional para cada serie */}
                                            {rutinaComenzada && (
                                                <button
                                                    className={`additional-btn ${selectedSeries === index ? 'active' : ''}`}
                                                    onClick={() => setSelectedSeries(index)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 11l-1 3l1 3h-1.5L9 14l.5-4.5zm1-9L9 6v8l1 3H6l-3 5m17.5 0l-5-3.5L12 17l-1-3l1-3l3.5 2v5.5M14 8.5a1 1 0 1 1 0-2a1 1 0 0 1 0 2m-3 2L10 17v-3.5z" /></svg>
                                                </button>
                                            )}
                                            <button className="delete-serie-btn" onClick={() => handleDeleteSerie(index)}>X</button>
                                        </li>
                                        <div className='line'></div>
                                    </div>

                                ))
                            }
                        </ul>
                    ) : (
                        <p className='no-series'>No hay series añadidas</p> // Solo muestra esto si `series` está vacío
                    )}

                    {rutinaComenzada && (
                        <div className='container-button-rest'>
                            {/* Botón "Descanso" solo si la rutina ha comenzado */}
                            {rutinaComenzada && (
                                <button className='button-rest' onClick={() => setShowRestPopup(true)}>Descanso</button>
                            )}

                            {/* Popup de cuenta atrás */}
                            {showRestPopup && (
                                <div className="popup-descanso">
                                    <p className="countdown">Descanso: {countdown} segundos</p>
                                    <button onClick={() => setShowRestPopup(false)}>Cerrar</button>
                                </div>
                            )}
                        </div>
                    )}
                    <div>
                        {!showInputs ? (
                            <button className='button-add-series' onClick={() => setShowInputs(true)}>Añadir Serie</button>
                        ) : (
                            <div>
                                {isCardio ? (
                                    <form className='form-add-series'>
                                        <div>
                                            <input type="text" placeholder="Vueltas" value={newVueltas} onChange={(e) => setNewVueltas(e.target.value)} />
                                            <input type="text" placeholder="Tiempo (seg)" value={newTiempo} onChange={(e) => setNewTiempo(e.target.value)} />
                                        </div>
                                    </form>
                                ) : (
                                    <form className='form-add-series'>
                                        <div>
                                            <input type="text" placeholder="Reps" value={newReps} onChange={(e) => setNewReps(e.target.value)} />
                                            <input type="text" placeholder="Peso (kg)" value={newPeso} onChange={(e) => setNewPeso(e.target.value)} />
                                        </div>
                                    </form>
                                )}
                                <div className='container-button-save-series'>
                                    <button className='button-save-series' onClick={handleAddSerie}>Guardar</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Observaciones */}
            {isInRoutinePage && isEditingExercise ? (
                <div>
                    <textarea
                        value={editedObservaciones}
                        onChange={(e) => setEditedObservaciones(e.target.value)}
                        rows="4"
                        cols="50"
                        className='observation-textarea'
                    />
                </div>
            ) : (
                <div>
                    <p><strong>Observaciones:</strong> {ejercicioData.observaciones}</p>
                </div>
            )}
            {/* Botón de guardar cambios (solo fuera de la página de rutinas y en modo edición) */}
            {isInRoutinePage && isEditingExercise ? (
                <button className='save-edit-exercise-btn' onClick={saveExerciseChanges}>Guardar ejercicio</button>
            ) : (
                isInRoutinePage && (
                    <button className='edit-exercise-btn' onClick={handleEditExercise}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                                <path strokeDasharray="20" strokeDashoffset="20" d="M3 21h18">
                                    <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="20;0" />
                                </path>
                                <path strokeDasharray="48" strokeDashoffset="48" d="M7 17v-4l10 -10l4 4l-10 10h-4">
                                    <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.2s" dur="0.6s" values="48;0" />
                                </path>
                                <path strokeDasharray="8" strokeDashoffset="8" d="M14 6l4 4">
                                    <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="8;0" />
                                </path>
                            </g>
                        </svg>
                        Editar ejercicio
                    </button>
                )
            )}
            {isInRoutinePage && (
                <button className='superserie-btn' onClick={toggleSuperSerie} style={{ backgroundColor: superSerieActive ? 'orange' : '#d1f61d' }} >
                    {superSerieActive ? 'Quitar Superserie' : 'Hacer Superserie'}
                </button>
            )}
            {!isInRoutinePage && (
                <button className='add-exercise' onClick={() => setShowPopup(true)}>Añadir ejercicio a una rutina</button>
            )}
            {showPopup && (
                <div className="select-routine-popup">
                    <div className="container-select-routine-popup">
                        <h2>Selecciona una Rutina</h2>
                        <ul className='popup-routines'>
                            {routines.length > 0 ? (
                                routines.map((routine) => (
                                    <li className='popup-rutine' key={routine.id} onClick={() => handleAddExercise(routine.id)}>
                                        {routine.nombre}
                                    </li>
                                ))
                            ) : (
                                <p className='text-card'>No tienes rutinas disponibles</p>
                            )}
                        </ul>
                        <button className='cancel-btn' onClick={() => setShowPopup(false)}>Cancelar</button>
                    </div>
                </div>
            )}

            {/* Popup de mensajes */}
            {showMessagePopup && (
                <div className={`message-popup ${messageType}`}>
                    <p className='text-card'>{message}</p>
                    <button className='close-btn' onClick={() => setShowMessagePopup(false)}>Cerrar</button>
                </div>
            )}
        </div>
    );
};

export default CardExercise;
