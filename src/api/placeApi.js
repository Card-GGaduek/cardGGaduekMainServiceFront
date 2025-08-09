import axiosInstance from './axiosInstance';

const placeApi = {
  getPlacesByTextAndViewPort: async (textQuery, rectangle) => {
    return await axiosInstance.post('/place', {
      textQuery,
      locationRestriction: {
        rectangle,
      },
    });
  },
};

export default placeApi;

/* 
const requestBody = {
      textQuery: keyword.value,
      languageCode: 'ko',
      locationBias: {
        rectangle: {
          low: {
            latitude: sw.y,
            longitude: sw.x,
          },
          high: {
            latitude: ne.y,
            longitude: ne.x,
          },
        },
      },
    };

*/