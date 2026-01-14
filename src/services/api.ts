import { storageAuthTokenGet, storageAuthTokenSave } from '@storage/storageAuthToken'
import { AppError } from '@utils/AppError'
import axios, { AxiosError, AxiosInstance } from 'axios'

type SignOut = () => void

type PromiseType = {
    onSuccess: (token: string) => void;
    onFailure: (error: AxiosError) => void
}

type APIInstanceProps = AxiosInstance & {
    registerInterceptTokenManager: (signOut: SignOut) => () => void
}

const api = axios.create({
    baseURL: 'http://192.168.1.14:3333',
    timeout: 2000
}) as APIInstanceProps

let failedQueue: PromiseType[] = []
let refreshing = false

api.registerInterceptTokenManager = signOut => {
    const interceptTokenManager = api.interceptors.request.use(response => response, async (requestError) => {
        if(requestError?.response?.status === 401){
            if(requestError.response?.data?.message === 'token.expired' || requestError.response?.data?.message === 'token.invalid'){
                const { refresh_token } = await storageAuthTokenGet()

                if(!refresh_token){
                    signOut()

                    return Promise.reject(requestError)
                }

                const originalRequestConfig = requestError.config

                if(refreshing){
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            onSuccess: (token: string) => {
                                originalRequestConfig.headers = { 'Authorization': `Bearer ${token}`}

                                resolve(api(originalRequestConfig))
                            },
                            onFailure: (error: AxiosError) => {
                                reject(error)
                            },
                        })
                    })
                }

                refreshing = true

                return new Promise(async(resolve, reject)=>{
                    try {
                        const { data } = await api.post('/sessions/refresh-token', { refresh_token })

                        console.log(data)

                        await storageAuthTokenSave({ token: data.token, refresh_token: data.refresh_token})
                    } 
                    catch (error: any) {
                        failedQueue.forEach(request => {
                            request.onFailure(error)
                        })

                        signOut()
                        reject(error)
                    }
                    finally{
                        refreshing = false
                        failedQueue = []
                    }
                })
            }

            signOut()
        }

        
        if(requestError.response && requestError.response.data){
            return Promise.reject(new AppError(requestError.response.data.message))
        }
        else{
            return Promise.reject(requestError)
        }
    })

    return () => {
        api.interceptors.response.eject(interceptTokenManager);
    }
}

export { api }