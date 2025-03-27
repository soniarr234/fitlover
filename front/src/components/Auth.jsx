import { useState } from "react"; //Maneja estados dentro del componente
import { useNavigate } from "react-router-dom"; //Permite la navegación entre rutas en una aplicación
import axios from "axios"; //Se usa para hacer peticiones HTTP al backend

import '../assets/styles/Auth.css';
import backgroundForm from '../assets/images/background-form.jpg';
import logo from '../assets/images/logo.png';

export default function Auth({ setToken }) {
    const [isLogin, setIsLogin] = useState(true); //Controla si el usuario está en el formulario de inicio de sesión (true) o de registro (false).
    //Almaceno los valores del formulario
    const [nombre, setNombre] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña
    const [showPopup, setShowPopup] = useState(false); // Estado para el popup
    const [errorMessage, setErrorMessage] = useState(""); // Estado para los mensajes de error
    const navigate = useNavigate(); // Función para redirigir a otra página (Home) tras el login

    //Manejo del formulario 
    const handleAuth = async (e) => {
        e.preventDefault();
        //Si la url es isLogin es true hace el endpoint a login y si es false al register
        //La URL de la API se obtiene de la variable de entorno (VITE_API_URL).
        const url = isLogin
            ? `${import.meta.env.VITE_API_URL}/login`
            : `${import.meta.env.VITE_API_URL}/register`;

        //Si isLogin es true estas en login y tiene que aparecer el email y la contraseña y si es false estas en registro y tiene que aparecer el nombre, los apellidos, email y contraseña
        const data = isLogin
            ? { email, password }
            : { nombre, apellidos, email, password };
        //Intento hacer una solicitud post (al servidor) con los datos
        try {
            const response = await axios.post(url, data);
            if (isLogin) {
                localStorage.setItem("token", response.data.token); //Guardar el token en el localstore
                setToken(response.data.token); //envio el token al estado setToken y redirige a /home
                navigate("/home"); // Redirige a la página principal después del login
            } else {
                setShowPopup(true); // Muestra el popup cuando el registro sea exitoso
                setIsLogin(true);
                setErrorMessage(""); // Limpia cualquier error previo
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Inténtalo de nuevo"); // Establece el mensaje de error
        }
    };

    const closePopup = () => setShowPopup(false); // Cierra el popup

    //Funcion para mostrar u ocultar la contraseña
    const togglePasswordVisibility = (e) => {
        e.preventDefault(); // Previene el comportamiento por defecto del botón (submit)
        setShowPassword(!showPassword); // Cambia el estado para mostrar/ocultar la contraseña
    };

    return (
        <div className="Auth-page">
            <section className="img-form-section">
                <img src={backgroundForm} alt="" />
            </section>
            <section className="form-section">
                <img src={logo} alt="" />
                <h2>{isLogin ? "Iniciar Sesión" : "Registrarse"}</h2>
                <form onSubmit={handleAuth}>
                    {!isLogin && (
                        <>
                            <input
                                type="text"
                                placeholder="Nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Apellidos"
                                value={apellidos}
                                onChange={(e) => setApellidos(e.target.value)}
                                required
                            />
                        </>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"} // Cambia el tipo de input según el estado
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button onClick={togglePasswordVisibility} className="password-toggle-btn">
                            {showPassword ? (
                                <svg className="monkey-icon" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 64 64"><g fill="#895a37"><path d="M44.16 64.008v-17.56c0-3.383-5.277-6.122-11.79-6.122c-6.514 0-11.796 2.739-11.796 6.122v17.56zM17.641 22.835c0 3.666-2.969 5.671-6.637 5.671s-6.637-2-6.637-5.671c0-3.667 2.969-7.801 6.637-7.801s6.637 4.133 6.637 7.801m28.689 0c0 3.666 2.969 5.671 6.639 5.671c3.666 0 6.638-2 6.638-5.671c0-3.667-2.972-7.801-6.638-7.801c-3.67 0-6.639 4.133-6.639 7.801" /><path d="M58.775 37.672c0 14.669-11.894 22.692-26.559 22.692c-14.673 0-26.564-8.02-26.564-22.692c0-14.667 11.892-31.2 26.564-31.2c14.666 0 26.559 16.535 26.559 31.2" /></g><g fill="#c1976b"><path d="M51.06 44.397c0 10.323-8.368 15.969-18.689 15.969S13.68 54.72 13.68 44.397c0-10.322 8.37-21.956 18.691-21.956S51.06 34.075 51.06 44.397" /><path d="M35.14 31.822c0 6.948-5.633 10.749-12.581 10.749S9.98 38.77 9.98 31.822s5.631-14.78 12.579-14.78c6.947 0 12.581 7.833 12.581 14.78" /><path d="M54.45 31.822c0 6.948-5.637 10.749-12.583 10.749c-6.949 0-12.583-3.801-12.583-10.749s5.633-14.78 12.583-14.78c6.947 0 12.583 7.833 12.583 14.78" /></g><path fill="#774e2b" d="M35.15 42.879c0 1.393-1.18 1.369-2.801 1.369s-3.062.023-3.062-1.369c0-1.401 1.314-2.531 2.938-2.531c1.613 0 2.925 1.129 2.925 2.531" /><path fill="#633f1a" d="M43.65 48.437c0 5.058-5.05 9.154-11.278 9.154c-6.223 0-11.28-4.097-11.28-9.154" /><path fill="#25333a" d="M25.431 29.138c0 2.927-1.949 5.296-4.366 5.296c-2.414 0-4.369-2.369-4.369-5.296c0-2.925 1.955-5.298 4.369-5.298c2.416 0 4.366 2.373 4.366 5.298m21.959 0c0 2.927-1.951 5.296-4.368 5.296c-2.414 0-4.369-2.369-4.369-5.296c0-2.925 1.955-5.298 4.369-5.298c2.417 0 4.368 2.373 4.368 5.298" /><path fill="#7d5233" d="M47.55 63.966c-1.305-15.876-13.12-29.13-13.12-29.13c-1.686-3.084.045-7.518 3.857-9.903c4.93 4.653 6.626-5.499 10.835 2.98c5.771 11.624 13.296 23.25 14.763 36.05H47.55" /><path fill="#deb89c" d="M50.17 24.988c.225-.398-.406-.87-.771-1.249c-.383-1.218-1.361-1.884-2.463-2.501c-.891-.497-4.245-.77-4.47.719a4 4 0 0 1-.277.979c-.275.07-.557.134-.82.242q-.025.011-.045.022c-2.664-1.222-5.674-1.392-8.637-.453c-2.637.835-2.131 2.852-1.014 4.707c.396 1.825 1.577 3.54 3.268 4.086c-.004.013-.014.022-.016.034c-.031.104-.039.207-.066.311c-.645.187-1.229.354-1.637.761c-.375-.021-.741.054-.836.36c-.395 1.277-.434 2.618.245 3.516c-.047.064-.037.139.09.227c.506.351 1 .702 1.512 1.029q.254.213.514.415c.27.711 1.521 1.174 2.092 1.324c3.965 1.046 10.124 2.447 12.735-1.422c.689-1.021 2.027-2.108 2.031-3.409c.297-.248.727-2.63.797-2.975c.115-.564-.439-1.429-.436-1.956c.218-2.259-.567-3.116-1.796-4.767" /><path fill="#633f1a" d="M47.18 20.563c-2.521-1.213-5.462-.749-6.155 1.928c-2.756-1.091-5.699-1.739-8.532-.484c-4.79 2.124-1.838 7.304.948 9.71c-1.622.234-2.821 1.057-2.598 3.141c.35 3.269 3.969 4.822 6.711 5.46c19.413 4.522 17.887-15.783 9.626-19.755m-4.066 18.983c-3.102.121-7.234.063-9.383-2.307c-1.209-1.338-2.385-4.926 1.039-4.865c.184.003 1.254-.184.758-.546c-1.938-1.414-3.372-2.937-3.819-5.353c-.959-5.141 6.372-4.274 9.409-2.92c.277.125 1.449.279 1.488-.24c.328-4.333 5.163-1.823 6.558.508c1.422 2.383 5.117 15.288-6.05 15.723" /><path fill="#7d5233" d="M16.375 63.989c1.305-15.875 13.12-29.13 13.12-29.13c1.688-3.084-.043-7.518-3.856-9.903c-4.93 4.653-6.625-5.499-10.835 2.98C9.033 39.56 1.509 51.186.042 63.986h16.335" /><path fill="#deb89c" d="M13.756 25.012c-.225-.398.406-.87.771-1.249c.385-1.218 1.361-1.884 2.465-2.501c.891-.497 4.244-.77 4.469.719c.053.357.146.667.277.979c.275.07.557.134.821.242c.018.006.029.016.045.022c2.664-1.222 5.674-1.392 8.637-.453c2.637.835 2.131 2.852 1.014 4.707c-.398 1.825-1.576 3.54-3.268 4.086c.002.013.014.022.016.034c.029.104.039.207.066.311c.646.187 1.229.354 1.637.761c.375-.021.74.054.836.36c.395 1.277.434 2.618-.244 3.516c.047.064.035.139-.09.227c-.506.351-1 .702-1.512 1.029q-.256.213-.514.415c-.27.711-1.522 1.174-2.092 1.324c-3.965 1.046-10.125 2.447-12.735-1.422c-.691-1.021-2.027-2.108-2.031-3.409c-.297-.248-.729-2.63-.797-2.975c-.115-.564.438-1.429.438-1.956c-.221-2.259.562-3.115 1.791-4.767" /><path fill="#633f1a" d="M26.37 40.337c2.743-.639 6.362-2.191 6.712-5.46c.223-2.084-.977-2.906-2.598-3.141c2.786-2.406 5.737-7.586.945-9.71c-2.833-1.255-5.774-.607-8.532.484c-.692-2.677-3.635-3.141-6.153-1.928c-8.262 3.972-9.786 24.277 9.626 19.755M14.758 23.842c1.397-2.331 6.231-4.841 6.559-.508c.039.52 1.209.365 1.489.24c3.037-1.354 10.368-2.221 9.411 2.92c-.451 2.417-1.885 3.939-3.823 5.353c-.496.362.577.549.76.546c3.424-.062 2.246 3.527 1.039 4.865c-2.149 2.37-6.282 2.428-9.384 2.307c-11.166-.435-7.471-13.34-6.05-15.723" /></svg>
                            ) : (
                                <svg className="monkey-icon" xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 64 64"><g fill="#895a37"><path d="M14.238 17.905c0 4.059-3.289 6.278-7.35 6.278s-7.35-2.219-7.35-6.278S2.827 9.27 6.888 9.27s7.35 4.577 7.35 8.635m31.748 0c0 4.059 3.291 6.278 7.353 6.278c4.059 0 7.347-2.219 7.347-6.278S57.398 9.27 53.339 9.27c-4.062 0-7.353 4.577-7.353 8.635" /><path d="M59.774 34.21c0 16.239-13.166 25.12-29.403 25.12C14.127 59.33.964 50.448.964 34.21S14.127-.332 30.371-.332c16.237 0 29.403 18.304 29.403 34.542" /></g><g fill="#c1976b"><path d="M51.24 41.651c0 11.427-9.264 17.678-20.692 17.678c-11.426 0-20.692-6.251-20.692-17.678s9.266-24.306 20.692-24.306c11.429 0 20.692 12.881 20.692 24.306" /><path d="M33.604 27.732c0 7.691-6.238 11.899-13.927 11.899c-7.692 0-13.929-4.208-13.929-11.899s6.237-16.362 13.93-16.362c7.688 0 13.926 8.671 13.926 16.362" /><path d="M54.98 27.732c0 7.691-6.236 11.899-13.925 11.899c-7.694 0-13.931-4.208-13.931-11.899S33.361 11.37 41.056 11.37c7.688 0 13.924 8.671 13.924 16.362" /></g><path fill="#774e2b" d="M33.615 35.654c0 1.542-1.31 1.516-3.1 1.516c-1.795 0-3.39.026-3.39-1.516c0-1.552 1.454-2.802 3.249-2.802c1.79 0 3.241 1.251 3.241 2.802" /><path fill="#633f1a" d="M45.38 46.941c0 6.637-6.628 12.01-14.796 12.01s-14.801-5.375-14.801-12.01" /><path fill="#fff" d="M26.07 27.598c0 5.287-2.861 9.572-6.394 9.572s-6.4-4.285-6.4-9.572c0-5.291 2.868-9.575 6.4-9.575s6.394 4.284 6.394 9.575" /><ellipse cx="19.676" cy="27.07" fill="#25333a" rx="4.176" ry="5.063" /><path fill="#fff" d="M47.06 27.598c0 5.287-2.859 9.572-6.396 9.572c-3.527 0-6.392-4.285-6.392-9.572c0-5.291 2.864-9.575 6.392-9.575c3.536 0 6.396 4.284 6.396 9.575" /><path fill="#25333a" d="M44.838 27.07c0 2.797-1.863 5.063-4.176 5.063c-2.306 0-4.179-2.266-4.179-5.063s1.873-5.065 4.179-5.065c2.313 0 4.176 2.269 4.176 5.065" /><g fill="#7d5233"><path d="m27.08 63.875l5.647-10.246c1.731-3.134-.044-7.642-3.957-10.07s-8.485-1.848-10.215 1.285L8.984 62.208c-.285.52-.445 1.084-.542 1.664H27.08" /><path d="m27.12 63.875l4.669-8.472c1.583-2.866-.04-6.984-3.612-9.199c-3.576-2.22-7.754-1.688-9.334 1.175l-8.744 15.863c-.111.201-.17.42-.25.633z" /><path d="m34.08 63.875l-5.647-10.246c-1.731-3.134.044-7.642 3.957-10.07s8.484-1.848 10.215 1.285l9.572 17.364c.285.52.444 1.084.542 1.664H34.08" /><path d="m34.04 63.875l-4.671-8.472c-1.58-2.866.04-6.984 3.614-9.199c3.576-2.22 7.752-1.688 9.335 1.175l8.743 15.863c.111.201.171.42.25.633z" /></g><path fill="#d7ae8a" d="M14.38 45.22c-.312-.412.321-1.04.673-1.521c.243-1.426 1.237-2.324 2.381-3.188c.923-.695 4.646-1.519 5.128.117c.113.393.268.728.462 1.056c.319.037.642.065.958.146c.02.003.035.013.053.018c2.804-1.781 6.155-2.437 9.625-1.842c3.089.531 2.832 2.873 1.863 5.128c-.162 2.109-1.222 4.216-3.037 5.091c.007.014.02.023.025.036c.049.111.075.227.119.338c.753.111 1.435.208 1.956.603c.416-.082.839-.055.994.275c.64 1.373.892 2.87.268 3.983c.062.065.064.15-.068.269c-.512.471-1.014.944-1.536 1.389q-.252.278-.511.545c-.195.839-1.527 1.551-2.145 1.808c-4.289 1.788-10.985 4.312-14.513.37c-.932-1.038-2.6-2.054-2.806-3.513c-.372-.232-1.224-2.839-1.354-3.217c-.214-.615.274-1.67.188-2.263c-.595-2.503.155-3.585 1.277-5.628" /><path fill="#633f1a" d="M30.905 60.48c2.979-1.14 6.8-3.441 6.69-7.165c-.073-2.373-1.545-3.111-3.401-3.123c2.755-3.132 5.27-9.401-.436-11.05c-3.373-.972-6.576.209-9.503 1.859c-1.188-2.898-4.561-2.965-7.206-1.215c-8.66 5.733-7.237 28.759 13.856 20.69M15.327 43.753c1.206-2.831 6.245-6.396 7.281-1.582c.124.577 1.414.224 1.708.04c3.2-1.988 11.293-4.092 11.01 1.826c-.13 2.781-1.505 4.711-3.461 6.598c-.5.483.732.527.937.496c3.835-.598 3.069 3.611 1.918 5.3c-2.047 2.99-6.676 3.694-10.178 4.04c-12.601 1.234-10.443-13.822-9.215-16.715" /><path fill="#deb89c" d="M46.818 44.21c.253-.451-.46-.985-.876-1.415c-.434-1.38-1.54-2.135-2.793-2.834c-1.01-.562-4.807-.872-5.063.814a4.4 4.4 0 0 1-.312 1.109c-.312.079-.631.151-.928.274c-.022.006-.035.018-.053.025c-3.02-1.385-6.429-1.577-9.787-.514c-2.987.946-2.414 3.231-1.148 5.333c.449 2.067 1.786 4.01 3.703 4.63c-.004.015-.016.025-.018.039c-.035.117-.044.234-.075.352c-.73.212-1.392.402-1.854.862c-.425-.024-.839.061-.947.408c-.447 1.447-.491 2.966.277 3.983c-.053.073-.042.157.102.257c.573.396 1.136.795 1.713 1.166c.193.159.388.319.582.47c.306.806 1.724 1.332 2.368 1.5c4.492 1.187 11.473 2.775 14.429-1.611c.784-1.155 2.298-2.388 2.305-3.86c.334-.281.825-2.979.902-3.37c.131-.64-.498-1.619-.493-2.217c.247-2.559-.643-3.53-2.034-5.401" /><path fill="#633f1a" d="M43.43 39.2c-2.854-1.374-6.188-.849-6.971 2.185c-3.125-1.236-6.458-1.97-9.667-.548c-5.429 2.405-2.084 8.274 1.071 11c-1.837.266-3.196 1.197-2.943 3.559c.396 3.703 4.497 5.464 7.604 6.186C54.518 66.704 52.791 43.7 43.43 39.199m-4.603 21.508c-3.517.138-8.2.073-10.634-2.613c-1.37-1.517-2.702-5.582 1.177-5.512c.208.003 1.423-.208.861-.619c-2.196-1.602-3.82-3.327-4.329-6.06c-1.086-5.825 7.219-4.842 10.66-3.309c.316.142 1.641.316 1.687-.272c.37-4.909 5.85-2.064 7.43.576c1.61 2.699 5.797 17.32-6.852 17.813" /></svg>

                            )}
                        </button>
                    </div>
                    <button className="button-form" type="submit">{isLogin ? "Iniciar Sesión" : "Registrarse"}</button>

                    {/* Muestra el mensaje de error dentro del formulario */}
                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                </form>
                <p className="text-form">
                    {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                    <span onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? " Regístrate" : " Inicia sesión"}
                    </span>
                </p>
            </section>

            {/* Popup Modal */}
            {showPopup && (
                <div className="popup">
                    <div className="container-popup">
                        <h3>¡Registro exitoso!</h3>
                        <p>Ahora puedes iniciar sesión con tu cuenta.</p>
                        <button className="close-button" onClick={closePopup}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
}