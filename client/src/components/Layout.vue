<script setup lang="ts">
import Navbar from './Navbar.vue';
</script>

<template>
  <div class="flex min-h-screen w-full flex-col">
    <Navbar />
    <slot />
  </div>
</template>
