export function getQueryParams() {
    return new URLSearchParams(window.location.search);
  }
  
  export function updateQueryParams(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    history.replaceState({}, '', url);
  }