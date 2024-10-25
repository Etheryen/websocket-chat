import assert from "assert";

// TODO: prod docker url
export const getApiUrl = () => {
  if (process.env.NODE_ENV == "production") {
    assert(
      process.env.NEXT_PUBLIC_API_URL,
      "NEXT_PUBLIC_API_URL is undefined in .env",
    );
    return process.env.NEXT_PUBLIC_API_URL as string;
  }

  return "http://localhost:8080";
};

export const getWsUrl = () => {
  const apiUrl = getApiUrl();
  const httpProtocol = apiUrl.split(":")[0];
  const wsProtocol = httpProtocol == "https" ? "wss" : "ws";

  return apiUrl.replace(httpProtocol, wsProtocol);
};
