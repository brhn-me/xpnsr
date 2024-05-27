const express = require('express');
const mysql2 = require('mysql2');
const json2csv = require('json-2-csv');
const fs = require('fs');
const util = require('util');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';

const app = express();

const db = mysql2.createConnection({
    host: '127.0.0.1',
    port: '3306',
    database: 'xpnsr',
    user: 'root',
    password: '123456'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1);
    }
    console.log('Database connected successfully');
});

const query = util.promisify(db.query).bind(db);
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

app.get('/generate/report/bills', async (req, res) => {
    try {
        const rows = await query("SELECT CONCAT(u.first_name, ' ', u.last_name) AS User, b.amount Amount, b.tenure Days, c.name Category FROM bills b INNER JOIN categories c ON c.id = b.category_id INNER JOIN users u ON u.id = b.user_id;");
        const csv = await json2csv.json2csv(rows);
        const filename = `bills-export-${new Date().getTime()}.csv`;
        await writeFile(filename, csv);
        res.download(filename, async () => {
            await unlink(filename);
        });
    } catch (err) {
        console.error('Error generating bills report:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/generate/report/budgets', async (req, res) => {
    try {
        const rows = await query("SELECT CONCAT(u.first_name, ' ', u.last_name) AS User, b.title Title, b.amount Amount, b.currency Currency, c.name Category, b.description Description FROM budgets b INNER JOIN categories c ON c.id = b.category_id INNER JOIN users u ON u.id = b.user_id;");
        const csv = await json2csv.json2csv(rows);
        const filename = `budgets-export-${new Date().getTime()}.csv`;
        await writeFile(filename, csv);
        res.download(filename, async () => {
            await unlink(filename);
        });
    } catch (err) {
        console.error('Error generating budgets report:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/generate/report/transactions', async (req, res) => {
    try {
        const rows = await query("SELECT CONCAT(u.first_name, ' ', u.last_name) AS User, t.amount Amount, t.title Title, t.description Description, t.due Due, t.date Date, t.city City, t.country Country, c.name \"Primary Category\", t.secondary_category_id \"Secondary Category\" FROM transactions t INNER JOIN categories c ON c.id = t.primary_category_id INNER JOIN users u ON u.id = t.user_id;");
        const csv = await json2csv.json2csv(rows);
        const filename = `transactions-export-${new Date().getTime()}.csv`;
        await writeFile(filename, csv);
        res.download(filename, async () => {
            await unlink(filename);
        });
    } catch (err) {
        console.error('Error generating transactions report:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`The auxiliary api to export data as csv and excel is running at: ${HOST}:${PORT}`);
});