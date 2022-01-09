const { Sequelize, DataTypes } = require('sequelize'); // import sequelize

const sequelize = new Sequelize({
    dialect: 'sqlite',          // use sqlite dialect...
    storage: 'db/timetable.db'  // ...and point to the DB file
});

const Module = sequelize.define('Module', {
    id: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING
    },
    compulsory: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'modules', // table name
    timestamps: false // skip custom timestamp columns
});

async function printAllModules1() {
    console.log(`1a. Right before getting the modules - blocking`)
    var modules = await Module.findAll(); // await forces the code to block until done
    console.log(`1b. Ok, got the modules`)
    modules.forEach(module => console.log(`id: ${module.id}, code: ${module.code}, name: ${module.name}, compulsory: ${module.compulsory}`));
    console.log(`1c. Modules printed`)
    console.log(`1x. Next command`)
}

function printAllModules2() {
    console.log(`2a. Right before getting the modules - call queued`)
    Module.findAll().then(modules => {
        console.log(`2b. Ok, got the modules`)
        modules.forEach(module => console.log(`id: ${module.id}, code: ${module.code}, name: ${module.name}, compulsory: ${module.compulsory}`));
        console.log(`2c. Modules printed`)
    });
    console.log(`2x. Next command`)
}

async function getModuleByCode1(c) {
    return await Module.findOne({ where: {code: c}});
}

function getModuleByCode2(c) {
    Module.findOne({ where: {code: c}})
        .then(m => {
            console.log(`got module: ${m.id} -> ${m.code} : ${m.name}`);
        })
        .catch(error => {
            console.log(`could not find module for code: ${c}`);
        });
}

async function createModule1(c, n) {
    var m = await Module.create({ code: c, name: n});
    console.log(`created module for id: ${m.id} -> ${c} : ${n}`);
}

function createModule2(c, n) {
    Module.create({ code: c, name: n})
        .then(m => {
            console.log(`created module for id: ${m.id} -> ${c} : ${n}`);
        })
        .catch(error => {
            console.log(`Error while inserting module ${c}: ${error}`);
        });
}

async function deleteModule1(c) {
    let rowsDeleted = await Module.destroy({where: {code: c}});
    console.log(`deleted ${rowsDeleted} rows for code: ${c}`);
}

function deleteModule2(c) {
    Module.destroy({where: {code: c}})
        .then(rowsDeleted => {
            console.log(`deleted ${rowsDeleted} modules for code: ${c}`);
        })
        .catch(error => {
            console.log(`error while deleting module ${c}: ${error}`);
        });
}

async function demo() {

    console.log(`-------- START SCENARIO 1 --------`);
    printAllModules1();
    console.log(`-------- DONE  SCENARIO 1 --------`);

    // define 'sleep' method to pause execution for X milliseconds
    let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(1000); // sleep 1 second

    console.log(`-------- START SCENARIO 2 --------`);
    printAllModules2();
    console.log(`-------- DONE  SCENARIO 2 --------`);

    await sleep(1000); // sleep 1 second

    console.log(`-------- START SCENARIO 3 --------`);
    let m = await getModuleByCode1('CO3409').catch(error => {
        console.log(`could not find module for code: ${CO3409}`);
    });
    console.log(`got module: ${m.id} -> ${m.code} : ${m.name}`);
    console.log(`-------- DONE  SCENARIO 3 --------`);

    await sleep(1000); // sleep 1 second

    console.log(`-------- START SCENARIO 4 --------`);
    getModuleByCode2('CO9999');
    console.log(`-------- DONE  SCENARIO 4 --------`);

    await sleep(1000); // sleep 1 second

    console.log(`-------- START SCENARIO 5 --------`);
    let c = 'CO4755', n = 'Mobile Application Development';
    createModule1(c, n).catch(error => {
        console.log(`Error while inserting module ${c}: ${error}`);
    });
    console.log(`-------- DONE  SCENARIO 5 --------`);

    await sleep(1000); // sleep 1 second

    console.log(`-------- START SCENARIO 6 --------`);
    createModule2('CO4752', 'Web Application Development');
    console.log(`-------- DONE  SCENARIO 6 --------`);

    await sleep(1000); // sleep 1 second

    console.log(`-------- START SCENARIO 7 --------`);
    deleteModule1('CO4752');
    console.log(`Deleted module with code: CO4752`);
    console.log(`-------- DONE  SCENARIO 7 --------`);

    await sleep(1000); // sleep 1 second

    console.log(`-------- START SCENARIO 8 --------`);
    deleteModule2('CO9999');
    console.log(`Deleted module with code: CO9999`);
    console.log(`-------- DONE  SCENARIO 8 --------`);

    await sleep(1000); // sleep 1 second

    console.log(`-------- START SCENARIO 9 --------`);
    console.log(`Create, update, then delete module`);
    let advProgr = await Module.create({code: 'CO2402', name: 'Advanced Programming'});
    console.log(`created: ${advProgr.id} -> ${advProgr.code} : ${advProgr.name}`);
    advProgr.name = 'Advanced Programming with C++'; // DB still has old value
    await advProgr.save(); // now DB has new value
    advProgr = await Module.findOne({where: {code: 'CO2402'}});
    console.log(`updated: ${advProgr.id} -> ${advProgr.code} : ${advProgr.name}`);
    await advProgr.destroy(); // finally delete from DB
    console.log(`module deleted from DB: ${advProgr.code}`);
    console.log(`-------- DONE  SCENARIO 9 --------`);
}

demo();