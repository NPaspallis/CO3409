const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

var timetable_data = {
    modules: [
        {id: 1, code: "CO3409", name: "Distributed Enterprise Applications"},
        {id: 2, code: "CO2509", name: "Mobile Computing"}
    ],
    rooms: [
        {id: 1, code: "120", descriptiom: "Standard Lecture Room", capacity: 20,
            type: "Lecture Room", floor: 1},
        {id: 2, code: "014", description: "Main Computer Lab", capacity: 32,
            type: "Computer Lab", floor: 0},
        {id: 3, code: "113", description: "Secondary Computer Lab", capacity: 16,
            type: "Computer Lab", floor: 1},
        {id: 4, code: "B036", description: "Inspire Lab", capacity: 12,
            type: "Research Lab", floor: -1}
    ],
    sessions: [
        {id: 1, moduleId: 1, roomId: 1, day: "Tuesday", start: 5, finish: 6},
        {id: 2, moduleId: 1, roomId: 3, day: "Tuesday", start: 6, finish: 7},
        {id: 3, moduleId: 2, roomId: 1, day: "Wednesday", start: 11, finish: 12},
        {id: 4, moduleId: 2, roomId: 2, day: "Wednesday", start: 12, finish: 13}
    ]
}

app.get('/timetable/modules', (req, res) => {
    res.status(200)
        .setHeader('content-type', 'application/json')
        .send(timetable_data.modules); // body is JSON
});

app.get('/timetable/modules/:code', (req, res) => {
    const { code } = req.params; // extract 'code' from request
    // find 'module' by iterating 'modules' and checking their 'code'
    var module = timetable_data.modules.find(m => m.code === code);
    if(!module) { // true if 'module' not set
        res.status(404).send(); // resource not found
    } else {
        res.status(200)
            .setHeader('content-type', 'application/json')
            .send(module);
    }
});

app.post('/timetable/modules/:code', (req, res) => {
    const { code } = req.params;
    var module = timetable_data.modules.find(m => m.code === code);
    if(module) { // true if 'module' set (found)
        res.status(409).send(); // resource already exists
    } else {
        const posted_module = req.body; // submitted module
        timetable_data.modules.push(posted_module); // add to local model
        res.status(200)
            .setHeader('content-type', 'application/json')
            .send({ message: "Module added"});
    }
});

app.delete('/timetable/modules/:code', (req, res) => {
    const { code } = req.params;
    var module = timetable_data.modules.find(m => m.code === code);
    if(!module) { // true if 'module' not set/found
        res.status(404).send(); // resource not found
    } else {
        var index = timetable_data.modules.findIndex(m => m.code === code);
        timetable_data.modules.splice(index, 1);
        res.status(200)
            .setHeader('content-type', 'application/json')
            .send({ message: "Module deleted"});
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    console.log(`Press Ctrl+C to exit...`)
});