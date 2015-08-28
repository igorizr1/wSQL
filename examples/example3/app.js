angular.module('sampleApp', [
    "wSQL"
])
.controller('SampleController', function($scope, wSQL) {
    var rand = function(){
        return Math.round(Math.random()*10);
    };
    var data = []
    for(var i = 0; i<=249;i++){
        data.push({
            category_id: rand(),
            category_name: i,
            test_field: "test_field1eedsadsadas  test_field1eedsadsadas",
            test_field2: "test_field1eedsadsadas  test_field1eedsadsadas"
        });
    }

    console.log("data_length");
    console.log(data.length);

    wSQL.batch_insert_or_ignore("table1", data).then(function(insert){
        console.log("insert");
        console.log(insert);
        console.log("insert_id");
        console.log(insert.insertId);
    });

});