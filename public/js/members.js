import { fetchWithCredentials } from "./credentials.js";

export async function fetchProjectMembers(projectId) {
    const response = await fetchWithCredentials(`/project-members/${projectId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch project members');
    }
    return response.json();
  }
  
  export function displayProjectMembers(members, container, onSelectMember) {
    container.innerHTML = members
      .map(
        (member) => `
        <div
          class="me-3 text-center avatar-wrapper"
          data-account-id="${member.accountId}"
          data-display-name="${member.name}"
        >
          <img
            src="${member.avatarUrl}"
            class="rounded-circle"
            style="width: 50px; height: 50px; cursor: pointer;"
            alt="${member.name}"
          />
          <div>${member.name}</div>
        </div>`
      )
      .join('');
  
    // Add click event listeners
    container.querySelectorAll('.avatar-wrapper').forEach((avatar) => {
      avatar.addEventListener('click', () => {
        const accountId = avatar.getAttribute('data-account-id');
        const displayName = avatar.getAttribute('data-display-name');
        onSelectMember(accountId, displayName);
      });
    });
  }