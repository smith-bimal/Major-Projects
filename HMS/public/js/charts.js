
const ctx2 = document.getElementById('pat_visit_dept');

new Chart(ctx2, {
    type: 'doughnut',
    data: {
        labels: ['General Checkup', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'],
        datasets: [{
            label: 'Counts',
            data: [12, 2, 4, 5, 1],
            borderWidth: 3
        }]
    },
    options: {
        cutoutPercentage: 60, // Adjust this value to control the size of the center hole
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    rotation: Math.PI / 2,
                    // Adjust padding if necessary
                    // padding: 20
                }
            }
        },
        elements: {
            arc: {
                borderWidth: 0
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1.5, // Increase the aspect ratio to make the chart wider
        datasets: {
            weight: 1 // Increase the weight to make the doughnut thicker
        }
    }
});