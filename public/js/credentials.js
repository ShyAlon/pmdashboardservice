export function verifyCredentials(credentials) {
  return fetch('/user', {
    headers: {
      'Content-Type': 'application/json',
      baseurl: credentials.baseUrl,
      email: credentials.email,
      apitoken: credentials.apiToken,
    },
  });
}

export async function getUser(credentials) {
  const response = await fetch(`/user`, {
    headers: {
      'Content-Type': 'application/json',
      baseurl: credentials.baseUrl,
      email: credentials.email,
      apitoken: credentials.apiToken,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to user');
  }
  return response.json();
}

export function fetchWithCredentials(url) {
  const credentials = getStoredCredentials();
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      baseurl: credentials.baseUrl,
      email: credentials.email,
      apitoken: credentials.apiToken,
    }
  });
}

export function saveCredentials(baseUrl, email, apiToken) {
  const credentials = { baseUrl, email, apiToken };
  localStorage.setItem('jiraCredentials', JSON.stringify(credentials));
}

export function getStoredCredentials() {
  return JSON.parse(localStorage.getItem('jiraCredentials'));
}

export function clearCredentials() {
  localStorage.removeItem('jiraCredentials');
}