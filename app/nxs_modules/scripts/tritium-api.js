import { LoadSettings } from 'api/settings';
import { remote } from 'electron';
const core = remote.getGlobal('core');

const port = '8080';

export const PROMISE = (api, verb, noun, args) => {
  return new Promise((resolve, reject) => {
    let PostData = JSON.stringify({
      params: args,
    });

    let ResponseObject = new XMLHttpRequest();

    ResponseObject.onload = () => {
      console.log(ResponseObject);
      if (ResponseObject.status == 404) {
        reject(JSON.parse(ResponseObject.responseText).error.message);
      }
      if (ResponseObject.status == 401) {
        reject('Bad Username and Password');
      }
      if (ResponseObject.status == 400) {
        reject('Bad Request');
      }
      if (ResponseObject.status == 500) {
        reject(JSON.parse(ResponseObject.responseText).error.message);
      }

      let payload = JSON.parse(ResponseObject.response).result;

      resolve(payload);
    };

    ResponseObject.onerror = function(e) {
      e.preventDefault();
      if (ResponseObject.status == 401) {
        reject(401);
      } else {
        reject(ResponseObject.responseText);
      }
    };

    ResponseObject.open(
      'GET',
      `http://127.0.0.1:${port}/${api}/${verb}/${noun}`
    );
    ResponseObject.send();
  });
};
