var ws;

angular.module('sampleApp', [
    "wSQL.db"
])
.controller('SampleController', function($scope, wSQL) {
    ws = wSQL;
    console.log(wSQL);

    wSQL.select("id, category_id")
        .from("table1")
        .where("id", 2)
        .query()
        .then(function(d){
            console.log(d);
        });


//        sWebSQLService.select().from("table1").query().then(function(d){
//
//            console.log(d);
//        })

//        sWebSQLService.insert("table1", {category_id: 5});

});