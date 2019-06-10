import axios from 'axios';

const port = '8080';

export const PROMISE = (api, verb, noun, args = {}) => {
  return axios.get(`http://127.0.0.1:${port}/${api}/${verb}/${noun}`, {
    params: args,
  });
};
