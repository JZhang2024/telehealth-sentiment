<template>
  <div class="room-code">
    <p>Room Code: {{ code }}</p>
  </div>
</template>

<script>
export default {
  name: 'RoomCodeComponent',
  props: {
    code: {
      type: String,
      required: true,
    }
  },
}
</script>

<style>
.room-code {
  position: absolute;
  bottom: 10px;
  right: 10px;
  padding: 10px;
  border: 2px solid purple; /* Purple border for clarity */
  background-color: white;
  /* Additional styling as needed */
}
</style>
