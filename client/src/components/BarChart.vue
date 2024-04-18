<script>
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'BarChart',
  components: { Bar },
  props: {
    frameData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      chartData: {
        labels: ['Calm', 'Sad', 'Surprised', 'Confused', 'Happy', 'Angry', 'Disgusted', 'Fear'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0, 0] }]
      },
      chartOptions: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };
  },
  watch: {
    frameData(newFrameData) {
      console.log('new frame data recieved:', newFrameData);
      this.updateChartData(newFrameData);
    }
  },
  methods: {
    updateChartData(newData) {
      const labels = [
        'Calm',
        'Sad',
        'Surprised',
        'Confused',
        'Happy',
        'Angry',
        'Disgusted',
        'Fear'
      ];
      const data = Array(8).fill(0);
      const backgroundColors = [
        '#a8bdbf', // Calm
        '#175981', // Sad
        '#e4ff16', // Surprised
        '#d19bad', // Confused
        '#ff9a55', // Happy
        '#a91834', // Angry
        '#8ab852', // Disgusted
        '#8c9eb3' // Fear
      ];

      newData.forEach((item) => {
        const index = labels.findIndex((label) => label.toUpperCase() === item.Type.toUpperCase());
        if (index !== -1) {
          data[index] = item.Confidence;
        }
      });

      this.chartData = {
        labels: ['Calm', 'Sad', 'Surprised', 'Confused', 'Happy', 'Angry', 'Disgusted', 'Fear'],
        datasets: [{ data: data, backgroundColor: backgroundColors }]
      };
      console.log(this.chartData.datasets);
    }
  }
};
</script>

<template>
  <Bar :options="chartOptions" :data="chartData" :height="300" />
</template>
