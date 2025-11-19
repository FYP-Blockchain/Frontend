import axios from "axios";

const resolvedBaseURL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/$/,
  ""
);

const apiClient = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken");
    if (token) {
      if (!config.headers) config.headers = {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

export const getQrData = (tokenId, walletId) => {
  if (!tokenId || !walletId) {
    return Promise.reject(new Error("tokenId and walletId are required"));
  }

  return apiClient.get(`/verification/${tokenId}/qrData`, {
    params: { walletId },
  });
};

export const verifyTicket = (payload) => {
  if (!payload || !payload.eventId || !payload.message || !payload.signature) {
    return Promise.reject(
      new Error("eventId, message, and signature are required")
    );
  }

  return apiClient.post("/verification/verify", payload);
};
