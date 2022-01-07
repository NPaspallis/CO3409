const sqlite3 = require('sqlite3').verbose(); // include sqlite library

let db = new sqlite3.Database('./db/timetable.db', (err) => { // file-based database
    if (err) { // if set then error, else if null, no error
      return console.error(err.message);
    }
    console.log('Connected to the file-based SQlite database.');
});

const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/timetable/modules', (req, res) => {
    var modules = []; // initially, empty array
    db.all(`SELECT id, code, name FROM modules`, (err, rows) => {
        if(err) {
            console.error('Problem while querying database: ' + err);
            res.status(500) // internal server error
                .setHeader('content-type', 'application/json')
                .send({ error: "Problem while querying database"});
        } 
        rows.forEach(row =>
            modules.push({ id: `${row.id}`, code: `${row.code}`, name: `${row.name}`}));
        res.status(200)
            .setHeader('content-type', 'application/json')
            .send(modules); // body is JSON
    });
});

app.get('/timetable/modules/:code', (req, res) => {
    const { code } = req.params; // extract 'code' from request
    db.get(`SELECT id, code, name FROM modules WHERE code=?`, [code], (err, row) => {
        if(err) {
            console.error('Problem while querying database: ' + err);
            res.status(500) // internal server error
                .setHeader('content-type', 'application/json')
                .send({ error: "Problem while querying database"});
        }
        if(!row) { // true if 'module' not set
            res.status(404)
                .setHeader('content-type', 'application/json')
                .send({ error: "Module not found: " + code}); // resource not found
        } else {
            res.status(200)
                .setHeader('content-type', 'application/json')
                .send({ id: `${row.id}`, code: `${row.code}`, name: `${row.name}`});
        }
    });
});

app.post('/timetable/modules/:code', (req, res) => {
    const { code } = req.params; // parameter extracted from URI
    const posted_module = req.body; // submitted module
    db.run(`INSERT INTO modules (code, name) VALUES (?, ?)`, // id is auto-generated
                [posted_module.code, posted_module.name], (err) => {
        if(err) {
            if(err.code === 'SQLITE_CONSTRAINT') {
                res.status(409) // resource already exists
                    .setHeader('content-type', 'application/json')
                    .send({ error: "Module already exists: " + code});
            } else { // other server-side error
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({ error: "Server error: " + err});
            }
            return; // terminate call
        }
        res.status(200)
            .setHeader('content-type', 'application/json')
            .send({ message: "Module added: " + code});
    });
});

app.delete('/timetable/modules/:code', (req, res) => {
    const { code } = req.params;
    db.run(`DELETE FROM modules WHERE code=?`, [code], function(err) {
        console.log(`this: ${JSON.stringify(this)}`);

        if(err) {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({ error: "Server error: " + err});
        }
        if(this.changes === 0) {
            console.log('Module not found: ' + code);
            res.status(404)
                .setHeader('content-type', 'application/json')
                .send({ error: "Module not found: " + code});
        } else {
            res.status(200)
            .setHeader('content-type', 'application/json')
            .send({ message: "Module deleted: " + code});
        }
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    console.log(`Press Ctrl+C to exit...`)
});