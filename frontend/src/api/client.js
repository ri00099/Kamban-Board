import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true, 
});
client.defaults.withCredentials = true;


export default client;
