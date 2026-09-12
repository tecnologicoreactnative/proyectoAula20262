// Tabs = barra inferior
// Son independientes y el usuario salta entre ellas en un toque (RF-UX-01)

import {createBottomTabNavigator}
from "@react-navigation/bottom-tabs";
import {Ionicons} from "@expo/vector-icons"; // Viene incluido con expo

import MovimientosScreen from "../screens/movementsScreen";
import CategoriasScreen from "../screens/category/categoryScreen";
import MetasScreen from "../screens/goalsScreen";
import PerfilScreen from "../screens/profileScreen";

const Tab = createBottomTabNavigator ();

// Icono de cada pestaña, mapeado por el nombre de la pantalla
//Fuera del componente para no recrear el objeto en cada render

const iconos = {
    Movimientos: "wallet-outline",
    Categorias: "pricetags-outline",
    Metas: "flag-outline",
    Perfil: "person-outline",
};

export default function AppTabs(){
    return(
        <Tab.Navigator
        // Funcion en vez de objeto, asi se recibe "route" y sabemos
        // que pestaña se esta dinujando
        screenOptions = {({route}) => ({
            //Color y size los inyecta React Navigation segun si esta activa
            tabBarIcon: ({color,size}) => (
                <Ionicons
                name = {iconos[route.name]} size = {size} color = {color} />
            ),
            tabBarActiveTintColor: "#2563eb",
        })}
        >
        {/* Movimiento va primero: es la accion mas frecuente y la que responde al P-01 
            (registro abandonado por friccion) */}
            <Tab.Screen name = "Movimientos" component = {MovimientosScreen} />
            <Tab.Screen name = "Categorias" component = {CategoriasScreen} />
            <Tab.Screen name = "Metas" component = {MetasScreen} />
            <Tab.Screen name = "Perfil" component = {PerfilScreen} />
            </Tab.Navigator>            
    );
}