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

// Seat management APIs
export const getSeatsForEvent = (eventId) => {
  return apiClient.get(`/seats/event/${eventId}`);
};

export const getAvailableSeatCount = (eventId) => {
  return apiClient.get(`/seats/event/${eventId}/available-count`);
};

export const checkSeatAvailability = (eventId, seatNumber) => {
  return apiClient.get(`/seats/event/${eventId}/seat/${seatNumber}/available`);
};

export const initializeSeatsForEvent = (eventId, totalSupply) => {
  return apiClient.post(`/seats/event/${eventId}/initialize?totalSupply=${totalSupply}`);
};

// Ticket metadata API
export const getTicketMetadata = (tokenId) => {
  return apiClient.get(`/ticket/metadata/${tokenId}`);
};

// Resale APIs
export const listForResale = (data) => {
  return apiClient.post('/resale/list', data);
};

export const unlistFromResale = (tokenId, ownerAddress) => {
  return apiClient.post('/resale/unlist', null, {
    params: { tokenId, ownerAddress }
  });
};

export const confirmResalePurchase = (data) => {
  return apiClient.post('/resale/confirm-purchase', data);
};

export const getResaleInfo = (tokenId) => {
  return apiClient.get(`/resale/info/${tokenId}`);
};

export const getResaleListingsForEvent = (eventId) => {
  return apiClient.get(`/resale/event/${eventId}`);
};

export const isUserRegisteredForResale = (walletAddress) => {
  return apiClient.get('/resale/user/registered', {
    params: { walletAddress }
  });
};
