const axios = require('axios');
const xml2js = require('xml2js');
const { fetchData } = require('C:\\Users\\kesha\\OneDrive\\Desktop\\Documents\\ProL\\sample_data.js');

jest.mock('axios');
jest.mock('xml2js');

describe('fetchData', () => {
  it('should fetch and parse data correctly', async () => {
    // Mock Axios
    axios.get.mockResolvedValue({
      data: '<MTConnectStreams><Streams><DeviceStream name="Lathe1" uuid="12345"></DeviceStream></Streams></MTConnectStreams>'
    });

    // Mock xml2js
    xml2js.Parser = jest.fn().mockImplementation(() => ({
      parseStringPromise: jest.fn().mockResolvedValue({
        MTConnectStreams: {
          Streams: {
            DeviceStream: { $: { name: "Lathe1", uuid: "12345" }}
          }
        }
      })
    }));

    const expected = ['Device: Lathe1, UUID: 12345'];
    const result = await fetchData();

    expect(result).toEqual(expected);
  });

  it('should handle errors', async () => {

    axios.get.mockRejectedValue(new Error('Network error'));

    const expected = ['Error fetching data'];
    const result = await fetchData();

    expect(result).toEqual(expected);
  });
});
