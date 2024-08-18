<script setup>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
</script>

<template>
  <Header></Header>
<!--  main content of the page-->
  <main role="main" class="m-5">
    <RouterView />
  </main>
</template>

<style scoped>

</style>
