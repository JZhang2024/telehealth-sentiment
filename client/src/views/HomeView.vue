<template>
  <main class="home">
    <h2>Home</h2>
        <ul>
          <li>
            <RouterLink :to="{ name: 'host' }" class="host">Host</RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'join' }" class="join">Join</RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'video' }" class="video">Video Test</RouterLink>
          </li>
        </ul>
  </main>
</template>

<style>
.home {
  padding: 1rem;
}

.home h2 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.home p {
  margin-bottom: 1rem;
}
</style>
