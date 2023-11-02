<template>
  <div id="app-wrapper">
    <AppHeader title="My App" />
    <RouterView />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import AppHeader from "./components/AppHeader.vue";
</script>
