import {auth} //servicio de autenticación (registro, login, logout)
    from '../config/firebaseConfig';
import {createContext, //crea el "canal" por donde viajan los datos compartidos
    useContext, //lee ese canal desde cualquier componente que esté dentro
    useEffect, //ejecuta código en momentos del ciclo de vida del componente
    useState} //guarda datos que, al cambiar, vuelven a dibujar la pantalla
    from 'react';
import {onAuthStateChanged} //detecta cada cambio en la sesión del usuario (login, logout)
    from 'firebase/auth';
 
// Un Context permite compartir datos entre componentes sin pasarlos por props
const AuthContext = createContext();
 
export function AuthProvider({children}) {
    //"children" es todo lo que quede dentro de <AuthProvider>...</AuthProvider>
    const [user, setUser] = useState(null);
    // Usuario actual: objeto de Firebase si hay sesión, null si no
    const [loading, setLoading] = useState(true);
    // Sin este estado veríamos la pantalla de login parpadear antes de entrar
 
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
                // onAuthStateChanged es un LISTENER: no lo llamamos nosotros, Firebase nos  avisa
                //Se dispara al iniciar sesión y al cerrarla
            setUser(user);  // el objeto del usuario, o null
            setLoading(false);  // ya sabemos si hay sesión o no
        });
        return unsubscribe;
            // se ejecuta al desmontar el componente.
            // desconecta el listener; sin esto quedaría escuchando y habría fugas de memoria
    }, []); // [] = se ejecuta una sola vez, al montar
    return (
        <AuthContext.Provider value={{user, loading}}>
            {children}
        </AuthContext.Provider>
    );
}
 
export function useAuth() {
    // Hook propio para no repetir useContext(AuthContext) en cada pantalla
    return useContext(AuthContext);
}
 
