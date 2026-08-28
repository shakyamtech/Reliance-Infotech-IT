/**
 * Reliance Infotech — Admin Interactive Charts (Chart.js Integration)
 */
window.AdminCharts = {
  clientGrowthChart: null,
  salesCategoryChart: null,
  projectDistChart: null,

  init: function() {
    var data = window.RelianceCMS ? window.RelianceCMS.getData() : window.RelianceCMS_DefaultData;
    var analytics = data.analytics || {};

    this.renderClientGrowth(analytics.monthlyClientGrowth || []);
    this.renderSalesByCategory(analytics.salesByCategory || []);
    this.renderProjectDistribution(analytics.projectDistribution || []);
  },

  renderClientGrowth: function(growthData) {
    var ctx = document.getElementById('clientGrowthCanvas');
    if (!ctx) return;

    if (this.clientGrowthChart) {
      this.clientGrowthChart.destroy();
    }

    var labels = growthData.map(function(d) { return d.month; });
    var totalClients = growthData.map(function(d) { return d.clients; });
    var newClients = growthData.map(function(d) { return d.newAdded; });

    var gradientGold = ctx.getContext('2d').createLinearGradient(0, 0, 0, 260);
    gradientGold.addColorStop(0, 'rgba(212, 160, 23, 0.45)');
    gradientGold.addColorStop(1, 'rgba(212, 160, 23, 0.0)');

    this.clientGrowthChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Total Active Clients',
            data: totalClients,
            borderColor: '#d4a017',
            backgroundColor: gradientGold,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#e8b84b',
            pointBorderColor: '#0d1b2a',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'New Corporate Clients Added',
            data: newClients,
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            fill: false,
            tension: 0.3,
            borderWidth: 2,
            borderDash: [5, 5],
            pointBackgroundColor: '#38bdf8',
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#d1d9e6',
              font: { family: "'DM Sans', sans-serif", size: 12, weight: '600' },
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: '#0d1b2a',
            titleColor: '#d4a017',
            bodyColor: '#ffffff',
            borderColor: 'rgba(212, 160, 23, 0.3)',
            borderWidth: 1,
            padding: 12,
            boxPadding: 6
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#8e9bb0', font: { family: "'DM Sans', sans-serif" } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#8e9bb0', font: { family: "'DM Sans', sans-serif" } }
          }
        }
      }
    });
  },

  renderSalesByCategory: function(salesData) {
    var ctx = document.getElementById('salesCategoryCanvas');
    if (!ctx) return;

    if (this.salesCategoryChart) {
      this.salesCategoryChart.destroy();
    }

    var labels = salesData.map(function(d) { return d.category; });
    var units = salesData.map(function(d) { return d.units; });

    this.salesCategoryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Units Sold',
          data: units,
          backgroundColor: [
            'rgba(212, 160, 23, 0.85)',
            'rgba(56, 189, 248, 0.85)',
            'rgba(16, 185, 129, 0.85)',
            'rgba(168, 85, 247, 0.85)'
          ],
          borderColor: [
            '#d4a017',
            '#38bdf8',
            '#10b981',
            '#a855f7'
          ],
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0d1b2a',
            titleColor: '#d4a017',
            bodyColor: '#ffffff',
            borderColor: 'rgba(212, 160, 23, 0.3)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#8e9bb0', font: { family: "'DM Sans', sans-serif", size: 11 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#8e9bb0', font: { family: "'DM Sans', sans-serif" } }
          }
        }
      }
    });
  },

  renderProjectDistribution: function(distData) {
    var ctx = document.getElementById('projectDistCanvas');
    if (!ctx) return;

    if (this.projectDistChart) {
      this.projectDistChart.destroy();
    }

    var labels = distData.map(function(d) { return d.type; });
    var counts = distData.map(function(d) { return d.count; });

    this.projectDistChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: [
            '#d4a017',
            '#38bdf8',
            '#10b981',
            '#f59e0b'
          ],
          borderColor: '#132238',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#d1d9e6',
              font: { family: "'DM Sans', sans-serif", size: 11 },
              padding: 14,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: '#0d1b2a',
            titleColor: '#d4a017',
            bodyColor: '#ffffff',
            borderColor: 'rgba(212, 160, 23, 0.3)',
            borderWidth: 1,
            callbacks: {
              label: function(item) {
                return ' ' + item.label + ': ' + item.raw + ' Active Deployments';
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }
};
