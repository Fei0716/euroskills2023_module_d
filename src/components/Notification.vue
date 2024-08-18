<script setup>
const props = defineProps(['error']);
</script>

<template>
  <Transition name="notification" >
    <output v-if="props.error" class="position-fixed top-0 end-0 m-1 p-2 alert alert-danger">
      <slot name="message"></slot>
    </output>
  </Transition>
</template>

<style scoped>
 output{
   z-index: 9999;
 }
 .notification-enter-from , .notification-leave-to{
    transform: translateX(100%);
    opacity: 0;
 }
 .notification-enter-active, .notification-leave-active{
   transition: all 0.4s ease;
 }
 .notification-enter-to , .notification-leave-from{
   transform: translateX(0);
   opacity: 1;
 }
</style>