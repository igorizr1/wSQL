angular.module('sampleApp', [
    "wSQL"
])
.controller('SampleController', function($scope, wSQL) {

    console.log(wSQL);
    var rand = function(){
        return Math.round(Math.random()*10);
    };

    wSQL.batch_insert_or_ignore("table1", [
        {
            category_id: rand(),
            category_name: "ttdasdas1",
            test_field: "test_field1"
        },
        {
            category_id: rand(),
            category_name: "ttdasdas2",
            test_field: "test_field2"
        },
        {
            category_id: rand(),
            category_name: "ttdasdas3",
            test_field: "test_field3"
        },
        {
            category_id: rand(),
            category_name: "ttdasdas4",
            test_field: "test_field4"
        },
        {
            category_id: rand(),
            category_name: "ttdasdas1",
            test_field: "test_field1"
        },
        {
            category_id: rand(),
            category_name: "ttdasdas2",
            test_field: "test_field2"
        },
        {
            category_id: rand(),
            category_name: "ttdasdas3",
            test_field: "test_field3"
        },
        {
            category_id: rand(),
            category_name: "ttdasdas4",
            test_field: "test_field4"
        },
        {
            category_id: rand(),
            category_name: "ttdasdas1",
            test_field: "test_field1"
        },
        {
            category_id: rand(),
            category_name: "ttdasdas2",
            test_field: "test_field2"
        },
        {
            category_id: rand(),
            category_name: "ttdasdas3",
            test_field: "test_field3"
        },
        {
            category_id: rand(),
            category_name: "ttdasdas4",
            test_field: "test_field4"
        }
    ]).then(function(insert){
        console.log("insert");
        console.log(insert);
        console.log("insert_id");
        console.log(insert.insertId);
    });

});