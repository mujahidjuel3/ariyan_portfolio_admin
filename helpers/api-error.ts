import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      if (error.response?.status === 401 && message.toLowerCase() === "unauthorized") {
        return "Session expired. Please log in again and retry upload.";
      }
      return message;
    }
    if (Array.isArray(message)) return message.join(", ");
    if (error.response?.status === 401) {
      return "Session expired. Please log in again.";
    }
    if (error.response?.status === 413) {
      return "File is too large.";
    }
  }
  return fallback;
}
