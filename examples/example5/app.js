angular.module('sampleApp', [
    "wSQL"
])
.controller('SampleController', function($scope, wSQL) {

    wSQL.batch_insert_on_duplicate_key_update("table1",
        // data
        [{
            id: 1,
            category_id: 1,
            category_name: "test",
            test_field: "test"
        },
        {
            id: 2,
            category_id: 1,
            category_name: "test",
            test_field: "test"
        }],
        // unique_keys
        ["id", "test_field"]
    ).then(function(result){
        console.log("result");
        console.log(result);
    });

    wSQL.insert_on_duplicate_key_update("table1",
        // data
        {
            id: 1,
            category_id: 1,
            category_name: "test",
            test_field: "test"
        },
        // unique_keys
        ["id", "test_field"]
    ).then(function(result){
        console.log("result");
        console.log(result);
    });

    wSQL.insert_or_ignore("table1", {
        id: 1,
        category_id: 1,
        category_name: "test",
        test_field: "test"
    }).then(function(result){
        console.log("result");
        console.log(result);
    });

});