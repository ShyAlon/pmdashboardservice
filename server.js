require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const { body, validationResult } = require('express-validator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to validate and extract Jira credentials from headers
const extractCredentials = (req, res, next) => {
    // Use lowercase names for headers
    const baseUrl = req.headers['baseurl'];
    const email = req.headers['email'];
    const apiToken = req.headers['apitoken'];

    if (!baseUrl || !email || !apiToken) {
        return res.status(400).json({ error: 'Missing Jira credentials in headers' });
    }

    req.jiraCredentials = { baseUrl, email, apiToken };
    next();
};

// Helper function to create Jira API headers
const createJiraHeaders = ({ email, apiToken }) => ({
    Authorization: `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`,
    'Content-Type': 'application/json',
});

// Routes

// Default route: Serve the Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Tester route: Serve the Tester page
app.get('/tester', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Jira API: Fetch user details (for the avatar)
app.get('/user', extractCredentials, async (req, res) => {
    const { baseUrl, email, apiToken } = req.jiraCredentials;

    try {
        const response = await axios.get(`${baseUrl}/rest/api/2/myself`, {
            headers: createJiraHeaders({ email, apiToken }),
        });
        res.json({
            avatarUrl: response.data.avatarUrls['48x48'],
            displayName: response.data.displayName,
        });
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Jira API: Fetch all projects
// Jira API: Fetch all projects with optional filtering by projectTypeKey
app.get('/projects', extractCredentials, async (req, res) => {
    const { baseUrl, email, apiToken } = req.jiraCredentials;
    const { projectTypeKey } = req.query; // Extract the projectTypeKey query parameter

    try {
        const response = await axios.get(`${baseUrl}/rest/api/2/project`, {
            headers: createJiraHeaders({ email, apiToken }),
        });

        let projects = response.data;

        // Filter projects if projectTypeKey is specified
        if (projectTypeKey) {
            projects = projects.filter((project) => project.projectTypeKey === projectTypeKey);
        }

        res.json(projects);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Jira API: Fetch tasks for the logged-in user
app.get('/tasks', extractCredentials, async (req, res) => {
    const { baseUrl, email, apiToken } = req.jiraCredentials;

    try {
        const response = await axios.get(`${baseUrl}/rest/api/2/search?jql=assignee=currentUser()`, {
            headers: createJiraHeaders({ email, apiToken }),
        });
        res.json(response.data.issues);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Jira API: Fetch project members from ticket assignees and creators
app.get('/project-members/:projectId', extractCredentials, async (req, res) => {
    const { baseUrl, email, apiToken } = req.jiraCredentials;
    const { projectId } = req.params;

    try {
        // Step 1: Fetch all issues in the project
        const issuesResponse = await axios.get(`${baseUrl}/rest/api/2/search?jql=project=${projectId}`, {
            headers: createJiraHeaders({ email, apiToken }),
        });

        const issues = issuesResponse.data.issues || [];

        // Step 2: Extract unique assignees and creators
        const users = new Map();

        issues.forEach((issue) => {
            const { assignee, creator } = issue.fields;

            // Add assignee to users
            if (assignee) {
                users.set(assignee.accountId, {
                    name: assignee.displayName,
                    avatarUrl: assignee.avatarUrls['48x48'],
                    accountId: assignee.accountId,
                });
            }

            // Add creator to users
            if (creator) {
                users.set(creator.accountId, {
                    name: creator.displayName,
                    avatarUrl: creator.avatarUrls['48x48'],
                    accountId: creator.accountId,
                });
            }
        });

        // Step 3: Convert Map to Array for the response
        const members = Array.from(users.values());

        res.json(members);
    } catch (error) {
        console.error('Error fetching project members:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});


// Jira API: Post a comment to a specific issue
app.post(
    '/tasks/:id/comment',
    extractCredentials,
    body('comment').isString().notEmpty(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { baseUrl, email, apiToken } = req.jiraCredentials;
        const { comment } = req.body;

        try {
            const response = await axios.post(
                `${baseUrl}/rest/api/2/issue/${req.params.id}/comment`,
                { body: comment },
                {
                    headers: createJiraHeaders({ email, apiToken }),
                }
            );
            res.json(response.data);
        } catch (error) {
            res.status(error.response?.status || 500).json({ error: error.message });
        }
    }
);

// Jira API: Fetch project members from ticket assignees and creators
app.get('/project-members/:projectId', extractCredentials, async (req, res) => {
    const { baseUrl, email, apiToken } = req.jiraCredentials;
    const { projectId } = req.params;

    try {
        const issuesResponse = await axios.get(`${baseUrl}/rest/api/2/search?jql=project=${projectId}`, {
            headers: createJiraHeaders({ email, apiToken }),
        });

        const issues = issuesResponse.data.issues || [];
        const users = new Map();

        issues.forEach((issue) => {
            const { assignee, creator } = issue.fields;
            if (assignee) {
                users.set(assignee.accountId, {
                    name: assignee.displayName,
                    avatarUrl: assignee.avatarUrls['48x48'],
                    accountId: assignee.accountId,
                });
            }
            if (creator) {
                users.set(creator.accountId, {
                    name: creator.displayName,
                    avatarUrl: creator.avatarUrls['48x48'],
                    accountId: creator.accountId,
                });
            }
        });

        res.json(Array.from(users.values()));
    } catch (error) {
        console.error('Error fetching project members:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// Jira API: Fetch tickets for a specific assignee
app.get('/tickets', extractCredentials, async (req, res) => {
    const { baseUrl, email, apiToken } = req.jiraCredentials;
    const { projectId, assigneeId } = req.query;

    try {
        const response = await axios.get(
            `${baseUrl}/rest/api/2/search?jql=project=${projectId} AND assignee=${assigneeId}`,
            { headers: createJiraHeaders({ email, apiToken }) }
        );

        const tickets = response.data.issues.map((issue) => ({
            key: issue.key,
            summary: issue.fields.summary,
            url: `${baseUrl}/browse/${issue.key}`,
        }));

        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error.message);
        res.status(error.response?.status || 500).json({ error: error.message });
    }
});

// 404 Handler for unmatched routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});