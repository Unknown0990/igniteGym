import { UserDTO } from "@dtos/UserDTO";
import { ScrollView } from "@gluestack-ui/themed";
import { api } from "@services/api";
import { storageAuthTokenGet, storageAuthTokenRemoval, storageAuthTokenSave } from "@storage/storageAuthToken";
import { storageUserGet, storageUserSave, storageUserSignOut } from "@storage/storageUser";
import { createContext, ReactNode, useEffect, useState } from "react";

export type AuthContextDataProps = {
    user: UserDTO;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>
    updateUserProfile: (userUpdated: UserDTO) => Promise<void>
    loadingUserData: boolean
}

type AuthContextProviderProps = {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)

export function AuthContextProvider({ children }: AuthContextProviderProps){
    const [user, setUser] = useState<UserDTO>({} as UserDTO)
    const [loadingUserData, setLoadingUserData] = useState(true)

    async function userAndTokenUpdate(userData: UserDTO, token: string){
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        setUser(userData)
    }

    async function storageUserAndTokenSave(userData: UserDTO, token: string){
        try {
            setLoadingUserData(true)
            await storageUserSave(userData)
            await storageAuthTokenSave(token)
        } catch (error) {
            throw error            
        }
        finally{
            setLoadingUserData(false)
        }
    }

    async function signIn(email: string, password: string){        
        try {
            const { data } = await api.post('/sessions', { email, password })
    
            if(data.user && data.token){
                await storageUserAndTokenSave(data.user, data.token)
                userAndTokenUpdate(data.user, data.token)
            }
        } 
        catch (error) {
            throw error;
        }
        finally{
            setLoadingUserData(false)
        }
    }

    async function signOut(){
        try {
            setLoadingUserData(true)

            setUser({} as UserDTO)

            await storageUserSignOut()

            await storageAuthTokenRemoval()
        }
        catch (error) {
            throw error    
        }
        finally{
            setLoadingUserData(false)
        }
    }

    async function updateUserProfile(userUpdated: UserDTO){
        try {
            setUser(userUpdated)
            await storageUserSave(userUpdated)
        } 
        catch (error) {
            throw error    
        }
    }

    async function loadUserData(){
        try {
            setLoadingUserData(true)

            const loggedUser = await storageUserGet()
            const token = await storageAuthTokenGet()
    
            if(token && loggedUser){
                userAndTokenUpdate(loggedUser, token)
            }
        } 
        catch(error){
            throw error
        }
        finally{
            setLoadingUserData(false)
        }
    }

    useEffect(() => {
      loadUserData()
    }, [])
    

    return(
        <AuthContext.Provider value={{
            user,
            signIn,
            signOut,
            loadingUserData,
            updateUserProfile
        }}>
        {children}
        </AuthContext.Provider>
    )
}