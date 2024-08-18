import {defineStore} from 'pinia'
import {ref} from 'vue'

const useErrorStore = defineStore('error',()=>{
  const error = ref(null);

  return{
    error,
  }
});

export default useErrorStore;