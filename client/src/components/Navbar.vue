<script setup lang="ts">
import { Video } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';

defineProps<{
  currentSection: string;
}>();
</script>

<template>
  <div class="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-6">
    <nav class="gap-6 text-sm font-medium flex flex-row items-center">
      <RouterLink to="/" class="flex items-center gap-2 font-semibold text-base">
        <Video class="size-6" />
        <span class="sr-only">Telehealth</span>
      </RouterLink>
      <RouterLink
        to="/"
        :class="{
          'text-foreground': currentSection === 'home',
          'text-muted-foreground': currentSection !== 'home'
        }"
        class="transition-colors hover:text-foreground">
        Home
      </RouterLink>
      <RouterLink
        to="/about"
        :class="{
          'text-foreground': currentSection === 'about',
          'text-muted-foreground': currentSection !== 'about'
        }"
        class="transition-colors hover:text-foreground">
        About
      </RouterLink>
      <RouterLink
        to="/contact"
        :class="{
          'text-foreground': currentSection === 'contact',
          'text-muted-foreground': currentSection !== 'contact'
        }"
        class="transition-colors hover:text-foreground">
        Contact
      </RouterLink>
    </nav>
  </div>
</template>
