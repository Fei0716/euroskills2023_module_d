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
const chat = ref(null);
const tokenPrompt = ref(null);
const conversationId= ref(null);
const conversationIsFinal= ref(true);
const conversationList = ref([]);
const modal = ref(null); // Declare modal as a reactive reference
const chatWrapper = ref(null);

let polling = null;


//list of methods
function send(){
  chat.value = chat.value?.trim();
  if(chat.value){
    continueConversation()
    //push the prompt
    conversationList.value.push({
      'data': chat.value,
      'by' : 'user',
    });
    chat.value = null;
    return;
  }

  errorStore.error = 'Dont leave the input field empty';
  setTimeout(()=>{
    errorStore.error = null;
  } , 5000);
}
function createConversation(){
  chat.value = chat.value?.trim();
  if(chat.value){
    createNewConversation()
    //push the prompt
    conversationList.value.push({
      'data': chat.value,
      'by' : 'user',
    });
    chat.value = null;
    return;
  }

  errorStore.error = 'Dont leave the input field empty';
  setTimeout(()=>{
    errorStore.error = null;
  } , 5000);
}
function clear(){
  chat.value = null;
}
function closePrompt(){
  modal.value.hide();
}
//async functions
async function createNewConversation(){
  try{
    const {data} = await api.post('chat/conversation' ,{
      "prompt": chat.value,
    })

    //push the response from the ai bot
    conversationId.value = data.conversation_id;
    conversationIsFinal.value = data.is_final;
    conversationList.value.push({
      'data': data.response,
      'by' : 'ai',
    });

    //call get conversation
    await getConversation();
    //1second polling
    polling = setInterval(async ()=>{
      await getConversation();
    } , 1000);
  }catch(e){
    console.error(e);
  }
}

async function getConversation(){
  try{
    const {data} = await api.get(`chat/conversation/${conversationId.value}`)
    //is not final then append the response
    conversationList.value[conversationList.value.length - 1].data = data.response
    conversationIsFinal.value = data.is_final;
    //if the response is final stop polling
    if(conversationIsFinal.value){
      clearInterval(polling);
      chatWrapper.value.scrollTop = chatWrapper.value.scrollHeight + 18 ;
    }
    chatWrapper.value.scrollTop = chatWrapper.value.scrollHeight+ 18 ;
  }catch(e){
    console.error(e);
  }
}
async function continueConversation(){
  try{
    const {data} = await api.put(`chat/conversation/${conversationId.value}` ,{
      "prompt": chat.value,
    })

    //push the response from the ai bot
    conversationId.value = data.conversation_id;
    conversationIsFinal.value = data.is_final;
    conversationList.value.push({
      'data': data.response,
      'by' : 'ai',
    });

    //call get conversation
    await getConversation();
    //1second polling
    polling = setInterval(async ()=>{
      await getConversation();
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
    <h2 class="text-center typing" :style="{'--character-count': 'ChatterBlast'.length}">ChatterBlast</h2>
    <small class=" text-center text-dark-emphasis mb-4 d-block">The ChatterBlast service is a chatbot. The user can enter a message and the chatbot will respond with a message.</small>
<!--    the chat section-->
    <Transition name="main-content" appear mode="out-in">
      <div class="text-bg-dark p-2 pt-3 ps-3 rounded-2 position-relative  shadow-lg" id="chat-wrapper" >
        <div id="chat-output" class="overflow-y-auto" ref="chatWrapper">
<!--            load out list of conversation prompts and response from the ai bot-->
          <template v-for="(c , index) of conversationList">
<!--          ai response-->
            <article v-if="c.by ==='ai'" :key="'ai'+index" class="chat chat-ai p-2 bg-white text-dark rounded-2 mb-2 col-6"  :style="{'--character-count': c.data.length}">
              <strong class="d-block">ChatterBlast AI</strong>
              <p class="typewriter big-caret">{{c.data}}</p>
            </article>
<!--         user prompt-->
            <article v-else  class="chat p-2 bg-dark-subtle text-dark rounded-2  mb-2 col-6 ms-auto" :style="{'--character-count': c.data.length}" :key="'user'+index">
              <strong class="d-block">You</strong>
              <p class="typewriter big-caret">{{c.data}}</p>
            </article>
          </template>
        </div>
        <div id="chat-input" class="position-absolute bottom-0 start-0 w-100 p-2 d-flex gap-1">
          <input type="text" name="chat" id="chat" class="form-control" placeholder="Enter prompt here..."  v-model="chat">
          <button class="btn btn-outline-light" :class="{'disabled': tokenStore.token === null}"  @click="clear">Clear</button>

          <button v-if="conversationList.length > 0" class="btn btn-light" :class="{'disabled': tokenStore.token === null || !conversationIsFinal}"  @click="send" >Send</button>

          <button v-else class="btn btn-light text-nowrap" :class="{'disabled': tokenStore.token === null  || !conversationIsFinal}"  @click="createConversation" >New Conversation</button>
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
  :root{
    --typing-duration: 2;
    --character-count: 16;
  }
  #chat-wrapper{
    height: 500px;
    max-width: min(100%, 800px);
    margin: 0 auto;
    overflow: hidden;
  }
  #chat-output{
    height: 430px !important;
    padding-right: 0.5rem;
    overflow-x: hidden ;
  }
  #chat-output::-webkit-scrollbar{
    width: 10px;
    background: transparent;
  }
  #chat-output::-webkit-scrollbar-thumb{
    background-color: #f6f6f6;
    border-radius: 2rem;
  }
  article > p , .typing{
    white-space: normal;
    width: auto;
    border-right: 4px solid transparent;
    overflow: hidden;
  }

  .typing{
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
  /*typewriter effect from internet*/
  @keyframes grow {
    0% { max-height: var(--lineHeight); }
    100% { max-height: calc(var(--lineHeight) * var(--lines)); }
  }

  @keyframes carriageReturn {
    0% { top: 0; }
    100% { top: calc(var(--lineHeight) * var(--lines)); }
  }

  @keyframes type {
    0% { width: 100%; }
    100% { width: 0%; }
  }

  @keyframes caret {
    0% { color: var(--bgColor); }
    100% { color: black; }
  }

  .typewriter {
    --bgColor: #ced4da;
    --lines: 500;
    --lineHeight: 1.5rem;
    --timePerLine: 2s;
    --widthCh: 38;
    --width: calc(var(--widthCh) * 1ch);
    /* do not touch the time property!!! */
    --time: calc(var(--lines) * var(--timePerLine));
    animation: grow var(--time) steps(var(--lines));
    animation-fill-mode: forwards;
    background: transparent;
    line-height: var(--lineHeight);
    max-height: var(--lineHeight);
    overflow: hidden;
    position: relative;
    width: var(--width);
    /* word-break: break-all; */
  }
  :is(.chat-ai) > .typewriter::before{
    background: white;
  }
  .typewriter::before {
    content: "";
    animation:
      type var(--timePerLine) linear infinite,
      carriageReturn var(--time) steps(var(--lines)) var(--lines),
      caret 0.5s steps(2) infinite;
    background: var(--bgColor);
    border-left: 2px solid;
    bottom: 0;
    height: 2rem;
    position: absolute;
    right: 0;
    width: 100%;
  }
  .typewriter.big-caret::before {
    border-left-width: 4px;
  }

</style>