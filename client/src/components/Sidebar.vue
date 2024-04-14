<template>
  <div class="sidebar">
    <BarChart :frameData="frameData" />
  </div>
</template>

<script>
import BarChart from '../components/BarChart.vue';

export default {
  name: 'SidebarComponent',
  components: { BarChart },
  props: {
    frameData: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    frameData(newFrameData) {
      console.log('Frame Data:', newFrameData);
    }
  }
};
</script>

<style>
.sidebar {
  width: 25%;
  height: 100vh;
  border: 2px solid green; /* Green border for clarity */
}
</style>
