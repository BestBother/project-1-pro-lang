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
        const url = 'https://smstestbed.nist.gov/vds/sample?count=2000';
        const response = await axios.get(url);  
        const result = await parser.parseStringPromise(response.data);

        let outputData = []; 

        //Access DeviceStream node from result
        const deviceStreams = result.MTConnectStreams?.Streams?.DeviceStream;
        if (deviceStreams) {
            //Makes sure deviceStreams is always an array
            const normalizedDeviceStreams = Array.isArray(deviceStreams) ? deviceStreams : [deviceStreams];

            normalizedDeviceStreams.forEach((deviceStream) => {
    
                outputData.push(`Device: ${deviceStream.$.name}, UUID: ${deviceStream.$.uuid}`);

               
                const componentStreams = deviceStream.ComponentStream;
                if (componentStreams) {
             //Makes sure componentStreams is always an array
                    const normalizedComponentStreams = Array.isArray(componentStreams) ? componentStreams : [componentStreams];

                    normalizedComponentStreams.forEach((componentStream) => {
                      
                        if (componentStream.Events) {
                            outputData.push('Events');
                            Object.entries(componentStream.Events).forEach(([key, event]) => {
                                if (Array.isArray(event)) {
                                    event.forEach(e => outputData.push(formatDataItem(e)));
                                } else {
                                    outputData.push(formatDataItem(event));
                                }
                            });
                        }

                        //Process Condition node if present
                        if (componentStream.Condition) {
                            outputData.push('Condition');
                            outputData.push(formatDataItem(componentStream.Condition));
                        }

                        //Process Samples node if present
                        if (componentStream.Samples) {
                            outputData.push('Samples');
                            Object.entries(componentStream.Samples).forEach(([key, sample]) => {
                                if (Array.isArray(sample)) {
                                    sample.forEach(s => outputData.push(formatDataItem(s)));
                                } else {
                                    outputData.push(formatDataItem(sample));
                                }
                            });
                        }
                    });
                }
            });
        }

        return outputData; 
    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        return ['Error fetching data'];
    }
}

//formats individual data items
function formatDataItem(dataItem) {
    return `Timestamp: ${dataItem.$.timestamp}, Type: ${dataItem.$.type}, Sub Type: ${dataItem.$.subType || ''}, Name: ${dataItem.$.name}, Id: ${dataItem.$.id}, Sequence: ${dataItem.$.sequence}, Value: ${dataItem._}`;
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
