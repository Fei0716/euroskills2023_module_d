<script setup>
import {ref,onMounted} from 'vue'
import useTokenStore from '@/stores/token.js'
import useErrorStore from '@/stores/error.js'
import TokenPrompt from '@/components/TokenPrompt.vue'
import Notification from '@/components/Notification.vue'
import api from '../api';
import { Modal } from 'bootstrap';

//states
const tokenStore = useTokenStore();
const errorStore = useErrorStore();
const text = ref(null);
const tokenPrompt = ref(null);
const jobId= ref(null);
const imageIsFinal= ref(true);
const imageProgress = ref(0);
const imageUrl = ref(null);
const imageResourceId = ref(null);

const modal = ref(null); // Declare modal as a reactive reference
const imageWrapper = ref(null);


let polling = null;
//list of methods
function generate(){
  text.value = text.value?.trim();
  if(text.value){
    generateImage();
    text.value = null;
    return;
  }

  errorStore.error = 'Dont leave the input field empty';
  setTimeout(()=>{
    errorStore.error = null;
  } , 5000);
}

function clear(){
  text.value = null;
}
function closePrompt(){
  modal.value.hide();
}

function download(){
  let a = document.createElement('a');
  a.href = 'http://192.168.10.2/euroskills2023_module_c/public/' + imageUrl.value;
  a.download = 'ai-generated-image.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
//async functions
async function generateImage(){
  try{
    const {data} = await api.post('imagegeneration/generate' ,{
      "text_prompt": text.value,
    })
    jobId.value = data.job_id;
    imageIsFinal.value = false;
    imageProgress.value = 1;
    // //call get conversation
    await getStatus();
    //1second polling
    polling = setInterval(async ()=>{
      await getStatus();
    } , 1000);
  }catch(e){
    console.error(e);
  }
}

async function getStatus(){
  try{
    const {data} = await api.get(`imagegeneration/status/${jobId.value}`);
    imageProgress.value = data.progress <= 0 ? 1 : data.progress;
    imageUrl.value = data.image_url;

    if(data.status === 'finished'){
      //if the finalised
      //get the final result of the image
      //remove polling
      clearInterval(polling);
      await getResult();

    }

  }catch(e){
    console.error(e);
  }
}

async function getResult(){
  try{
    const {data} = await api.get(`imagegeneration/result/${jobId.value}`);
    imageResourceId.value = data.resource_id;
    imageUrl.value = data.image_url;
    imageIsFinal.value = true;
  }catch(e){
    console.error(e);
  }
}

async function upscale(){
  try{
    const {data} = await api.post(`imagegeneration/upscale` ,{
      "resource_id" : imageResourceId.value,
    });
    jobId.value = data.job_id;
    imageIsFinal.value = false;

    // //call get conversation
    await getStatus();
    //1second polling
    polling = setInterval(async ()=>{
      await getStatus();
    } , 1000);

  }catch(e){
    console.error(e);
  }
}

async function zoomIn(){
  try{
    const {data} = await api.post(`imagegeneration/zoom/in` ,{
      "resource_id" : imageResourceId.value,
    });
    jobId.value = data.job_id;
    imageIsFinal.value = false;

    // //call get conversation
    await getStatus();
    //1second polling
    polling = setInterval(async ()=>{
      await getStatus();
    } , 1000);

  }catch(e){
    console.error(e);
  }
}
async function zoomOut(){
  try{
    const {data} = await api.post(`imagegeneration/zoom/out` ,{
      "resource_id" : imageResourceId.value,
    });
    jobId.value = data.job_id;
    imageIsFinal.value = false;

    // //call get conversation
    await getStatus();
    //1second polling
    polling = setInterval(async ()=>{
      await getStatus();
    } , 1000);

  }catch(e){
    console.error(e);
  }
}
//lifecycle hook
onMounted(()=>{
  // eslint-disable-next-line no-undef
  modal.value =  new Modal(tokenPrompt.value.modalPrompt);

  //display prompt for user to enter api token if token is null
  if(!tokenStore.token){
    //display token prompt here
    // eslint-disable-next-line no-undef
    modal.value.show();
  }
});
</script>

<template>

  <section aria-label="chat bot section" class="container">
    <h2 class="text-center typing" :style="{'--character-count': 'ChatterBlast'.length}">DreamWeaver</h2>
    <small class=" text-center text-dark-emphasis mb-4 d-block">The DreamWeaver service is an image generator. The user can enter a text and the service will generate a new image.</small>
    <!--    the image section-->
    <Transition name="main-content" appear mode="out-in">
      <div class="text-bg-dark p-2 pt-3 rounded-2 position-relative  shadow-lg" id="image-wrapper" >
      <div id="image-output" ref="imageWrapper">

        <img v-if="imageUrl" class="d-block mx-auto img-fluid img-thumbnail mb-2" :src="'http://192.168.10.2/euroskills2023_module_c/public/' +imageUrl" alt="Generated Image">
        <div v-else id="image-placeholder" class="d-block mx-auto mb-2"></div>
        <div id="image-controls" class="d-flex justify-content-center align-items-center gap-2" v-if="imageUrl">
<!--          <button class="btn btn-light"><a :href="'http://192.168.10.2/euroskills2023_module_c/public/' + imageUrl" download="image.png" class="text-decoration-none text-dark">-->
<!--            Download </a> </button>-->
          <button class="btn btn-light" @click="download">Download</button>
                      <button class="btn btn-outline-light" v-if="imageResourceId" @click="upscale">Upscale 2x</button>
                      <button class="btn btn-light"  v-if="imageResourceId"  @click="zoomIn">Zoom In</button>
                      <button class="btn btn-outline-light"  v-if="imageResourceId"  @click="zoomOut">Zoom Out</button>
                    </div>
                  </div>
                  <div id="image-input" class="bottom-0 start-0 w-100 py-2 d-flex gap-1" >
                    <input v-if="imageProgress >= 100 || imageProgress <=0" type="text" name="text" id="text" class="form-control" placeholder="Enter prompt here..."  v-model="text">
                    <div v-else class="progress">
                      <div class="progress-bar progress-bar-striped progress-bar-animated bg-dark " role="progressbar"  aria-valuemin="0" aria-valuemax="100" :style="{'width':imageProgress  + '%'}">{{imageProgress}}%</div>
                    </div>
                    <button class="btn btn-outline-light" :class="{'disabled': tokenStore.token === null}"  @click="clear">Clear</button>
                    <button class="btn btn-light" :class="{'disabled': tokenStore.token === null || !imageIsFinal}"  @click="generate" >Generate</button>
                  </div>
                </div>
    </Transition>
    </section>
              <!--  include Token Prompt component-->
  <TokenPrompt ref="tokenPrompt" @closePrompt="closePrompt"></TokenPrompt>
  <!--  notification for error handling-->
  <Notification :error="errorStore.error">
    <template v-slot:message>
      {{errorStore.error}}
    </template>
  </Notification>
</template>

<style scoped>
.typing{
  white-space: normal;
  width: auto;
  border-right: 4px solid transparent;
  overflow: hidden;
  animation: cursorBlinking  0.5s var(--character-count), typewriting calc(var(--character-count) * 0.15s) steps(var(--character-count)) forwards ;
}
h2.typing{
  text-align: center;
  margin: .5rem auto;
}
@keyframes typewriting{
  from{
    width: 0;
  }
  to{
    width: min(calc((var(--character-count) * 1ch)) ,100% );
  }
}
@keyframes cursorBlinking{
  50%{
    border-color: black;
  }
}
#image-wrapper{
  max-width: min(100%, 800px);
  margin: 0 auto;
}
#image-output{
  height: fit-content;
}
#image-output img{
  min-height: 500px;
}
#image-placeholder::before{
  content: "Enter a prompt to generate an image";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: black;
  font-size: 2rem;
  white-space: nowrap;
}
#image-placeholder{
  position: relative;
  background-color: #dadada;
  min-height: 500px;
}
.progress{
  height: 43px;
  width: 100%;
}
</style>