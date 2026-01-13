import { NavigationContainer, DefaultTheme } from '@react-navigation/native'
import { AuthRoutes } from './auth.routes'
import { Box } from '@gluestack-ui/themed'
import { gluestackUIConfig } from '../../config/gluestack-ui.config'
import { useAuth } from '@hooks/useAuth'
import { AppRoutes } from './app.routes'
import { Loading } from '@components/Loading'

export function Routes(){
    const theme = DefaultTheme
    theme.colors.background = gluestackUIConfig.tokens.colors.gray700

    const { user, loadingUserData } = useAuth()

    if(loadingUserData){
        return <Loading/>
    }

    return(
        <Box flex={1} bg='$gray700'>
            <NavigationContainer theme={theme}>
                {user.id ? <AppRoutes/> : <AuthRoutes/>}
            </NavigationContainer>
        </Box>
    )
}