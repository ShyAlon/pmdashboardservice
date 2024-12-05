import {
  verifyCredentials,
  getUser,
  saveCredentials,
  getStoredCredentials,
  clearCredentials,
} from './credentials.js';

import { fetchProjectMembers, displayProjectMembers } from './members.js';
import { fetchProjects, fetchTickets, displayTickets } from './tickets.js';
import { getQueryParams, updateQueryParams } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const credentialsForm = document.getElementById('credentialsForm');
  const projectUsersRow = document.getElementById('projectUsersRow');
  const projectsSection = document.getElementById('projectsSection');
  const ticketsSection = document.getElementById('ticketsSection');
  const ticketsList = document.getElementById('ticketsList');
  const assigneeNameSpan = document.getElementById('assigneeName');

  const queryParams = getQueryParams();
  const selectedProjectId = queryParams.get('projectId');
  const selectedAssigneeId = queryParams.get('assigneeId');

  const storedCredentials = getStoredCredentials();

  if (storedCredentials) {
    const avatarElement = document.getElementById('avatar');
    const user = await getUser(storedCredentials);
    console.log(user);
    if (user && user.avatarUrl) {
      avatarElement.src = user.avatarUrl;
      avatarElement.alt = user.displayName || 'User Avatar';
      avatarElement.classList.remove('d-none'); // Ensure the avatar is visible
      // avatarElement.addEventListener('click', showAvatarOptions);
    } else {
      console.error('Avatar URL is missing from user data.');
    }
    credentialsForm.classList.add('d-none');
    const mainProjectId = selectedProjectId || JSON.parse(localStorage.getItem('mainProject'));
    if (mainProjectId) {
      const members = await fetchProjectMembers(mainProjectId);
      projectUsersSection.classList.remove('d-none');
      displayProjectMembers(members, projectUsersRow, (accountId, displayName) => {
        assigneeNameSpan.textContent = displayName;
        projectsSection.classList.add('d-none');
        ticketsSection.classList.remove('d-none');
        updateQueryParams({ projectId: mainProjectId, assigneeId: accountId });
        fetchTickets(mainProjectId, accountId).then((tickets) => displayTickets(tickets, ticketsList));
      });

      // Automatically select default member
      if (selectedAssigneeId) {
        document.querySelector(`.avatar-wrapper[data-account-id="${selectedAssigneeId}"]`)?.click();
      } else {
        projectUsersRow.querySelector('.avatar-wrapper')?.click();
      }
    } else { // no main project. Select one.
      try {
        const projects = await fetchProjects(); // Fetch the list of projects
        renderProjects(projects, document.getElementById('projectsList'));
      } catch (error) {
        console.error('Error fetching projects:', error);
        alert('Failed to fetch projects. Please try again later.');
      }
    }
  } else {
    credentialsForm.classList.remove('d-none');
    credentialsForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent form submission and page reload
      const baseUrl = document.getElementById('baseUrl').value.trim();
      const email = document.getElementById('email').value.trim();
      const apiToken = document.getElementById('apiToken').value.trim();

      if (!baseUrl || !email || !apiToken) {
        alert('Please fill in all fields.');
        return;
      }
      // Save credentials to local storage
      saveCredentials(baseUrl, email, apiToken);
      credentialsForm.classList.add('d-none');
      location.reload(); // Optional: Reload the page to apply the saved credentials
    });
  }
});

function showAvatarOptions() {
  const avatarOptions = document.getElementById('avatarOptions');
  avatarOptions.classList.toggle('d-none'); // Toggle visibility of the dropdown

  // Position the dropdown below the avatar
  const avatar = document.getElementById('avatar');
  const rect = avatar.getBoundingClientRect();
  avatarOptions.style.top = `${rect.bottom + window.scrollY}px`;
  avatarOptions.style.left = `${rect.left + window.scrollX}px`;
}


function setMainProject(projectId, projectName) {
  const mainProject = { id: projectId, name: projectName };
  localStorage.setItem('mainProject', JSON.stringify(mainProject));
  location.reload();
}

function renderProjects(projects, container) {
  container.innerHTML = projects
    .map(
      (project) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${project.name}</span>
        <button class="btn btn-sm btn-primary" data-project-id="${project.id}" data-project-name="${project.name}">
          Set as Main Project
        </button>
      </li>`
    )
    .join('');

  // Add event listeners for the "Set as Main Project" buttons
  container.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const projectId = button.getAttribute('data-project-id');
      const projectName = button.getAttribute('data-project-name');
      setMainProject(projectId, projectName);
    });
  });
}

window.showAvatarOptions = function() {
  const avatarOptions = document.getElementById('avatarOptions');
  avatarOptions.classList.toggle('d-none');

  const avatar = document.getElementById('avatar');
  const rect = avatar.getBoundingClientRect();

  avatarOptions.style.top = `${rect.bottom + window.scrollY}px`;
  avatarOptions.style.left = `${rect.left + window.scrollX - 100}px`;

  avatarOptions.style.zIndex = '9999'; // Ensure it appears above other elements
  avatarOptions.style.display = avatarOptions.classList.contains('d-none')
    ? 'none'
    : 'block'; // Ensure visibility
}

window.deleteAllData = function() {
  if (confirm('Are you sure you want to delete all locally stored data? This will restart the app.')) {
    localStorage.clear(); // Clear all data from localStorage
    sessionStorage.clear(); // Optional: Clear sessionStorage if used
    location.reload(); // Reload the page to restart the app
  }
}