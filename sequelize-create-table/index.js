const { Sequelize, DataTypes } = require('sequelize'); // import sequelize

const sequelize = new Sequelize({
    dialect: 'sqlite',          // use sqlite dialect...
    storage: 'db/custom-timetable.db'  // ...and point to the DB file
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

async function createTable() {
    await Module.sync();
}

async function addSomeModules() {
    Module.create({code: 'CO2509', name: 'Mobile Computing'});
    Module.create({code: 'CO3409', name: 'Distributed Enterprise Applications'});
    Module.create({code: 'CO3808', name: 'Double Project', compulsory: true});
}

async function printAllModules() {
    var modules = await Module.findAll(); // await forces the code to block until done
    modules.forEach(module => console.log(`id: ${module.id}, code: ${module.code}, name: ${module.name}, compulsory: ${module.compulsory}`));
}

async function deleteAllModules() {
    var modules = await Module.destroy({where: {}, truncate: true}); // delete all entries
}

async function demo() {

    console.log(`-------- START SCENARIO 1 - Create Table if Not exists --------`);
    createTable();
    console.log(`-------- DONE  SCENARIO 1 - Create Table if Not exists --------`);

    // define 'sleep' method to pause execution for X milliseconds
    let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(1000); // sleep 1 second

    console.log(`-------- START SCENARIO 2 - Add Entries --------`);
    addSomeModules();
    console.log(`-------- DONE  SCENARIO 2 - Add Entries --------`);
    
    // define 'sleep' method to pause execution for X milliseconds
    sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(1000); // sleep 1 second

    console.log(`-------- START SCENARIO 3 - Print all Entries --------`);
    printAllModules();
    console.log(`-------- DONE  SCENARIO 3 - Print all Entries --------`);

    // define 'sleep' method to pause execution for X milliseconds
    sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    await sleep(1000); // sleep 1 second

    console.log(`-------- START SCENARIO 4 - Delete all Entries --------`);
    deleteAllModules();
    console.log(`-------- DONE  SCENARIO 4 - Delete all Entries --------`);
}

demo();