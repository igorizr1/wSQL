angular.module('wSQL.config', [])
    .constant("W_SQL_CONFIG", {
        PARAMS: {
            name: "messanger_db",
            version: "1.0",
            sub_name: "my_db_messanger",
            size: 1000000 //set max size of db
        },
        TABLES_SQL: {
            "contacts": [
                "_id INTEGER PRIMARY KEY AUTOINCREMENT NULL",
                "id VARCHAR(255) NULL",
                "uuid VARCHAR(255)  NULL",
                "mobile VARCHAR(255) NOT NULL",
                "email VARCHAR(255) NULL",
                "type VARCHAR(255) NULL",
                "name VARCHAR(255) NOT NULL",
                "picture VARCHAR(255) NULL",
                "active VARCHAR(255) NULL",
                "added VARCHAR(255) NULL",
                "hash VARCHAR(255) NOT NULL",
                "checked VARCHAR(255) NOT NULL",
                "date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
                "UNIQUE (mobile)"
            ],
            "contacts_groups": [
                "_id INTEGER PRIMARY KEY AUTOINCREMENT NULL",
                "id VARCHAR(255) NULL",
                "uuid VARCHAR(255)  NULL",
                "group_name VARCHAR(255)  NULL",
                "mobile VARCHAR(255) NOT NULL",
                "email VARCHAR(255) NOT NULL",
                "type VARCHAR(255) NULL",
                "name VARCHAR(255) NOT NULL",
                "picture VARCHAR(255) NULL",
                "checked VARCHAR(255) NOT NULL",
                "date TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP"
            ],
            "chats": [
                "id INTEGER PRIMARY KEY AUTOINCREMENT NULL",
                "_id VARCHAR(255) NOT NULL",
                "user TEXT NOT NULL",
                "first_message TEXT NOT NULL",
                "participants TEXT NOT NULL",
                "users TEXT NOT NULL",
                "read VARCHAR(255) NULL",
                "date_create VARCHAR(255) NOT NULL",
                "date_update VARCHAR(255) NOT NULL",
                "UNIQUE (_id)"
            ],
            "chat_messages": [
                "id INTEGER PRIMARY KEY AUTOINCREMENT NULL",
                "_id VARCHAR(255) NOT NULL ",
                "chat_id VARCHAR(255) NOT NULL",
                "message TEXT NOT NULL",
                "user TEXT NOT NULL",
                "users TEXT NOT NULL",
                "read VARCHAR(255) NULL",
                "date_create VARCHAR(255) NOT NULL",
                "date_update VARCHAR(255) NOT NULL",
                "UNIQUE (_id)"
            ]
        },
        DEBUG_LEVEL: 0,
//        CLEAR: true
    });




