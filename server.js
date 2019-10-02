//https://developerhowto.com/2018/12/29/build-a-rest-api-with-node-js-and-express-js/
//2019-09-30
//git config --global user.email "panya.spcom@gmail.com"
//git config --global user.name "Panya.San"

var express = require("express");
var app = express();
var db = require("./database.js");
var dbCities = require("./dbCities.js");
var md5 = require("md5");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var HTTP_PORT = 8000;


// dbCities.all("SELECT * FROM cities", function(err, rows) {
//         rows.forEach(function (row) {
//             console.log(row.id, row.name,row.lon,row.lat);
//         })
// 	});
// dbCities.close();

// Start server
app.listen(HTTP_PORT, () => {
  console.log("Server running on port %PORT%".replace("%PORT%", HTTP_PORT));
  console.log("+GetJsonData : " + process.env.CLOUD_DIR + "dbCities.sqlite");
  GetJsonData();
  
});

app.get("/api/city", (req, res, next) => {
  console.log("- Get all cities");
  var sql = "select * from cities";
  var params = [];
  dbCities.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows
    });
  });
});

app.get("/api/users", (req, res, next) => {
  var sql = "select * from user";
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows
    });
  });
});

app.get("/api/user/:id", (req, res, next) => {
  var sql = "select * from user where id = ?";
  var params = [req.params.id];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: row
    });
  });
});

app.post("/api/user/", (req, res, next) => {
  var errors = [];
  if (!req.body.password) {
    errors.push("No password specified");
  }
  if (!req.body.email) {
    errors.push("No email specified");
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }
  var data = {
    name: req.body.name,
    email: req.body.email,
    password: md5(req.body.password)
  };
  var sql = "INSERT INTO user (name, email, password) VALUES (?,?,?)";
  var params = [data.name, data.email, data.password];
  db.run(sql, params, function(err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: data,
      id: this.lastID
    });
  });
});

app.patch("/api/user/:id", (req, res, next) => {
  var data = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password ? md5(req.body.password) : undefined
  };
  db.run(
    `UPDATE user set 
           name = coalesce(?,name), 
           email = COALESCE(?,email), 
           password = coalesce(?,password) 
           WHERE id = ?`,
    [data.name, data.email, data.password, req.params.id],
    (err, result) => {
      if (err) {
        res.status(400).json({ error: res.message });
        return;
      }
      res.json({
        message: "success",
        data: data
      });
    }
  );
});

app.delete("/api/user/:id", (req, res, next) => {
  db.run("DELETE FROM user WHERE id = ?", req.params.id, function(err, result) {
    if (err) {
      res.status(400).json({ error: res.message });
      return;
    }
    res.json({ message: "deleted", rows: this.changes });
  });
});

// Root path
app.get("/", (req, res, next) => {
  res.json({ message: "Ok" });
});

function GetJsonData() {
  //-------Read json file from city.json ---> dbCities.sqlite -----
  var fs = require("fs");
  //var file = process.env.CLOUD_DIR + "dbCities.sqlite";
  //var file = "dbCities.sqlite";
  //var exists = fs.existsSync(file);
  //var jsonfile = {
  //    key: "myvalue"
  //};

  //if (!exists) {
  //    console.log("Creating DB file.");
  //    fs.openSync(file, "w");
  //}

  //var sqlite3 = require("sqlite3").verbose();
  //var db = new sqlite3.Database(file);

  //myJson = require("./commits.json");  *error*
  // async read
  var insert =
    "INSERT INTO cities (id,name, country, lon,lat) VALUES (?,?,?,?,?)";
  //     fs.readFile('city.list.json', (err, data) => {
  //         if (err) throw err;
  //         let city = JSON.parse(data);
  //         console.log(i.toString() + '.' + city);
  //     });
  //var i = 0;
  // Sync
  var data = fs.readFileSync("city_small.json", "utf8");
  //console.log(data);
  if (data.length > 0) {
    //Async
    //fs.readFile('city.list.json', function (err, data,) {

    //if (err) {
    //    return console.error("fs.readFile err=" + err);
    //}
    console.log("Reccount=" + data.length);
    //console.log(i.toString() + '.data.toString() = ' + data.toString());
    let query = "select COUNT(*) AS cnt FROM cities WHERE id=? or name=?";
    let obj = JSON.parse(data);
    //let num;
    for (var j in obj) {
      //for (var j = 0; j < obj.length; j++) {
      //i++;
      console.log(j + ". " + obj[j].id + " : " + obj[j].name + " lat:" + obj[j].coord.lat);
      let id = obj[j].id;
      let name = obj[j].name;
      let msg = "--";
      let num = -1;
      //console.log(query);
      dbCities.get(query, [id, name], function(err, row) {
        if (err) {
          return console.error(err.message);
        }
        console.log(row);
        msg = row
          ? `ID=${id} ${name}, Cnt=${row.cnt} `
          : `Not found id : ${id}`;
        //console.log("row.cnt=" + row.cnt);
        //console.log("row[0]="+row[0]);
        num = row.cnt;
        console.log(msg, num);

        if (num == 0) {
          //console.log("insert #" + id);
          dbCities.run(
            insert,
            [id, name, obj[j].country, obj[j].coord.lon, obj[j].coord.lat],
            function(err) {
              if (err) {
                console.log("!!! ERROR. insert : " + err.message);
              }
              // get the last insert id
              console.log(`A row has been inserted with rowid ${this.lastID}`);
            });
        }
      });
      //console.log(msg);
      //var c1 = chk.fetchone()[0];
      //console.log(chk);
      //console.log(c1);
      //console.log("num=" + num);
      //console.log("typeof num=",typeof num);
      //console.log("typeof 0=",typeof 0);
      //console.log(num == 0);
    }
    console.log("ALL GETE DONE");
    //console.log(i.toString() + '.city.id = ' + city.id + ' : ' + city.name);
    //dbCities.run(insert, [city.id, city.name, city.country, city.lon, city.lat]);
    //console.log("File content: " + data.toString());
    // now save to db
    //db.serialize(function () {
    //if (!exists) {
    //    db.run("CREATE TABLE Stuff (thing TEXT)");
    //}

    //var jsonString = escape(JSON.stringify(data));
    //console.log(jsonString);
    //db.run(insert, [jsonString.id, jsonString.name, jsonString.country, jsonString.lon, jsonString.lat]);

    // db.transaction(function (tx) {
    //     //tx.executeSql('INSERT OR REPLACE INTO Stuff(md5, json, expires) VALUES ("'+hash+'", "'+jsonString+'","'+expireStamp+'")');
    //     tx.executeSql('INSERT INTO cities (id,name, country, lon,lat) VALUES ('
    //         + jsonString.id + ', "'
    //         + jsonString.name + '","'
    //         + jsonString.country + '",'
    //         + jsonString.lon + ','
    //         + jsonString.lat + ')');
    //     //var insert = 'INSERT INTO cities (id,name, country, lon,lat) VALUES (?,?,?,?,?)'
    //     //db.run(insert, [707860, "Hurzuf", "UA", 34.28333, 44.549999])
    //     //db.run(insert, [1, "test", "TH", 105.28333, 44.549999])

    // }, function (tx, error) {
    //     console.log(JSON.stringify(tx.message));
    //     console.log(JSON.stringify(error));
    // }, function () {

    // });
    //db.close();
    //});
    dbCities.close();
  }
  //dbCities.close();
}
