const API_BASE = '/api/url';

export const shortenUrl = async (data) => {
  const res = await fetch(`${API_BASE}/shorten`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const bulkShorten = async (urls) => {
  const res = await fetch(`${API_BASE}/shorten/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls })
  });
  return res.json();
};

export const getAllUrls = async (page = 1, limit = 20, search = '') => {
  const res = await fetch(`${API_BASE}/all?page=${page}&limit=${limit}&search=${search}`);
  return res.json();
};

export const getStats = async () => {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
};

export const getAnalytics = async (shortId) => {
  const res = await fetch(`${API_BASE}/${shortId}/analytics`);
  return res.json();
};

export const getQRCode = async (shortId) => {
  const res = await fetch(`${API_BASE}/${shortId}/qr`);
  return res.json();
};

export const updateUrl = async (shortId, data) => {
  const res = await fetch(`${API_BASE}/${shortId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteUrl = async (shortId) => {
  const res = await fetch(`${API_BASE}/${shortId}`, { method: 'DELETE' });
  return res.json();
};
