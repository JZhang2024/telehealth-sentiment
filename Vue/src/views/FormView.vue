<template>
  <main class="form">
    <h2>This is a form example</h2>
    <p>
      This page includes a simple todo list application, which showcases the
      state management and form capabilities of vue.
    </p>

    <form @submit.prevent="createTodo" class="create-todo">
      <label for="todo">New Todo</label>
      <input type="text" id="todo" name="todo" v-model="newTodo" />
      <button type="submit">Save</button>
    </form>

    <ul>
      <!--
        v-for requires a unique key for every element so that it can efficiently keep track
        of each list item. it is possible for the user to type the same todo more than once,
        so the todo itself isn't necessarily unique. the index on its own is of course unique,
        it represents each unique place in the array. there are unfortunately edge case issues
        with using the index alone that we don't need to get into, so we combine the todo and
        the index into a unique key that will work in all situations
      -->
      <li v-for="(todo, index) in todos" :key="todo + index">
        {{ todo }}
        <button @click="deleteTodo(index)">Delete</button>
      </li>

      <!--
        it is a good user experience practice to provide feedback when in an "emtpy state",
        in this case, where there are no todos to show yet. this informs the user of
        the current status of the system (working), and doesn't make them wonder if something
        has gone wrong
       -->
      <li v-if="todos.length === 0">
        <p>No Todos Yet, go ahead and create one!</p>
      </li>
    </ul>
  </main>
</template>

<script setup>
import { ref } from "vue";

const newTodo = ref("");

const todos = ref([]);

// function to run when the create todo form is submitted
function createTodo() {
  // sanitize the input by removing the whitespace from the beginning and end of newTodo.value
  const todoToAdd = newTodo.value.trim();

  // if the sanitized input is not an empty string (i.e., an actual todo), add it to the list and reset the form
  if (todoToAdd !== "") {
    todos.value.push(todoToAdd);
    newTodo.value = "";
  }
}

// when a todo's delete button is clicked, the index of that todo is passed to this function
// Array.splice takes an index in the array and a number of items to delete after that
function deleteTodo(index) {
  todos.value.splice(index, 1);
}
</script>

<style>
.form {
  padding: 1rem;
}

.form h2 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.form p {
  margin-bottom: 1rem;
}

/* flex layouts allow us to position elements next to each other that would otherwise have been on top of each other */
.form ul {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}
.form li {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* create some space beneath the create todo form */
.form form {
  margin-bottom: 1rem;
}

/* set some default styling to buttons and inputs for borders, heights, and padding */
.form :is(input, button) {
  line-height: 2rem;
  padding-inline: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #d9d9d9;
  margin-left: 0.5rem;
  color: #202020;
}
</style>
