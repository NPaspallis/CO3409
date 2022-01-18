const constants = require("./constants.js");
const sqlite3 = require("sqlite3");
const TransactionDatabase = require("sqlite3-transactions").TransactionDatabase;

var db = new sqlite3.Database("db/transactions-demo.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
var tdb = new TransactionDatabase(db); // wrap db inside a transaction database object -> tdb

for(var i = 0; i < constants.LOOPS; i++) {
    var sourceId = Math.floor(Math.random() * constants.MAX_ID) + 1; // random source in [1, MAX_ID]
    var targetId;
    do {
        targetId = Math.floor(Math.random() * constants.MAX_ID) + 1; // random source in [1, MAX_ID]
    } while(sourceId === targetId); // repeat until source and target IDs are different

    transfer_with_transaction(sourceId, targetId);
}

function transfer_with_transaction(sourceId, targetId) {
    console.log(`source: ${sourceId}, targetId: ${targetId}`);

    tdb.beginTransaction(async function(err, transaction) { // BEGIN TRANSACTION

        transaction.get(`SELECT id, balance FROM accounts WHERE id=?`, sourceId, (err, source_row) => {
            console.log(`source id: ${source_row.id}, balance: ${source_row.balance}`);

            if(source_row.balance > 0) {
                // proceed with transfer
                transaction.get(`SELECT id, balance FROM accounts WHERE id=?`, targetId, (err, target_row) => {

                    // update source account - decrease balance by -1
                    transaction.run(`UPDATE accounts SET balance=? WHERE id=?`, [source_row.balance - 1, sourceId], (err) => {
                        if(err) { console.log(`error: ${err}`); }
                    });

                    // update target account - increase balance by +1
                    transaction.run(`UPDATE accounts SET balance=? WHERE id=?`, [target_row.balance + 1, targetId], (err) => {
                        if(err) { console.log(`error: ${err}`); }
                    });

                    // all looks ok, let's commit
                    console.log(`COMMIT: the source (${source_row.id}) w ${source_row.balance} -> (${target_row.id}) w ${target_row.balance}`);
                    transaction.commit((err) => { // COMMIT
                        if(err) console.log(`error: ${err}`);
                    });

                });
            } else {
                //problems, let's rollback
                console.log(`ROLLBACK: the source (${source_row.id}) balance is not positive: ${source_row.balance}`)
                transaction.rollback((err) => { // ROLLBACK
                    if(err) console.log(`error: ${err}`);
                });
            }
        });
    });
}