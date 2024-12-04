document.addEventListener('DOMContentLoaded', () => {
  const avatarImg = document.getElementById('avatar');
  const credentialsForm = document.getElementById('credentialsForm');
  const disconnectButton = document.getElementById('disconnectButton');

  // Check if credentials are stored
  const storedCredentials = JSON.parse(localStorage.getItem('jiraCredentials'));

  if (storedCredentials) {
    // Fetch avatar via the server
    fetch('/user', {
      headers: {
        'Content-Type': 'application/json',
        baseurl: storedCredentials.baseUrl,
        email: storedCredentials.email,
        apitoken: storedCredentials.apiToken,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.avatarUrl) {
          avatarImg.src = data.avatarUrl;
          avatarImg.classList.remove('d-none');
          credentialsForm.classList.add('d-none');
        } else {
          alert('Failed to fetch user details.');
        }
      })
      .catch((error) => {
        console.error('Error fetching user details:', error);
        localStorage.removeItem('jiraCredentials');
      });
  }

  // Handle avatar click to show disconnect modal
  avatarImg.addEventListener('click', () => {
    const disconnectModal = new bootstrap.Modal(document.getElementById('disconnectModal'));
    disconnectModal.show();
  });

  // Handle disconnect button click
  disconnectButton.addEventListener('click', () => {
    localStorage.removeItem('jiraCredentials');
    location.reload();
  });

  // Handle form submission
  document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const baseUrl = document.getElementById('baseUrl').value;
    const email = document.getElementById('email').value;
    const apiToken = document.getElementById('apiToken').value;

    localStorage.setItem(
      'jiraCredentials',
      JSON.stringify({ baseUrl, email, apiToken })
    );

    alert('Credentials saved! Reloading...');
    location.reload();
  });
});