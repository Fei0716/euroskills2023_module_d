<script setup>

const services = [
  {
    id: 1,
    name: 'ChatterBlast',
    slug: 'chatterblast',
    desc: 'The ChatterBlast service is a chatbot. The user can enter a message and the chatbot will respond with a message.'
  },
  {
    id: 2,
    name: 'DreamWeaver',
    slug: 'dreamweaver',
    desc: 'The DreamWeaver service is an image generator. The user can enter a text and the service will generate a new image.'
  },
  {
    id: 3,
    name: 'MindReader',
    slug: 'mindreader',
    desc: 'The MindReader service is a mind reader. The user can upload an image and the service will recognize the objects in the image.'
  }
];



</script>

<template>
  <section aria-label="List of services available" class="container">
      <h2 class="text-center">List of AI Services</h2>
      <small class=" text-center text-dark-emphasis mb-4 d-block">State of the art and most advanced Services powered by our Artifical Intelligence Models</small>

      <TransitionGroup name="slide" appear mode="out-in">
          <article v-for="(s , i) of services.sort(a,b => a.name - b.name)"  :key="s.id" class="card shadow-sm mb-2 border border-dark border-1" :style="{
            'transition-delay': i * 0.4  + 's',
          }">
                <div class="card-header bg-dark">
                  <h3>
                    <RouterLink :to="s.slug" class="text-white">{{s.name}}</RouterLink>
                  </h3>
                </div>
                <div class="card-body">
                  <p class="text-dark-emphasis">{{s.desc}}</p>
                </div>
          </article>
      </TransitionGroup>
  </section>
</template>

<style scoped>
:root{
  --delay: 0;
}
.slide-enter-from, .slide-leave-to{
  transform: translateX(-100%);
  opacity: 0;
}
.slide-enter-active, .slide-leave-active{
  transition: all 0.8s ease ;
}
.slide-enter-to, .slide-leave-from{
  transform: translateX(0);
  opacity: 1;
}
</style>