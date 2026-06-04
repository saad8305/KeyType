import {createContext,useContext,useState,useEffect} from 'react';

const ThemeContext=createContext();
export function ThemeProvider({children}){
  const [darkMode,setDarkMode]=useState(()=>{
    const saved=localStorage.getItem('darkMode');
    return saved!==null?saved==='true':true;
  });
  useEffect(()=>{
    localStorage.setItem('darkMode', darkMode);
    if(darkMode){
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    }
    else{
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  },[darkMode]);
  return(
    <ThemeContext.Provider value={{darkMode,setDarkMode}}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme(){return useContext(ThemeContext);}