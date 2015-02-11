angular.module('sampleApp', [
    "wSQL.db"
])
.controller('SampleController', function($scope, wSQL) {

    console.log(wSQL);

    //SELECT id, category_id FROM table1 WHERE id=? LIMIT 1
    wSQL.select("id, category_id")
        .from("table1")
        .where("id", 3)
        .col()
        .then(function(d){
            console.log(d);
        });

    //SELECT * FROM table1 WHERE id>? AND category_id=? OR category_id=? LIMIT 1
    wSQL.select("*")
        .from("table1")
        .where("id", 3, ">")
        .and("category_id", 15)
        .or("category_id", 14)
        .row()
        .then(function(d){
            console.log(d);
        });

    //SELECT * FROM table1 WHERE id IN (?, ?, ?)
    wSQL.select()
        .from("table1")
        .where_in("id", [3,4,6])
        .query()
        .then(function(d){
            console.log(d);
        });

    //SELECT id, category_id, count(*) as amount FROM table1 GROUP BY category_id
    wSQL.select("id, category_id, count(*) as amount")
        .from("table1")
        .group_by("category_id")
        .query()
        .then(function(d){
            console.log(d);
        });

    //SELECT id, category_id, count(*) as amount FROM table1 GROUP BY category_id HAVING category_id=? OR category_id=?
    wSQL.select("id, category_id, count(*) as amount")
        .from("table1")
        .group_by("category_id")
        .having("category_id", 15)
        .or("category_id", 10)
        .query()
        .then(function(d){
            console.log(d);
        });


    //SELECT id, category_id, count(*) as amount FROM table1 WHERE id=57 GROUP BY category_id HAVING category_id=10
    wSQL.select("id, category_id, count(*) as amount")
        .from("table1")
        .where("id", 57)
        .group_by("category_id")
        .having("category_id", 10)
        .or("category_id", 15)
        .query()
        .then(function(d){
            console.log(d);
        });

    //INSERT INTO table1 (category_id) VALUES (?)
    wSQL.insert("table1", {
        category_id: 14
    }).then(function(insert){
        console.log("insert_id");
        console.log(insert.insertId);
    });

});