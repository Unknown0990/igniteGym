import { StatusBar } from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold
} from '@expo-google-fonts/inter'

import { Center, GluestackUIProvider, Text } from '@gluestack-ui/themed';
import { config } from './config/gluestack-ui.config';
import { Loading } from '@components/Loading';
import { SignIn } from '@screens/SignIn';

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_700Bold})

  return (
    <GluestackUIProvider config={config}>
        <StatusBar barStyle='dark-content' backgroundColor='transparent' translucent/>
        {fontsLoaded ?
          <SignIn/>
          : 
          <Loading/>
        }
    </GluestackUIProvider>
  );
}
