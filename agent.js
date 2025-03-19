import dotenv from 'dotenv';
dotenv.config();

import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

import { tool } from '@langchain/core/tools';
import axios from 'axios';
import { MemorySaver } from '@langchain/langgraph';

const weatherTool = tool(
  async ({ latitude, longitude }) => {
    let weather;

    try {
      const response = await axios.request({
        method: 'GET',
        url: 'https://yahoo-weather5.p.rapidapi.com/weather',
        params: {
          lat: latitude,
          long: longitude,
          format: 'json',
          u: 'c',
        },
        headers: {
          'x-rapidapi-key': process.env.RAPID_API_KEY,
          'x-rapidapi-host':
            'yahoo-weather5.p.rapidapi.com',
        },
      });

      weather = response.data;
    } catch (error) {
      console.log('error', error);
    }

    return weather;
  },
  {
    name: 'getWeatherByGeocode',
    description: 'Get the weather in given location.',
    schema: z.object({
      latitude: z.number().describe('Latitude'),
      longitude: z.number().describe('Longitude'),
    }),
  }
);

const geocodeTool = tool(
  async ({ location }) => {
    let geocode;

    try {
      const response = await axios.request({
        method: 'GET',
        url: 'https://geocode.prateekanand.com/geocode',
        params: {
          city: location,
          limit: 1,
        },
      });

      geocode = {
        latitude: response.data[0].latitude,
        longitude: response.data[0].longitude,
      };
    } catch (error) {
      console.log('geocodeTool Error', error);
    }

    return geocode;
  },
  {
    name: 'getGeocodeByLocation',
    description:
      'Finds longitude and latitude of the location.',
    schema: z.object({
      location: z.string().describe('Location name.'),
    }),
  }
);

const model = new ChatOpenAI({
  model: 'gpt-4o',
});

const checkpointSaver = new MemorySaver();

export const agent = createReactAgent({
  llm: model,
  tools: [weatherTool, geocodeTool],
  checkpointSaver,
});
