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

app.get('/timetable/module/:id', (req, res) => {
    const { id } = req.params; // extract 'id' from URI request
    db.get(`SELECT id, code, name FROM modules WHERE id=?`, id, (err, row) => {
        if(err) {
            console.error('Problem while querying database: ' + err);
            res.status(500) // internal server error
                .setHeader('content-type', 'application/json')
                .send({ error: "Problem while querying database"});
        }
        if(!row) { // true if 'module' not set
            res.status(404)
                .setHeader('content-type', 'application/json')
                .send({ error: "Module not found for id: " + id}); // resource not found
        } else {
            res.status(200)
                .setHeader('content-type', 'application/json')
                .send({ id: `${row.id}`, code: `${row.code}`, name: `${row.name}`});
        }
    });
});

app.get('/timetable/module', (req, res) => {
    const code = req.query.code; // extract 'code' from request
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

app.post('/timetable/module', (req, res) => {
    const posted_module = req.body; // submitted module
    if(!posted_module || !posted_module.code || !posted_module.name) {
        res.status(400) // bad request
            .setHeader('content-type', 'application/json')
            .send({ error: `Module must define a code and name`});
    } else {
        db.run(`INSERT INTO modules (code, name) VALUES (?, ?)`, // id is auto-generated
                [posted_module.code, posted_module.name], function(err) {
            if(err) {
                if(err.code === 'SQLITE_CONSTRAINT') {
                    res.status(409) // resource already exists
                        .setHeader('content-type', 'application/json')
                        .send({ error: `Module already exists: ${posted_module.code}`});
                } else { // other server-side error
                    res.status(500)
                        .setHeader('content-type', 'application/json')
                        .send({ error: "Server error: " + err});
                }
            } else {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({ message: "Module added", code: posted_module.code, id: this.lastID});
            }
        });
    }
});

app.put('/timetable/module/:id', (req, res) => {
    const { id } = req.params; // get id from params
    const posted_module = req.body; // submitted module
    if(!posted_module || !posted_module.code || !posted_module.name) {
        res.status(400) // bad request
            .setHeader('content-type', 'application/json')
            .send({ error: `Module must define a code and name`});
    } else {
        db.get(`SELECT id, code, name FROM modules WHERE id=?`, [id], (err, row) => {
            if(err) {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({ error: "Server error: " + err});
            } else {
                if(!row) { // true if 'module' not set
                    res.status(404)
                        .setHeader('content-type', 'application/json')
                        .send({ error: "Module not found for id: " + id}); // resource not found
                } else { // module found, let's update it
                    db.run(`UPDATE modules SET code=?, name=? WHERE id=?`,
                            [posted_module.code, posted_module.name, id], (err) => {
                        if(err) {
                            if(err.code === 'SQLITE_CONSTRAINT') {
                                res.status(409) // resource already exists
                                    .setHeader('content-type', 'application/json')
                                    .send({ error: `Module already exists: ${posted_module.code}`});
                            } else { // other server-side error
                                res.status(500)
                                    .setHeader('content-type', 'application/json')
                                    .send({ error: "Server error: " + err});
                            }
                        } else {
                            res.status(200)
                                .setHeader('content-type', 'application/json')
                                .send({ message: "Module added: " + posted_module.code});
                        }
                    });
                }
            }
        });
    }
});

app.delete('/timetable/module/:id', (req, res) => {
    const { id } = req.params; // get id from params
    db.run(`DELETE FROM modules WHERE id=?`, [id], function(err) {
        if(err) {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({ error: "Server error: " + err});
        }
        if(this.changes === 0) {
            res.status(404)
                .setHeader('content-type', 'application/json')
                .send({ error: "Module not found for id: " + id});
        } else {
            res.status(200)
            .setHeader('content-type', 'application/json')
            .send({ message: "Module deleted for id: " + id});
        }
    })
});

app.delete('/timetable/module', (req, res) => {
    const code = req.query.code; // look for ?code=... param
    db.run(`DELETE FROM modules WHERE code=?`, [code], function(err) {
        if(err) {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({ error: "Server error: " + err});
        }
        if(this.changes === 0) {
            res.status(404)
                .setHeader('content-type', 'application/json')
                .send({ error: "Module not found: " + code});
        } else {
            res.status(200)
            .setHeader('content-type', 'application/json')
            .send({ message: "Module deleted: " + code});
        }
    })
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    console.log(`Press Ctrl+C to exit...`)
});