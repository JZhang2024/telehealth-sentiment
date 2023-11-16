<template>
    <div class="navbar">
      <ul>
        <li @click="navigateTo('home')">Home</li>
        <li @click="navigateTo('about')">About</li>
        <li @click="navigateTo('contact')">Contact</li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NavbarComponent',
    methods: {
      navigateTo(route) {
        // You can use Vue Router or any other navigation method here
        // For simplicity, let's just log the selected route to the console
        this.$router.push({ name: route });
      }
    }
  };
  </script>
  
  <style scoped>
  
  .navbar {
    background-color: #000000;
    padding: 10px;
    width: 100%;
  }
  
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
  }
  
  li {
    margin-right: 10px;
    cursor: pointer;
    color: white;
    
  }
  
  li:hover {
    text-decoration: underline;
  }
  </style>