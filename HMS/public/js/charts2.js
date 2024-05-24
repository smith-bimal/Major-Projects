const ctx3 = document.getElementById('appointment_chart').getContext('2d');

new Chart(ctx3, {
    type: 'polarArea', // Changed from 'pie' to 'doughnut' to use the cutout option
    data: {
        labels: ['Completed', 'Cancelled', 'Pending'],
        datasets: [{
            label: 'Counts',
            data: [12, 8, 10],
            borderWidth: 3,
            backgroundColor: [
                'rgba(75, 192, 192, 0.8)',
                'rgba(255, 99, 132, 0.8)',
                'rgba(255, 205, 86, 0.8)'
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            }
        }
    },
});
