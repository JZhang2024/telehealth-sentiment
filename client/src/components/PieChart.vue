<script>
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Tooltip, Legend, ArcElement);

export default {
  name: 'PieChart',
  components: { Pie },
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
        datasets: [
          {
            backgroundColor: [
              '#a8bdbf', // Calm
              '#175981', // Sad
              '#e4ff16', // Surprised
              '#d19bad', // Confused
              '#ff9a55', // Happy
              '#a91834', // Angry
              '#8ab852', // Disgusted
              '#8c9eb3' // Fear
            ],
            data: [10, 10, 10, 10, 10, 10, 20, 20]
          }
        ]
      },
      chartOptions: {
        responsive: true,
        plugins: {
          legend: {
            display: true
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
          data[index] = parseFloat(item.Confidence);
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
  <Pie :options="chartOptions" :data="chartData" :height="300" />
</template>
