const API_ROOT = '/api/v1';

export async function request(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    credentials: 'include',
    ...options,
  });
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || 'The request could not be completed');
  }
  return body;
}

export const jsonRequest = (method, data) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export const formatDate = value =>
  value ? new Date(value).toLocaleDateString() : 'Recently';

export const truncate = (text = '', length = 140) =>
  text.length > length ? `${text.slice(0, length)}...` : text;
