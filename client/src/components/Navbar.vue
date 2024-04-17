<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  currentSection: string;
}>();
</script>

<template>
  <div class="container mx-auto px-5">
    <nav class="flex space-x-10 font-medium justify-between py-12 items-center">
      <div>
        <RouterLink to="/"><img src="../assets/cigna.png" alt="Site Logo" /></RouterLink>
      </div>
      <div class="space-x-10">
        <RouterLink
          to="/"
          :class="{
            'text-foreground': currentSection === 'home',
            'text-muted-foreground': currentSection !== 'home'
          }"
          class="uppercase transition-colors hover:text-foreground">
          Home
        </RouterLink>
        <RouterLink
          to="/about"
          :class="{
            'text-foreground': currentSection === 'about',
            'text-muted-foreground': currentSection !== 'about'
          }"
          class="uppercase transition-colors hover:text-foreground">
          About
        </RouterLink>
        <RouterLink
          to="/contact"
          :class="{
            'text-foreground': currentSection === 'contact',
            'text-muted-foreground': currentSection !== 'contact'
          }"
          class="uppercase transition-colors hover:text-foreground">
          Contact
        </RouterLink>
      </div>
    </nav>
  </div>
</template>
