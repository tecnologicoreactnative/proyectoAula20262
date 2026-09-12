import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContextoProvider } from './contextos/AuthContexto';
import NavegacionStack from './navegacion/NavegacionStack';

export default function App() {
	return (
		<AuthContextoProvider>
			<NavigationContainer>
				<NavegacionStack />
			</NavigationContainer>
		</AuthContextoProvider>
	);
}
