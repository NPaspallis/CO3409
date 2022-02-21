const { Sequelize, DataTypes, Model, NOW } = require('sequelize'); // import sequelize

const sequelize = new Sequelize({
    dialect: 'sqlite', // use sqlite dialect...
    storage: 'db/library.db' // ...and point to the DB file (will be created if needed)
});

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
        autoIncrement: true
    },
    name: DataTypes.STRING,
    yob: {
        type: DataTypes.INTEGER,
        validate: {
            min: 1900,
            max: 2022
        }
    }
}, {
    tableName: 'students', // table name
    timestamps: false // skip custom timestamp columns
});

async function init() {
    await sequelize.sync(); // create all tables, if needed
}

init();

const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.json()); // this is required for the POST-ed data to be read as JSON objects

app.delete(`/students`, (req,res) => {
    Student.destroy({where: {}});
    res.status(200) // set the status code to 200 (OK)
        .setHeader(`content-type`, `application/json`)
        .send({status: `OK`});
});

app.get('/students', (req, res) => {
    allStudents = Student.findAll().then(allStudents => {
        res.status(200) // set the status code to 200 (OK)
            .setHeader(`content-type`, `application/json`)
            .send({status: `OK`, students: allStudents});
    }).catch(error => {
        res.status(500) // set the status code to 500 (Internal server error)
            .setHeader(`content-type`, `application/json`)
            .send({status: `ERROR`, message: `Internal error while querying students: ${error}`})
    });
});

app.get('/student/:id', (req, res) => {
    const { id } = req.params;
    Student.findByPk(id).then(student => {
        if(student) { // student set
            res.status(200) // set the status code to 200 (OK)
                .setHeader(`content-type`, `application/json`)
                .send({status: `OK`, student: student});
        } else { // student not found
            res.status(404) // set the status code to 404 (Not found)
                .setHeader(`content-type`, `application/json`)
                .send({status: `ERROR`, message: `Student not found for id: ${id}`});
        }
    }).catch(error => { // Sequelize error
        res.status(500) // set the status code to 500 (Internal server error)
        .setHeader(`content-type`, `application/json`)
        .send({status: `ERROR`, message: `Internal error while querying student: ${error}`})
    });
});

app.get('/student', (req, res) => { // search by name, expects /student?name=...
    const name = req.query.name;
    if(name) {
        Student.findAll({ where: { name: { [Sequelize.Op.like]: `%${name}%`}}}).then(allStudents => { // search for students where name LIKE %name%
            res.status(200) // set the status code to 200 (OK)
                .setHeader(`content-type`, `application/json`)
                .send({status: `OK`, students: allStudents});
        }).catch(error => {
            res.status(500) // set the status code to 500 (Internal server error)
                .setHeader(`content-type`, `application/json`)
                .send({status: `ERROR`, message: `Internal error while querying students: ${error}`})
        });
    } else {
        res.status(422) // set the status code to 422 (Missing or invalid parameters)
            .setHeader(`content-type`, `application/json`)
            .send({status: `ERROR`, message: `Invalid or missing query: name`});
    }
});

app.post(`/student`, (req, res) => {
    const posted_student = req.body
    // check request
    if(posted_student && posted_student.name && posted_student.yob && Number.isInteger(posted_student.yob)) {
        if(posted_student.yob >= 1900 && posted_student.yob <= 2022) {
            Student.create(posted_student).then(created_student => {
                res.status(200) // set the status code to 200 (OK)
                    .setHeader(`content-type`, `application/json`)
                    .send({status: `OK`, id: created_student.id});
            }).catch(error => {
                res.status(500) // set the status code to 500 (Internal server error)
                    .setHeader(`content-type`, `application/json`)
                    .send({status: `ERROR`, message: `Internal error while creating student: ${error}`})
            });
        } else {
            res.status(422) // set the status code to 422 (Missing or invalid parameters)
                .setHeader(`content-type`, `application/json`)
                .send({status: `ERROR`, message: `Invalid data - yob must be in the range [1900-2022]: ${posted_student.yob}`});
        }
    } else { // either the payload is not set or one of the params is not set
        res.status(422) // set the status code to 422 (Missing or invalid parameters)
            .setHeader(`content-type`, `application/json`)
            .send({status: `ERROR`, message: `Invalid or missing data payload`});
    }
});

app.put(`/student/:id`, (req, res) => {
    const { id } = req.params;
    const posted_student = req.body
    Student.findByPk(id).then(student => {
        if(student) {
            // check request
            if(posted_student && (!posted_student.id || posted_student.id==id)) {
                if(posted_student.yob >= 1900 && posted_student.yob <= 2022) {
                    student.update(posted_student).then().catch(err2 => console.log(`update error: ${err2}`));
                    res.status(200) // set the status code to 200 (OK)
                        .setHeader(`content-type`, `application/json`)
                        .send({status: `OK`, student: student});
                } else {
                    res.status(422) // set the status code to 422 (Missing or invalid parameters)
                        .setHeader(`content-type`, `application/json`)
                        .send({status: `ERROR`, message: `Invalid data - yob must be in the range [1900-2022]: ${posted_student.yob}`});
                }
            } else {
                res.status(422) // set the status code to 422 (Missing or invalid parameters)
                    .setHeader(`content-type`, `application/json`)
                    .send({status: `ERROR`, message: `Invalid or missing data payload: ${posted_student}`});
            }
        } else {
            res.status(404) // set the status code to 404 (Not found)
                .setHeader(`content-type`, `application/json`)
                .send({status: `ERROR`, message: `Student not found for id: ${id}`});
        }
    }).catch(error => {
        res.status(500) // set the status code to 500 (Internal server error)
            .setHeader(`content-type`, `application/json`)
            .send({status: `ERROR`, message: `Internal error while updating student: ${error}`})
    });
});

app.listen(PORT, () => {
    console.log(`Library server app listening at: https:\\localhost:${PORT}`)
    console.log(`Press CTRL+C to exit ...`)
})