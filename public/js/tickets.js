import { fetchWithCredentials } from "./credentials.js";

export async function fetchTickets(projectId, assigneeId) {
    const response = await fetchWithCredentials(`/tickets?projectId=${projectId}&assigneeId=${assigneeId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tickets');
    }
    return response.json();
  }
  
  export function displayTickets(tickets, container) {
    container.innerHTML = tickets
      .map(
        (ticket) => `
        <li class="list-group-item">
          <a href="${ticket.url}" target="_blank">${ticket.key}: ${ticket.summary}</a>
        </li>`
      )
      .join('');
  }