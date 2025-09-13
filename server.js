// Import required modules
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
// Loads environment variables from a .env file for local development

// Create an Express application
const app = express();
// The hosting provider (Render) sets the PORT variable. We use 3000 as a fallback.
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// --- CRITICAL CHANGE FOR DEPLOYMENT ---
// The connection details are now read from Environment Variables, not hardcoded.
// This is secure and flexible.
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // PlanetScale requires a secure connection, so we enable SSL.
    ssl: {
        rejectUnauthorized: true
    }
});

// --- API ENDPOINTS ---

/**
 * GET /api/partners/:id
 * Fetches a single channel partner and all their associated documents.
 */
app.get('/api/partners/:id', async (req, res) => {
    // ... (This route is likely working fine, no changes needed)
    const partnerId = req.params.id;
    try {
        const [partnerRows] = await dbPool.query('SELECT * FROM channel_partners WHERE id = ?', [partnerId]);
        if (partnerRows.length === 0) {
            return res.status(404).json({ message: 'Partner not found' });
        }
        const partner = partnerRows[0];
        const [documentRows] = await dbPool.query('SELECT * FROM partner_documents WHERE partner_id = ?', [partnerId]);
        const responseData = { ...partner, documents: documentRows };
        res.json(responseData);
    } catch (error) {
        console.error('Failed to fetch partner:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * PATCH /api/partners/:id/decision (Official Use Only)
 */
app.patch('/api/partners/:id/decision', async (req, res) => {
    // ... (No changes needed for this route)
    const partnerId = req.params.id;
    const { final_decision, final_decision_reason } = req.body;
    if (!final_decision || !['Approved', 'Rejected'].includes(final_decision)) {
        return res.status(400).json({ message: "Invalid 'final_decision'. Must be 'Approved' or 'Rejected'." });
    }
    try {
        const query = 'UPDATE channel_partners SET final_decision = ?, final_decision_reason = ?, approval_date = NOW() WHERE id = ?';
        const [result] = await dbPool.query(query, [final_decision, final_decision_reason, partnerId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Partner not found' });
        }
        res.json({ message: `Partner final decision updated to ${final_decision}` });
    } catch (error) {
        console.error('Failed to update final decision:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * NEW & IMPROVED ENDPOINT
 * PATCH /api/partners/:id/section-status
 */
app.patch('/api/partners/:id/section-status', async (req, res) => {
    const partnerId = req.params.id;
    const { section, status, reason } = req.body;

    // --- ADD THIS LOGGING FOR DEBUGGING ---
    console.log(`--- New PATCH request for partner ID: ${partnerId} ---`);
    console.log('Received body:', req.body);
    // ---

    const validSections = [
        'applicant_details', 
        'current_address', 
        'permanent_address', 
        'kyc_documents', 
        'banking_details'
    ];
    
    if (!section || !validSections.includes(section)) {
        console.error('Validation failed: Invalid section provided.');
        return res.status(400).json({ message: `Invalid 'section' provided. Must be one of: ${validSections.join(', ')}` });
    }

    if (!status || !['Approved', 'Rejected'].includes(status)) {
        console.error('Validation failed: Invalid status provided.');
        return res.status(400).json({ message: "Invalid 'status' provided. Must be 'Approved' or 'Rejected'." });
    }

    const statusColumn = `${section}_status`;
    const reasonColumn = `${section}_reason`;

    try {
        const updateQuery = `
            UPDATE channel_partners 
            SET ${mysql.escapeId(statusColumn)} = ?, ${mysql.escapeId(reasonColumn)} = ? 
            WHERE id = ?
        `;
        
        // --- ADD THIS LOGGING FOR DEBUGGING ---
        console.log('Executing SQL:', updateQuery.trim().replace(/\s+/g, ' '));
        
        const [result] = await dbPool.query(updateQuery, [status, reason, partnerId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Partner not found' });
        }

        console.log('Update successful!');
        res.json({ message: `Section '${section}' for partner ${partnerId} has been updated to '${status}'.` });

    } catch (error) {
        // **This will now log the specific database error to your terminal**
        console.error(`--- SQL ERROR for section ${section} ---:`, error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


