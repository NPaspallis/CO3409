const sqlite3 = require('sqlite3').verbose(); // include sqlite library

let db = new sqlite3.Database('./db/demo.db', (err) => { // file-based database
    if (err) { // if set then error, else if null, no error
      return console.error(err.message);
    }
    console.log('Connected to the file-based SQlite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT NOT NULL)`);
    
    db.run(`INSERT INTO test (name) VALUES (?)`, ['Hello']);
    db.run(`INSERT INTO test (name) VALUES (?)`, ['World!']);
    
    db.each(`SELECT id, name FROM test`, (err, row) => {
        if(err) {
            console.error('Problem while querying database: ' + err);
        }
        console.log(row.id + ' -> ' + row.name);
    });
});

db.close((err) => { // it is a good practice to close the database when done
    if (err) { // if set then error, else if null, no error
        return console.error(err.message);
      }
      console.log('Disconnected and closed SQlite database.');
});