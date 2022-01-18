const constants = require("./constants.js");
const sqlite3 = require("sqlite3");

let db = new sqlite3.Database("db/transactions-demo.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

for(var i = 0; i < constants.LOOPS; i++) {
    var sourceId = Math.floor(Math.random() * constants.MAX_ID) + 1; // random source in 1...MAX_ID
    var targetId;
    do {
        targetId = Math.floor(Math.random() * constants.MAX_ID) + 1; // random source in 1...MAX_ID
    } while(sourceId === targetId); // repeat until source and target IDs are different

    transfer_with_no_transaction(sourceId, targetId);
}

function transfer_with_no_transaction(sourceId, targetId) {
    console.log(`source: ${sourceId}, targetId: ${targetId}`);

    db.get(`SELECT id, balance FROM accounts WHERE id=?`, sourceId, (err, source_row) => {
        if(source_row.balance > 0) {
            db.get(`SELECT id, balance FROM accounts WHERE id=?`, targetId, (err, target_row) => {
                // update source account - decrease balance by -1
                db.run(`UPDATE accounts SET balance=? WHERE id=?`, [source_row.balance - 1, source_row.id], (err) => {
                    if(err) { console.log(`error: ${err}`); }
                });
                // update target account - increase balance by +1
                db.run(`UPDATE accounts SET balance=? WHERE id=?`, [target_row.balance + 1, target_row.id], (err) => {
                    if(err) { console.log(`error: ${err}`); }
                });
            });
        } else {
            console.log(`SKIP: the source (${sourceId}) balance is not positive: ${source_row.balance}`)
        }
    });
}