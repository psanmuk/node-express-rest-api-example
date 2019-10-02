var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "dbCities.sqlite"


let dbCities = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error("Error!! Cannot open database : " + err.message)
        //throw err
    } else {
        console.log('Connected to the SQlite database(dbCities.sqlite).')
        dbCities.run(`CREATE TABLE cities (
            id INTEGER PRIMARY KEY,
            name text UNIQUE, 
            country varchar(2), 
            lon real, 
            lat real, 
            CONSTRAINT name_unique UNIQUE (name)
            )`, (err) => {
            if (err) {
                // Table already created
                console.error("Table cities : already created");
            } else {
                // Table just created, creating some rows
                console.error("cities : insert");
                //var insert = 'INSERT INTO cities (id,name, country, lon,lat) VALUES (?,?,?,?,?)'
                //dbCities.run(insert, [707860, "Hurzuf", "UA", 34.28333, 44.549999])
                //dbCities.run(insert, [1, "test", "TH", 105.28333, 44.549999])
            }
        })
    }
})


module.exports = dbCities

