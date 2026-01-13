import { StatusBar } from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold
} from '@expo-google-fonts/inter'

import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from './config/gluestack-ui.config';

import { Routes } from '@routes/index';
import { Loading } from '@components/Loading';
import { AuthContextProvider } from '@contexts/AuthContext';

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold})

  return (
    <GluestackUIProvider config={config}>
        <StatusBar barStyle='light-content' backgroundColor='transparent' translucent/>

        <AuthContextProvider>
        {fontsLoaded ? <Routes/> : <Loading/>}
        </AuthContextProvider>
    </GluestackUIProvider>
  );
}
