import {create} from 'zustand';

const useGameStore=create((set,get)=>({
  currentText:null,userInput:'',startTime:null,isPlaying:false,
  wpm:0,accuracy:100,errors:0,totalChars:0,
  setCurrentText:(text)=>set({currentText:text}),
  setUserInput:(input)=>set({userInput:input}),
  startGame:()=>set({ 
    isPlaying:true,startTime:Date.now(),userInput:'',
    wpm:0,accuracy:100,errors:0,totalChars:0
  }),
  endGame:()=>set({isPlaying:false}),
  updateStats:(stats)=>set(stats),
  resetGame:()=>set({
    userInput:'',startTime:null,isPlaying:false,
    wpm:0,accuracy:100,errors:0,totalChars:0}),
}));
export default useGameStore;