import { StormGlass } from '@src/clients/stormGlass';
import * as HTTPUtil from '@src/utils/request';
import stormGlassWeather3HoursFixtures from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixtures from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('@src/utils/request');

describe('StormGlass client', () => {
  const MockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>;
   
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;
  it('should return the normalized forecast from the StromGlass service', async () => {
    const lat = -33.7927726;
    const lng = 151.289824;

    mockedRequest.get.mockResolvedValue({ data: stormGlassWeather3HoursFixtures } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassNormalized3HoursFixtures);
  });

  it('should exlude incomplete data points', async () => {
    const lat = -33.7927726;
    const lng = 151.289824;

    const incompleteResponse = {
      hours: [
        {
          winDirection: {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        }
      ]
    };
    mockedRequest.get.mockResolvedValue({ data: incompleteResponse } as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  it('should get a generic error from StormGlass service when the request fail before reaching the service', async () => {
    const lat = -33.7927726;
    const lng = 151.289824;

    mockedRequest.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to comunicate to StormGlass: Network Error'
    );
  });

  it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    
    MockedRequestClass.isRequestError.mockReturnValue(true);
    
    mockedRequest.get.mockRejectedValue({
      response: {
        status: 429,
        data: { errors: ['Rate Limit reached'] },
      },
    });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
    );
  });
});
