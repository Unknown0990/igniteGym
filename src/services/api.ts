import { AppError } from '@utils/AppError'
import axios from 'axios'

const api = axios.create({
    baseURL: 'http://192.168.1.14:3333',
    timeout: 2000
})

api.interceptors.request.use(response => response, error => {
    if(error.response && error.response.data){
        return Promise.reject(new AppError(error.response.data.message))
    }
    else{
        return Promise.reject(error)
    }
})

export { api }