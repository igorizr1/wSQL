/**
 * db_params = {
 *      name: "my_db_name",
 *      version: "my_db_version",
 *      sub_name: "my_db_sub_name",
 *      size: "my_db_size"
 * }
 *
 * tables_sql = {
 *
 *      "table1"    :   [
 *          "id INTEGER PRIMARY KEY AUTOINCREMENT NULL",
 *          "category_id INTEGER NULL",
 *          "category_name VARCHAR(255) NOT NULL"
 *      ],
 *      "table2"    :   [
 *          "id INTEGER PRIMARY KEY AUTOINCREMENT NULL",
 *          "category_id INTEGER NULL"
 *      ],
 *
 * }
 */
angular.module('wSQL.config', [])
.constant("W_SQL_CONFIG", {
    PARAMS: {
        name: "test_db",
        version: "1.0",
        sub_name: "my_db_sub_name",
        size: 1000000
    },
    TABLES_SQL: {
        "table1"    :   [
            "id INTEGER PRIMARY KEY AUTOINCREMENT NULL",
            "category_id INTEGER NULL",
            "category_name VARCHAR(255) NOT NULL",
            "test_field VARCHAR(255) NOT NULL",
            "date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP"
        ],
        "table2"    :   [
            "id INTEGER PRIMARY KEY AUTOINCREMENT NULL",
            "testddd INTEGER NULL"
        ]
    },
//    CLEAR: true

});




