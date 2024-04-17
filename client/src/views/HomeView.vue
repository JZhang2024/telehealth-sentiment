<script setup lang="ts">
import { Button } from '@/components/ui/button';
import router from '@/router';
import Navbar from '@/components/Navbar.vue';
import { useUserStore } from '@/lib/store';

const userStore = useUserStore();

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
  userStore.setIdentity('Doctor');
  const roomCode = makeCode(6);
  router.push(`/room/${roomCode}`);
}

function handleJoin() {
  userStore.setIdentity('Patient');
}
</script>

<template>
  <Navbar currentSection="home" />
  <div class="container mx-auto px-5 overflow-x-hidden">
    <section class="grid grid-cols-none lg:grid-cols-2 pb-16 pt-8 items-center">
      <div class="lg:w-5/6 order-2 lg:order-none">
        <h1 class="text-4xl xl:text-5xl font-bold font-theme-heading text-center lg:text-left">
          Welcome to Cigna Telehealth!
        </h1>
        <p
          class="lg:text-xl mt-10 font-theme-content text-theme-grayish-blue text-center lg:text-left">
          A communication tool for doctors to effectively diagnose patients.
        </p>
        <div class="flex justify-center lg:justify-start mt-10 space-x-2">
          <RouterLink to="/join">
            <Button @click="handleJoin">Join Room</Button>
          </RouterLink>
          <Button variant="secondary" @click="handleHost">Host Room</Button>
        </div>
      </div>
      <div class="relative order-1 lg:order-none mb-20 lg:mt-0 lg:mb-0 lg:-mr-10">
        <img class="z-10 w-full" src="../assets/doctor.png" />
        <div
          class="-z-10 bg-theme-primary h-52 w-full sm:h-80 sm:w-full rounded-l-full absolute -right-28 md:-right-48 -bottom-8"></div>
      </div>
    </section>
  </div>
</template>
