const API_BASE = "/api";

let accessToken = null;

async function request(path, options = {}, _retried = false) {

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !_retried) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request(path, options, true);
    }
  }

  return res;
}

export async function apiGet(path) {
  return request(path, { method: "GET" });
}

export async function apiPost(path, body) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiDelete(path) {
  return request(path, { method: "DELETE" });
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  accessToken = data.accessToken;
  return data;
}

export async function register(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
  }

  accessToken = data.accessToken;
  return data;
}

export async function logout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  accessToken = null;
}

export async function getMe() {
  const res = await apiGet("/auth/me");

  if (!res.ok) {
    throw new Error("Not authenticated");
  }

  return res.json();
}

export async function refreshAccessToken() {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return false;

    const data = await res.json();
    accessToken = data.accessToken;
    return true;
  } catch {
    return false;
  }
}

export async function getWatchlists() {
  const res = await apiGet("/watchlist");
  if (!res.ok) throw new Error("Failed to fetch watchlists");
  return res.json();
}

export async function addStockToWatchlist(watchlistId, symbol, instrumentKey) {
  const res = await apiPost(`/watchlist/${watchlistId}/items`, { symbol, instrumentKey });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to add stock");
  }
  return res.json();
}

export async function removeStockFromWatchlist(watchlistId, symbol) {
  const res = await apiDelete(`/watchlist/${watchlistId}/items/${symbol}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to remove stock");
  }
  return res.json();
}

export async function searchStocks(query) {
  const res = await apiGet(`/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function getMarketStatus() {
  const res = await apiGet("/market/status");
  if (!res.ok) throw new Error("Failed to fetch market status");
  return res.json();
}

export async function getHistoricalCandles(instrumentKey, interval) {
  const res = await apiGet(
    `/market/history?instrumentKey=${encodeURIComponent(instrumentKey)}&interval=${encodeURIComponent(interval)}`
  );
  if (!res.ok) throw new Error("Failed to fetch historical candles");
  return res.json();
}

export async function getQuote(instrumentKey) {
  const res = await apiGet(
    `/market/quote?instrumentKey=${encodeURIComponent(instrumentKey)}`
  );
  if (!res.ok) throw new Error("Failed to fetch quote");
  return res.json();
}

export async function buyStock(symbol, quantity, price, instrumentKey) {
  const res = await apiPost("/trade/buy", { symbol, quantity, price, instrumentKey });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Buy failed");
  return data;
}

export async function sellStock(symbol, quantity, price, instrumentKey) {
  const res = await apiPost("/trade/sell", { symbol, quantity, price, instrumentKey });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Sell failed");
  return data;
}

export async function getTrades() {
  const res = await apiGet("/trade");
  if (!res.ok) throw new Error("Failed to fetch trades");
  return res.json();
}

export async function getHoldings() {
  const res = await apiGet("/holdings");
  if (!res.ok) throw new Error("Failed to fetch holdings");
  return res.json();
}

export async function resetBalance() {
  const res = await apiPost("/holdings/reset-balance");
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Reset failed");
  return data;
}
