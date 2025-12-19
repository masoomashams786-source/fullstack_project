import axios from "axios";



const api = axios.create({
  baseURL: "http://localhost:5000/api", 
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


export const fetcher =   (url) => api.get(url).then(r => r.data)

export const getAllTags = async () => {
  try {
    const response = await api.get("/tags")
    return response.data.tags
  } catch(err) {
    return new Error("Failed to fetch tags")
  }
}

export const getLoggedInUserNotes = async () => {
  try {
    const resp = await api.get("/notes")
    return resp.data
  } catch (err){
    throw new Error("Failed to fetch notes")
  }
}

exportconst 