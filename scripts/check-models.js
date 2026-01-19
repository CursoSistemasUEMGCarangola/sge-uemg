const https = require('https');

const apiKey = "AIzaSyAsG6s7EYkvAUK9xmeN3URQHOTLRq6HdGQ";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                json.models.forEach(m => {
                    if (m.name.includes("gemini")) {
                        console.log(m.name);
                    }
                });
            } else {
                console.log("No models found or error:", data);
            }
        } catch (e) {
            console.log("Raw data:", data);
        }
    });
}).on('error', (e) => {
    console.error(e);
});
