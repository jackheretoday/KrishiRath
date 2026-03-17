/**
 * AgroRath API Configuration
 * Dynamically detects the backend host to allow multic-device network access.
 */
export const getApiUrl = () => {
  // If we're on localhost, use localhost. 
  // If we're on a network IP (like 192.168.x.x), use that IP for the backend too.
  const hostname = window.location.hostname;
  const port = "5001";
  
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://localhost:${port}`;
  }
  
  return `http://${hostname}:${port}`;
};

export const API_URL = getApiUrl();
