const express = require('express');
const mysql2 = require('mysql2');
const json2csv = require('json-2-csv');
const xl = require('excel4node');
const fs = require('fs');

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

app.get('/generate/report/bills', (req, res) => {
    db.query("SELECT CONCAT(u.first_name, ' ', u.last_name) AS User, b.amount Amount, b.tenure Days, c.name Category FROM bills b INNER JOIN categories c ON c.id = b.category_id INNER JOIN users u ON u.id = b.user_id;", async (err, rows, fields) => {
        const csv = await json2csv.json2csv(rows);
        const filename = `bills-export-${new Date().getTime()}.csv`;
        fs.writeFile(filename, csv, (err) => {
            res.download(filename, () => {    
                fs.unlinkSync(filename);
            });
        });
    });
});

app.get('/generate/report/budgets', (req, res) => {
    db.query("SELECT CONCAT(u.first_name, ' ', u.last_name) AS User, b.title Title, b.amount Amount, b.currency Currency, c.name Category, b.description Description FROM budgets b INNER JOIN categories c ON c.id = b.category_id INNER JOIN users u ON u.id = b.user_id;", async (err, rows, fields) => {
        const csv = await json2csv.json2csv(rows);
        const filename = `budgets-export-${new Date().getTime()}.csv`;
        fs.writeFile(filename, csv, (err) => {
            res.download(filename, () => {    
                fs.unlinkSync(filename);
            });
        });
    });
});

app.get('/generate/report/transactions', (req, res) => {
    db.query("SELECT CONCAT(u.first_name, ' ', u.last_name) AS User, t.amount Amount, t.title Title, t.description Description, t.due Due, t.date Date, t.city City, t.country Country, c.name \"Primary Category\", t.secondary_category_id \"Secondary Category\" FROM transactions t INNER JOIN categories c ON c.id = t.primary_category_id INNER JOIN users u ON u.id = t.user_id;", async (err, rows, fields) => {
        const csv = await json2csv.json2csv(rows);
        const filename = `transactions-export-${new Date().getTime()}.csv`;
        fs.writeFile(filename, csv, (err) => {
            res.download(filename, () => {    
                    fs.unlinkSync(filename);
                });
        });
    });
});

app.listen(PORT, () => {
    console.log(`The auxiliary api to export data as csv and excel is running at: ${HOST}:${PORT}`);
});