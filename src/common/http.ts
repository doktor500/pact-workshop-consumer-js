import fetch from "node-fetch";

const options = {
  headers: { "Accept": "application/json", "Access-Control-Allow-Origin": "*" },
  method: "get"
};

export default class Http {
  public async get(url: string): Promise<any> {
    return fetch(url, options).then(response => response.json());
  }
}
