import {create} from 'zustand';
import {persist} from 'zustand/middleware';

const useAuthStore=create(persist((set,get)=>({
      user:null,token:null,isAuthenticated:false,
      setAuth:(user,token)=>{
        set({user,token,isAuthenticated:true});
        localStorage.setItem('token',token);
        localStorage.setItem('user',JSON.stringify(user));},
      
      logout:()=>{
        set({user:null,token:null,isAuthenticated:false});
        localStorage.removeItem('token');
        localStorage.removeItem('user');},
      updateUser:(user)=>set({user}),
    }),
    {name:'auth-storage',}));
export default useAuthStore;