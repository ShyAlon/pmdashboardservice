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
    .map((ticket) => {
      // Safely access optional fields
      const linkedIssues = ticket.linkedIssues
        .map((issue) => `<a href="${issue.url}" target="_blank">${issue.key}</a>`)
        .join(', ') || 'None';
      const cycle = ticket.cycle || 'None';
      const shapeUpDocument = ticket.shapeUpDocument || 'None';
      const techArea = ticket.techArea || 'None';
      const outcome = ticket.outcome || 'None';
      const team = ticket.team || 'None';

      return `
          <li class="list-group-item">
            <a href="${ticket.url}" target="_blank">${ticket.key}: ${ticket.summary}</a>
            <ul>
              <li><strong>Cycle:</strong> ${cycle}</li>
              <li><strong>Linked Issues:</strong> ${linkedIssues}</li>
              <li><strong>Shape Up Document:</strong> ${shapeUpDocument}</li>
              <li><strong>Tech Area:</strong> ${techArea}</li>
              <li><strong>Outcome:</strong> ${outcome}</li>
              <li><strong>Team:</strong> ${team}</li>
            </ul>
          </li>`;
    })
    .join('');
}