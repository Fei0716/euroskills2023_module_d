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
const tokenPrompt = ref(null);
const imageUrl = ref(null);
const imageObjects = ref([]);
const imageFile = ref(null);
const imageObjectsRecognized = ref(true);

const modal = ref(null); // Declare modal as a reactive reference
const imageWrapper = ref(null);
const error = ref(null);

//list of methods
function upload(){
  if(imageUrl.value){
    uploadImage();
    return;
  }
  errorStore.error = "Please choose an image first";
  setTimeout(()=>{
    errorStore.error = false;
  } , 4000);
}
function submitImage(e){
  imageFile.value = e.target.files[0];
  if(imageFile.value){
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
        imageUrl.value  = e.target.result;
    };
    fileReader.readAsDataURL(imageFile.value);
  }
}
//async functions
async function uploadImage(){
  try{
    imageObjectsRecognized.value = false;
    let formData = new FormData();
    formData.append('image',  imageFile.value);
    const {data} = await api.post('imagerecognition/recognize' ,formData);
    setTimeout(()=>{
      imageObjects.value = data.objects;
      imageObjectsRecognized.value = true;
    }, 3000);
  }catch(e){
    console.error(e);
  }
}
//lifecycle hook
onMounted(()=>{
  // eslint-disable-next-line no-undef
  modal.value =  new Modal(tokenPrompt.value.modalPrompt );

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
    <h2 class="text-center typing" :style="{'--character-count': 'MindReader'.length}">MindReader</h2>
    <small class=" text-center text-dark-emphasis mb-4 d-block">The MindReader service is a mind reader. The user can upload an image and the service will recognize the objects in the image.</small>
    <!--    the chat section-->
    <Transition name="main-content" appear mode="out-in">
      <div class="text-bg-dark p-2 pt-3 rounded-2 position-relative  shadow-lg" id="image-wrapper" >
        <output class="text-center" v-if="imageObjects.length > 0">
          {{imageObjects.length}} Objects Recognized
        </output>
        <div id="image-output" ref="imageWrapper">
          <div v-for="(o, i) in imageObjects" :key="i" :data-label="o.label" class="object" :style="{
          top: `${o.bounding_box.top}px`,
          left: `${o.bounding_box.left}px`,
          width: `${o.bounding_box.right}px`,
          height: `${o.bounding_box.bottom}px`,
        }">
          </div>
          <img v-if="imageUrl" class="d-block mx-auto img-fluid img-thumbnail mb-2" :src="imageUrl" alt="Generated Image">
          <div v-else id="image-placeholder" class="d-block mx-auto mb-2"></div>
        </div>
        <div id="image-input" class="bottom-0 start-0 w-100 py-2 d-flex gap-1" >
          <input v-if="imageObjectsRecognized" type="file" accept=".png,.jpeg,.jpg" name="image" id="image" class="form-control" @change="submitImage" placeholder>
          <div v-else class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated bg-dark " role="progressbar"  aria-valuemin="0" aria-valuemax="100" style="width: 55%">55%</div>
          </div>
          <button class="btn btn-light" :class="{'disabled': tokenStore.token === null || !imageObjectsRecognized}"  @click="upload">Upload</button>
        </div>
      </div>

    </Transition>
  </section>

  <Notification :error="errorStore.error" >
    <template v-slot:message>
        {{errorStore.error}}
    </template>
  </Notification>

  <!--  include Token Prompt component-->
  <TokenPrompt ref="tokenPrompt" @closePrompt="closePrompt"></TokenPrompt>
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
  margin: 0 auto;
}
#image-output{
  position: relative;
  height: fit-content;
  overflow: hidden;
}
#image-output img{
  min-height: 500px;
  width: 100%;
}
#image-placeholder::before{
  content: "Upload an image to detect the objects in the image";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: black;
  font-size: 2rem;
  width: 60%;
}
#image-placeholder{
  position: relative;
  background-color: #dadada;
  min-height: 500px;
  width: 100%;
}
.progress{
  height: 43px;
  width: 100%;
}
.object{
  position: absolute;
  border: 2px solid red;
  background-color: transparent;
}
.object::before{
  position: absolute;
  left:0;
  content: attr(data-label);
  font-size: 2rem;
  -webkit-text-stroke-width: 1px;
  -webkit-text-stroke-color: black
}
</style>