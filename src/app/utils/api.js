const baseUrl = 'http://localhost:3000'
import { useAuthStore } from "../store/authStore"
export async function apiRequest(method,endPoint,bodyData){
    const token = localStorage.getItem('token')
    const options = {
        method,
        headers:{'Content-type':'application/json'},
        credentials: 'include'
    }
    if(bodyData){
        options.body = JSON.stringify(bodyData)
    }
    if(token){
        options.headers.authorization = `Bearer ${token}`
    }
    const response = await fetch(baseUrl+endPoint,options)
    let data;
    try {
        data = await response.json()
    } catch (error) {
        data = {}
    }
    
    if(!response.ok){
        throw new Error(data.message)
    }
    return data
}