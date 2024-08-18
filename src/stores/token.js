import {defineStore} from 'pinia'
import { ref, watchEffect } from 'vue'

const useTokenStore = defineStore('token' ,()=>{
  //states
  const token = ref(JSON.parse(localStorage.getItem('token')) !== undefined ? JSON.parse(localStorage.getItem('token')) : null);

  watchEffect(()=>{
    localStorage.setItem('token',JSON.stringify(token.value));
  });
  //actions

  //getters


  return{
    token,
  }
});

export default useTokenStore;


