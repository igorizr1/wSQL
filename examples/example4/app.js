angular.module('sampleApp', [
    "wSQL"
])
.controller('SampleController', function($scope, wSQL) {

    // SELECT * FROM table1 WHERE id NOT IN (?, ?, ?)
    wSQL.select()
        .from("table1")
        .where_not_in("id", [3,4,6])
        .query()
        .then(function(d){
            console.log(d);
        });

    // SELECT * FROM table1 WHERE id NOT IN ('3', '4', '6')
    wSQL.select()
        .from("table1")
        .where_in("id", [3,4,6], true) // third parameter passed as true ==> means NOT IN
        .query()
        .then(function(d){
            console.log(d);
        });

    // SELECT * FROM table1 WHERE id NOT IN ('3', '4', '6') AND id NOT IN ('9', '10', '11')
    wSQL.select()
        .from("table1")
        .where_in("id", [3,4,6], true) // third parameter passed as true ==> means NOT IN
        .where_in("id", [9,10,11], true) // third parameter passed as true ==> means NOT IN
        .query()
        .then(function(d){
            console.log(d);
        });

    // SELECT * FROM table1 WHERE id NOT IN ('3', '4', '6') AND id NOT IN ('9', '10', '11')
    wSQL.select()
        .from("table1")
        .where_not_in("id", [3,4,6])
        .where_not_in("id", [9,10,11])
        .query()
        .then(function(d){
            console.log(d);
        });

    // SELECT * FROM table1 WHERE id NOT IN ('3', '4', '6') AND id NOT IN ('9', '10', '11')
    wSQL.select()
        .from("table1")
        .where_not_in("id", [3,4,6])
        .and_not_in("id", [9,10,11])
        .query()
        .then(function(d){
            console.log(d);
        });

    // SELECT * FROM table1 WHERE id NOT IN ('3', '4', '6') OR id NOT IN ('9', '10', '11')
    wSQL.select()
        .from("table1")
        .where_not_in("id", [3,4,6])
        .or_not_in("id", [9,10,11])
        .query()
        .then(function(d){
            console.log(d);
        });

    /**
     * id is not good example here for OR IN but Query works
     */
    // SELECT * FROM table1 WHERE id NOT IN ('3', '4', '6') OR id NOT IN ('9', '10', '11')
    wSQL.select()
        .from("table1")
        .where_not_in("id", [3,4,6])
        .or_in("id", [9,10,11], true)// third parameter passed as true ==> means NOT IN
        .query()
        .then(function(d){
            console.log(d);
        });

    /**
     * generate dynamic query
     */
    var data = {
        id: [1,2,3],
        category_id: [3,4,5],
        category_name: ["test", "test1"]
    };
    var select = wSQL.select().from("table1"), result_object;

    for(var i in data)
        result_object = select.where_not_in(i, data[i]);

    // SELECT * FROM table1 WHERE id NOT IN ('1', '2', '3') AND category_id NOT IN ('3', '4', '5') AND category_name NOT IN ('test', 'test1')
    result_object.query().then(function(d){
        console.log(d);
    });


});