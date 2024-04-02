<script setup lang="ts">
import { RouterView } from 'vue-router';
import { setLogLevel } from 'agora-rtc-sdk-ng/esm';

// Disable Agora logging
setLogLevel(4);
</script>

<template>
  <RouterView />
</template>
