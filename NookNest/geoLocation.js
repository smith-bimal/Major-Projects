const https = require('https');

module.exports.getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        https.get('https://ipinfo.io/json', (res) => {
            let data = '';

            // A chunk of data has been received.
            res.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received.
            res.on('end', () => {
                try {
                    const location = JSON.parse(data);
                    if (location && location.loc) {
                        const coordinates = location.loc.split(',');
                        const latitude = parseFloat(coordinates[0]);
                        const longitude = parseFloat(coordinates[1]);
                        resolve({ latitude, longitude });
                    } else {
                        reject(new Error('Location data not found'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}