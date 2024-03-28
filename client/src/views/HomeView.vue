<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import router from '@/router';
import Navbar from '@/components/Navbar.vue';

function makeCode(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function handleHost() {
  const roomCode = makeCode(6);
  router.push(`/room/${roomCode}`);
}
</script>

<template>
  <div class="flex min-h-screen w-full flex-col">
    <Navbar currentSection="home" />

    <div class="flex-grow flex items-center justify-center">
      <Card class="w-[512px]">
        <CardHeader>
          <CardTitle class="mx-auto">Welcome to Telehealth!</CardTitle>
          <CardDescription class="mx-auto">
            A communication tool for doctors to effectively diagnose patients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4">
            <img src="../assets/cigna.png" class="mx-auto p-2 w-[50%]" alt="React Logo" />

            <div class="space-x-4 mt-2 mx-auto">
              <RouterLink to="/join">
                <Button>Join Room</Button>
              </RouterLink>
              <Button variant="secondary" @click="handleHost">Host Room</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
