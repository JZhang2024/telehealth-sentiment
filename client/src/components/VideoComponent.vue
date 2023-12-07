<template>
  <div class="video-container">
    <video controls>
      <source src="https://sample-videos.com/video123/mp4/480/big_buck_bunny_480p_5mb.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>
  </div>
</template>

<script>
export default {
  name: 'VideoComponent'
  // Other component options
}
</script>

<style>
.video-container {
  width: 100%;
  height: 75vh; /* Adjust if necessary */
  border: 2px solid blue; /* Blue border for clarity */
}
.video-container video {
  width: 100%;
  height: 100%;
}
</style>
  