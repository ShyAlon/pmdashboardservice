let credentials = {};

// Save authentication data
document.getElementById('auth-form').addEventListener('submit', (e) => {
  e.preventDefault();
  credentials = {
    baseUrl: document.getElementById('baseUrl').value,
    email: document.getElementById('email').value,
    apiToken: document.getElementById('apiToken').value,
  };
  alert('Credentials saved successfully!');
  console.log("Credentials", credentials);
});

// Utility to call the server
async function callApi(endpoint, method = 'GET', body = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        baseUrl: credentials.baseUrl,
        email: credentials.email,
        apiToken: credentials.apiToken,
      };
  
      const response = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      });
  
      const result = await response.json();
      document.getElementById('resultOutput').innerText = JSON.stringify(result, null, 2);
    } catch (error) {
      document.getElementById('resultOutput').innerText = `Error: ${error.message}`;
    }
  }

// Fetch projects
document.getElementById('fetchProjects').addEventListener('click', () => {
  callApi(`/projects`);
});

// Fetch tasks
document.getElementById('fetchTasks').addEventListener('click', () => {
  callApi(`/tasks`);
});

// Post comment
document.getElementById('postCommentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const issueId = document.getElementById('issueId').value;
  const comment = document.getElementById('comment').value;
  if (!issueId || !comment) {
    alert('Issue ID and comment are required!');
    return;
  }
  callApi(`/tasks/${issueId}/comment`, 'POST', { comment });
});