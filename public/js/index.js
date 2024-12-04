import {
  verifyCredentials,
  saveCredentials,
  getStoredCredentials,
  clearCredentials,
} from './credentials.js';

import { fetchProjectMembers, displayProjectMembers } from './members.js';
import { fetchTickets, displayTickets } from './tickets.js';
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

  if (storedCredentials && await verifyCredentials(storedCredentials)) {
    credentialsForm.classList.add('d-none');
    const mainProjectId = selectedProjectId || JSON.parse(localStorage.getItem('mainProject')).projectId;

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
  } else {
    credentialsForm.classList.remove('d-none');
  }
});