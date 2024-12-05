import { fetchWithCredentials } from "./credentials.js";

export async function fetchProjects() {
  const response = await fetchWithCredentials('/projects'); // Adjust the endpoint if needed
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  const projects = await response.json();
  // Filter projects by type "product_discovery"
  return projects.filter((project) => project.projectTypeKey === 'product_discovery');
}

export async function fetchTickets(projectId, assigneeId) {
  const response = await fetchWithCredentials(`/tickets?projectId=${projectId}&assigneeId=${assigneeId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tickets');
  }
  return response.json();
}

export function displayTickets(tickets, container) {
  const tableBody = document.getElementById('ticketsTableBody');
  const cycleHeader = document.getElementById('cycleHeader');

  // Create and style the dropdown
  const cycleDropdown = document.createElement('div');
  cycleDropdown.classList.add('dropdown-menu');
  cycleDropdown.style.position = 'absolute';
  cycleDropdown.style.top = '100%';
  cycleDropdown.style.left = '0';
  cycleDropdown.style.zIndex = '1000';

  // Extract unique cycle values
  const cycleValues = Array.from(
    new Set(tickets.map((ticket) => ticket.cycle).filter(Boolean))
  );
  cycleValues.unshift('All'); // Add "All" to the top

  // Populate dropdown with cycle values
  cycleDropdown.innerHTML = cycleValues
    .map((value) => `<a class="dropdown-item" href="#">${value}</a>`)
    .join('');

  // Attach dropdown to the Cycle header
  cycleHeader.style.position = 'relative';
  cycleHeader.appendChild(cycleDropdown);

  // Handle dropdown visibility toggle
  cycleHeader.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent document click listener from immediately hiding the dropdown
    cycleDropdown.classList.toggle('show');
  });

  // Handle dropdown selection
  cycleDropdown.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent document click listener from immediately hiding the dropdown
    const selectedCycle = event.target.textContent.trim();
    updateCycleInURL(selectedCycle === 'All' ? null : selectedCycle); // Update URL
    applyCycleFilter(selectedCycle, tickets, tableBody); // Apply filter
    cycleDropdown.classList.remove('show'); // Hide the dropdown
  });

  // Apply the filter based on the current cycle in the URL
  const currentCycle = getCycleFromURL();
  applyCycleFilter(currentCycle || 'All', tickets, tableBody);
}

// Helper: Apply cycle filter and render the table
function applyCycleFilter(cycle, tickets, tableBody) {
  const filteredTickets =
    cycle === 'All' || !cycle
      ? tickets
      : tickets.filter((ticket) => ticket.cycle === cycle);
  renderTableRows(filteredTickets, tableBody);
}

// Helper: Update the cycle in the URL
function updateCycleInURL(cycle) {
  const url = new URL(window.location);
  if (cycle) {
    url.searchParams.set('cycle', cycle);
  } else {
    url.searchParams.delete('cycle');
  }
  history.replaceState({}, '', url);
}

// Helper: Get the cycle from the URL
function getCycleFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('cycle');
}

function getColorForCondition(condition) {
  const colors = {
    1: '#ff0000', // Deep red
    2: '#ff4000', // Red-orange
    3: '#ffa500', // Orange
    5: '#80ff00', // Light green
    6: '#008000', // Green
  };
  return colors[condition] || '#ffffff'; // Default to white if no condition
}

function getTextColorForBackground(backgroundColor) {
  // Extract RGB values from the color (assuming it’s in hex format)
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate brightness (perceived luminance formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return white text for darker colors, black text for lighter colors
  return brightness < 128 ? '#ffffff' : '#000000';
}

function renderTableRows(tickets, tableBody) {
  tableBody.innerHTML = tickets
    .map((ticket) => {
      const backgroundColor = getColorForCondition(ticket.condition);
      const textColor = getTextColorForBackground(backgroundColor); // Determine text color
      return `
      <tr style="background-color: ${backgroundColor}; color: ${textColor};">
        <td><a href="${ticket.url}" target="_blank" style="color: ${textColor};">${ticket.key}: ${ticket.summary}</a></td>
        <td style="color: ${textColor};">${ticket.cycle || 'None'}</td>
        <td style="color: ${textColor};">${ticket.linkedIssues.length
          ? ticket.linkedIssues
            .map(
              (issue) =>
                `<div>
                      <a href="${issue.url}" target="_blank" style="color: ${textColor};">${issue.key}</a>
                    </div>`
            )
            .join('')
          : 'None'
        }</td>
        <td style="color: ${textColor};">${ticket.techArea || 'None'}</td>
        <td style="color: ${textColor};">${ticket.outcome || 'None'}</td>
        <td style="color: ${textColor};">${ticket.team || 'None'}</td>
      </tr>`;
    })
    .join('');
}