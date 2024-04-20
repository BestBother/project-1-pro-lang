//Importing modules
const express = require('express'); 
const axios = require('axios');      
const xml2js = require('xml2js');  

const app = express();
//sets the port to 3000 (http://localhost:3000/)
const port = 3000;

//Set EJS as the templating engine for rendering views
app.set('view engine', 'ejs');


const parser = new xml2js.Parser({ explicitArray: false });

//This function fetch's data from a given URL and parse it
async function fetchData() {

    try {
        const url = 'https://smstestbed.nist.gov/vds/current';
        const response = await axios.get(url);  
        const result = await parser.parseStringPromise(response.data); 

        let outputData = [];  

        //Makes sure deviceStreams is always an array
        const deviceStreams = result.MTConnectStreams?.Streams?.DeviceStream;
        const normalizedDeviceStreams = Array.isArray(deviceStreams) ? deviceStreams : [deviceStreams];

        normalizedDeviceStreams.forEach((deviceStream) => {
            
            outputData.push(`Device: ${deviceStream.$.name}, UUID: ${deviceStream.$.uuid}`);

             //Makes sure componentStreams is always an array
            const componentStreams = deviceStream.ComponentStream;
            const normalizedComponentStreams = Array.isArray(componentStreams) ? componentStreams : [componentStreams];

            normalizedComponentStreams.forEach((componentStream) => {
               
                if (componentStream.Events) {
                    outputData.push('Events');
                    Object.entries(componentStream.Events).forEach(([key, event]) => {
                        if (Array.isArray(event)) {
                            event.forEach(e => outputData.push(formatDataItem(e)));
                        } else {
                            console.log('Single event data:', event);
                            outputData.push(formatDataItem(event));
                        }
                    });
                }

                // Process and log Condition
                if (componentStream.Condition) {
                    outputData.push('Condition');
                    console.log('Condition data:', componentStream.Condition);
                    outputData.push(formatDataItem(componentStream.Condition));
                }

                // Process and log Samples
                if (componentStream.Samples) {
                    outputData.push('Samples');
                    Object.entries(componentStream.Samples).forEach(([key, sample]) => {
                        if (Array.isArray(sample)) {
                            sample.forEach(s => outputData.push(formatDataItem(s)));
                        } else {
                            console.log('Single sample data:', sample);
                            outputData.push(formatDataItem(sample));
                        }
                    });
                }
            });
        });

        return outputData;
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        return ['Error fetching data'];
    }
}

//function to format individual data items and handling missing data gracefully
function formatDataItem(dataItem) {
    if (!dataItem || !dataItem.$) {
        console.error('Invalid data item:', dataItem);
        return 'Invalid data item received';
    }
    return `Timestamp: ${dataItem.$.timestamp || 'N/A'}, Type: ${dataItem.$.type || 'N/A'}, Sub Type: ${dataItem.$.subType || 'N/A'}, Name: ${dataItem.$.name || 'N/A'}, Id: ${dataItem.$.id || 'N/A'}, Sequence: ${dataItem.$.sequence || 'N/A'}, Value: ${dataItem._ || 'N/A'}`;
}

//Route handler for the root path
app.get('/', async (req, res) => {
    const data = await fetchData();  
    res.render('index', { data: data });
});

//Starts the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
