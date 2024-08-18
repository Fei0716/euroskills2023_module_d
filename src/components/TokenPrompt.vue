<script setup>
  import {ref} from 'vue';
  import api from '../api';
  import Notification from '@/components/Notification.vue'
  import useTokenStore from '@/stores/token.js'

  const tokenStore = useTokenStore();
  const token = ref(null);
  const modalPrompt =  ref(null);
  const error = ref(false);

  //to expose template refs back to parent
  defineExpose({
    modalPrompt
  })
  //to difine emits
  const emits = defineEmits(['closePrompt']);
  async function checkTokenValidity(){
    try{
      await api.get('test');
      //if valid close the goddamn prompt dialog
      //emit closeprompt event back to parent
      emits('closePrompt');
    }catch(e){
      error.value = true;
      setTimeout(()=>{
        error.value = false;
      } , 4000);
      console.error(e);
    }
  }
  function submit(){
    if(token.value){
      //set the token
      tokenStore.token = token.value;
      checkTokenValidity();
    }
  }
</script>

<template>
  <div class="modal fade" ref="modalPrompt">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
          <div class="modal-body">
            <form action="" @submit.prevent="submit">
              <div class="mb-3">
                <label class="text-dark-emphasis h5" for="token">Please enter your API Token:</label>
                <input type="text" name="token" id="token" v-model="token" class="form-control" required>
              </div>
              <div>
                <button class="btn btn-dark d-block mx-auto" @click="submit">Submit</button>
              </div>
            </form>
          </div>
      </div>
    </div>
  </div>


  <Notification :error="error" >
    <template v-slot:message>
      Invalid token
    </template>
  </Notification>
</template>

<style scoped>

</style>