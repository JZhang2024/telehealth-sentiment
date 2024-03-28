<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import router from '@/router';
import { onUpdated, ref } from 'vue';

const invalidInputMsg = ref('');
const channelName = ref('');

function handleConnect(e: Event) {
  // trim spaces
  const trimmedChannelName = channelName.value.trim();

  // validate input: make sure channelName is not empty
  if (trimmedChannelName === '') {
    e.preventDefault(); // keep the page from reloading on form submission
    invalidInputMsg.value = 'Room code cannot be empty.'; // show warning
    channelName.value = ''; // resets channel name value in case user entered blank spaces
    return;
  } else if (trimmedChannelName.length != 6) {
    e.preventDefault();
    invalidInputMsg.value = 'Room code must be 6 characters long.';
    channelName.value = '';
    return;
  }

  router.push(`/room/${trimmedChannelName}`);
}
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <form class="w-96">
      <div class="space-y-2">
        <p v-if="invalidInputMsg" className="font-medium text-red-400 mb-2">
          {{ invalidInputMsg }}
        </p>
        <Label>Room Code</Label>
        <Input type="text" placeholder="XXXXXX" v-model="channelName" />
      </div>
      <Button class="mt-4" @click="handleConnect">Join</Button>
    </form>
  </div>
</template>
