const { Sequelize, DataTypes } = require('sequelize'); // import sequelize

const sequelize = new Sequelize({
    dialect: 'sqlite',          // use sqlite dialect...
    storage: 'db/timetable.db'  // ...and point to the DB file
});

// Sequelize Model

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

const Room = sequelize.define('Room', {
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
    description: {
        type: DataTypes.STRING
    },
    capacity: {
        type: DataTypes.INTEGER
    },
    type: {
        type: DataTypes.STRING
    },
    floor: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'rooms', // table name
    timestamps: false // skip custom timestamp columns
});

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.INTEGER,
        require: true,
        primaryKey: true,
        autoIncrement: true
    },
    moduleId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    roomId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    day: {
        type: DataTypes.STRING
    },
    start: {
        type: DataTypes.INTEGER
    },
    finish: {
        type: DataTypes.INTEGER
    }
}, {
    tableName: 'sessions', // table name
    timestamps: false // skip custom timestamp columns
});

// ======== API Calls ======== //

const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// ======== Modules API Calls ======== //

app.get('/timetable/modules', (req, res) => {
    Module.findAll()
        .then(modules => {
            res.status(200)
                .setHeader('content-type', 'application/json')
                .send(modules); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

app.get('/timetable/module/:code', (req, res) => {
    const { code } = req.params; // extract 'code' from request
    Module.findOne({where: {code: code}})
        .then(module => {
            if(module) {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send(module); // body is JSON
            } else { // module not found
                res.status(404)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Module not found for code: ${code}`});
            }
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

app.post('/timetable/module', (req, res) => {
    const posted_module = req.body; // submitted module
    if(!posted_module || !posted_module.code) { // invalid module posted
        res.status(400)
            .setHeader('content-type', 'application/json')
            .send({error: `Bad request - must post a proper Module in JSON`}); // bad request
    } else {
        Module.create({code: posted_module.code, name: posted_module.name, compulsory: posted_module.compulsory})
            .then(module => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Module added`, module: module}); // body is JSON
            })
            .catch(error => {
                if(error.name === 'SequelizeUniqueConstraintError') {
                    res.status(409)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Module already exists for code: ${posted_module.code}`}); // resource already exists
                } else {
                    res.status(500)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Server error: ${error.name}`});
                }
            });
    }
});

app.delete('/timetable/module/:code', (req, res) => {
    const { code } = req.params;
    Module.findOne({where: {code: code}})
        .then(module => {
            if(module) { // module found
                module.destroy()
                    .then(deleted_module => {
                        res.status(200)
                            .setHeader('content-type', 'application/json')
                            .send({ message: `Module deleted: ${code}`});
                    })
                    .catch(error => {
                        res.status(500)
                            .setHeader('content-type', 'application/json')
                            .send({error: `Server error: ${error.name}`});
                    });
            } else { // module not found
                res.status(404)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Module not found for code: ${code}`});
            }
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

// ======== Rooms API Calls ======== //

app.get('/timetable/rooms', (req, res) => {
    Room.findAll()
        .then(rooms => {
            res.status(200)
                .setHeader('content-type', 'application/json')
                .send(rooms); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

app.get('/timetable/room/:code', (req, res) => {
    const { code } = req.params; // extract 'code' from request
    Room.findOne({where: {code: code}})
        .then(room => {
            if(room) {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send(room); // body is JSON
            } else { // room not found
                res.status(404)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Room not found for code: ${code}`});
            }
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

app.post('/timetable/room', (req, res) => {
    const posted_room = req.body; // submitted room
    if(!posted_room || !posted_room.code) { // invalid room posted
        res.status(400)
            .setHeader('content-type', 'application/json')
            .send({error: `Bad request - must post a proper Room in JSON`}); // bad request
    } else {
        Room.create({code: posted_room.code, description: posted_room.description, capacity: posted_room.capacity,
                type: posted_room.type, floor: posted_room.floor})
            .then(room => {
                res.status(200)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Room added`, room: room}); // body is JSON
            })
            .catch(error => {
                if(error.name === 'SequelizeUniqueConstraintError') {
                    res.status(409)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Room already exists for code: ${posted_room.code}`}); // resource already exists
                } else {
                    res.status(500)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Server error: ${error.name}`});
                }
            });
    }
});

app.delete('/timetable/room/:code', (req, res) => {
    const { code } = req.params;
    Room.findOne({where: {code: code}})
        .then(room => {
            if(room) { // room found
                room.destroy()
                    .then(deleted_room => {
                        res.status(200)
                            .setHeader('content-type', 'application/json')
                            .send({ message: `Room deleted: ${code}`});
                    })
                    .catch(error => {
                        res.status(500)
                            .setHeader('content-type', 'application/json')
                            .send({error: `Server error: ${error.name}`});
                    });
            } else { // room not found
                res.status(404)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Room not found for code: ${code}`});
            }
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});


// ======== Sessions API Calls ======== //

app.get('/timetable/sessions', (req, res) => {
    const moduleId = req.query.moduleId; // extract 'moduleId' from request
    const roomId = req.query.roomId; // extract 'roomId' from request
    // form the 'where' condition dynamically, based on the module/room query params
    let whereCondition = { where: {}}; // initially empty = fetch all
    if(moduleId) { // if moduleId specified, add it to the 'where' condition
        whereCondition.where.moduleId = moduleId;
    }
    if(roomId) { // if roomId specified, add it to the 'where' condition
        whereCondition.where.roomId = roomId;
    }
    // print 'where' condition for debugging purposes
    console.info(`moduleId: ${moduleId}, roomId: ${roomId} --> whereCondition: ${JSON.stringify(whereCondition)}`);
    Session.findAll(whereCondition)
        .then(sessions => {
            res.status(200)
                .setHeader('content-type', 'application/json')
                .send(sessions); // body is JSON
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

// required to use Sequelize operators
// see here for more info: https://sequelize.org/master/manual/model-querying-basics.html
const { Op } = require("sequelize");

app.post('/timetable/session', (req, res) => {
    const posted_session = req.body; // submitted session
    if(!posted_session || !posted_session.moduleId || !posted_session.roomId
            || !posted_session.day || !posted_session.start || !posted_session.finish) { // invalid session posted
        res.status(400)
            .setHeader('content-type', 'application/json')
            .send({error: `Bad request - must post a proper Session in JSON`}); // bad request
    } else {
        // check if room is available for given day/start/finish
        Session.findAll({where: {
            roomId: posted_session.roomId,
            day: posted_session.day,
            start: { [Op.lt]: posted_session.finish }, // sessions that start before the new session finishes...
            finish: { [Op.gt]: posted_session.start }  // ... and finish after the new session starts
        }})
        .then(sessions => { // if such a session exists, it means the room is not available
            if(sessions.length == 0) { // empty = no conflicts
                Session.create({moduleId: posted_session.moduleId, roomId: posted_session.roomId,
                        day: posted_session.day, start: posted_session.start, finish: posted_session.finish})
                    .then(session => {
                        res.status(200)
                            .setHeader('content-type', 'application/json')
                            .send({message: `Session added`, session: session}); // body is JSON
                    })
                    .catch(error => {
                        res.status(500)
                            .setHeader('content-type', 'application/json')
                            .send({error: `Server error: ${error.name}`});
                    });
            } else { // conflict with room availability
                res.status(409)
                    .setHeader('content-type', 'application/json')
                    .send(`Session not added - conflict with room availability`); // body is JSON
            }
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
            });
    }
});

app.put('/timetable/session/:id', (req, res) => {
    const { id } = req.params; // get id from URI
    const posted_session = req.body; // submitted session
    if(!posted_session || !posted_session.moduleId || !posted_session.roomId
            || !posted_session.day || !posted_session.start || !posted_session.finish) { // invalid session posted
        res.status(400)
            .setHeader('content-type', 'application/json')
            .send({error: `Bad request - must post a proper Session in JSON`}); // bad request
    } else {
        Session.findOne({id: id})
            .then(session => {
                if(!session) { // session not found for given id
                    res.status(404)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Session not found for id: ${id}`}); // bad request
                } else {
                    // check if room is available for given day/start/finish
                    Session.findAll({where: {
                        roomId: posted_session.roomId,
                        day: posted_session.day,
                        start: { [Op.lt]: posted_session.finish }, // sessions that start before the new session finishes...
                        finish: { [Op.gt]: posted_session.start }  // ... and finish after the new session starts
                    }})
                    .then(sessions => { // if such a session exists, it means the room is not available
                        if(sessions.length == 0) { // empty = no conflicts
                            // update the session ...
                            session.moduleId = posted_session.moduleId;
                            session.roomId = posted_session.roomId;
                            session.day = posted_session.day;
                            session.start = posted_session.start;
                            session.finish = posted_session.finish;
                            // and save it
                            session.save()
                                .then(s => {
                                    res.status(200)
                                        .setHeader('content-type', 'application/json')
                                        .send({message: `Session updated`, session: s}); // body is JSON
                                })
                                .catch(error => {
                                    res.status(500)
                                        .setHeader('content-type', 'application/json')
                                        .send({error: `Server error: ${error.name}`});
                                });
                        } else { // conflict with room availability
                            res.status(409)
                                .setHeader('content-type', 'application/json')
                                .send(`Session not added - conflict with room availability`); // body is JSON
                            }
                    })
                    .catch(error => {
                        res.status(500)
                        .setHeader('content-type', 'application/json')
                        .send({error: `Server error: ${error.name}`});
                    });
                }
            })
            .catch(error => {
                res.status(500)
                    .setHeader('content-type', 'application/json')
                    .send({error: `Server error: ${error.name}`});
            });
    }
});

app.delete('/timetable/session/:id', (req, res) => {
    const { id } = req.params;
    Session.findOne({where: {id: id}})
        .then(session => {
            if(session) { // session found
                session.destroy()
                    .then(deleted_session => {
console.debug(`deleted: ${JSON.stringify(deleted_session)}`);//todo delete
                        res.status(200)
                            .setHeader('content-type', 'application/json')
                            .send({ message: `Session deleted: ${id}`});
                    })
                    .catch(error => {
                        res.status(500)
                            .setHeader('content-type', 'application/json')
                            .send({error: `Server error: ${error.name}`});
                    });
            } else { // session not found
                res.status(404)
                    .setHeader('content-type', 'application/json')
                    .send({message: `Session not found for id: ${id}`});
            }
        })
        .catch(error => {
            res.status(500)
                .setHeader('content-type', 'application/json')
                .send({error: `Server error: ${error.name}`});
        });
});

// start API server

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    console.log(`Press Ctrl+C to exit...`)
});