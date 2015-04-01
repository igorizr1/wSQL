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
 *          "category_id INTEGER NULL"
 *      ],
 *      "table2"    :   [
 *          "id INTEGER PRIMARY KEY AUTOINCREMENT NULL",
 *          "category_id INTEGER NULL"
 *      ],
 *
 * }
 */
angular.module('wSQL.db.config', [])
.constant("W_SQL_CONFIG", {
    PARAMS: {
        name: "my_db_name",
        version: "my_db_version",
        sub_name: "my_db_sub_name",
        size: "my_db_size"
    },
    TABLES_SQL: {
        "table1"    :   [
            "id INTEGER PRIMARY KEY AUTOINCREMENT NULL",
            "category_id INTEGER NULL"
        ],
        "table2"    :   [
            "id INTEGER PRIMARY KEY AUTOINCREMENT NULL",
            "testddd INTEGER NULL"
        ]
    },
    /**
     * DEBUG_LEVELs
     *    0 - nothing
     *    1 - console.error
     *    2 - console.warn &
     *    3 - console.info &
     *    4 - console.log, debug
     */
    DEBUG_LEVEL: 0,
    CLEAR: true
});



