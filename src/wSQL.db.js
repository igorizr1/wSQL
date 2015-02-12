angular.module('wSQL.db', [
    'wSQL.db.config'
])
.factory('wSQL', function(W_SQL_CONFIG, $q) {
    var object_to_sql = function(data){
        var i = 0, query = "", values = [];
        for (var key in data) {
            query += (i == 0 ? "?" : ",?");
            values.push(data[key]);
            ++i;
        }
        return {
            keys: Object.keys(data).join(),
            values: values,
            query: query
        }
    },
    array_to_sql = function(values){
        var str = "";
        values.forEach(function(v, k){
            str += (k === 0 ? "?" : ", ?");
        });
        return str;
    };



    var Db = (function(){
        var db, db_set = false;
        return {
            get: function(){
                return db;
            },
            set: function(db_params){
                db = window.openDatabase(db_params.name, db_params.version, db_params.sub_name, db_params.size);
                db_set = true;
                return db;
            }
        }
    }());

    var InitInterface = function(db_params, tables_sql, clear){
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
        if(!db_params.name || !db_params.version || !db_params.sub_name || !db_params.size || !tables_sql || Object.keys(tables_sql).length <= 0){
            console.error("WebSQLite InitInterface error: initialize params are not specified");
            return false;
        }
        Db.set(db_params);


        if(clear){
            console.warn("DB was cleaned");
            var drops = [];
            for(var t in tables_sql){
                var dq = new DropQuery();
                drops.push(dq.drop(t));
            }
            $q.all(drops).then(function(){
                for(var t in tables_sql){
                    var cq = new CreateQuery();
                    cq.create(t, tables_sql[t]);
                }
            });
        }else{
            console.warn("DB was NOT cleaned");
            for(var t in tables_sql){
                var cq = new CreateQuery();
                cq.create(t, tables_sql[t])
            }
        }

        return API;
    };

    var ExecuteSql = function(){
        var
        _querySuccess = function(tx, results, callback){
            console.debug("querySuccess");
            try{
                results.insertId;
                return callback( JSON.parse(JSON.stringify( results )) );
            }catch(e){
                var len = results.rows.length, db_result = [];
                if(results.rows.length > 0)
                    for(var i = 0; i < len; i++)
                        db_result[i] = JSON.parse(JSON.stringify( results.rows.item(i) ));
                return (callback ? callback(db_result) : true);
            }
        },

        _queryDB = function(tx, sql, data, callback) {
            console.info(sql, data);
            tx.executeSql(sql, data, function(tx, results){
                _querySuccess(tx, results, callback);
            }, function(err){
                _errorCB(err, sql, data, callback);
            });
        },

        _errorCB = function(err, sql, data, callback) {
            console.error("Error processing SQL, error & sql below:");
            console.error(err);
            if(callback)callback({error:err});
        };

        this.query = function(sql, data) {
            var deferred = $q.defer();
            Db.get().transaction(function(tx){
                _queryDB(tx, sql, data || [], deferred.resolve);
            }, function(err){
                _errorCB(err, sql, deferred.reject);
            });
            return deferred.promise;
        };

    };

    var CreateQuery = function(){
        this.create = function(table, fields){
            return new ExecuteSql().query("CREATE TABLE IF NOT EXISTS "+table+ "(" +fields.join() + ")", []);
        }
    };

    var DropQuery = function(){
        this.drop = function(table){
            return new ExecuteSql().query("DROP TABLE IF EXISTS "+table, []);
        }
    };

    var SelectQuery = function(){
        var
        __Query__ = new SelectQueryBuilder(),
        _this = this,
        __perform = function(type, ___arguments){
            __Query__[type].apply(__Query__[type], ___arguments);
            return {
                where: _this.where,
                where_in: _this.where_in,
                and: _this.and,
                or: _this.or,
                and_in: _this.and_in,
                or_in: _this.or_in,
                join: _this.join,
                left_join: _this.left_join,
                order_by: _this.order_by,
                group_by: _this.group_by,
                having: _this.having,
                limit: _this.limit,
                query: _this.query,
                row: _this.row,
                col: _this.col
            }
        };


        this.select = function(){
            __Query__.select.apply(__Query__.select, arguments);
            return {from: _this.from}
        };

        this.from = function(){
            return __perform("from", arguments);
        };

        this.where = function(){
            return __perform("where", arguments);
        };

        this.where_in = function(){
            return __perform("where_in", arguments);
        };

        this.join = function(){
            return __perform("join", arguments);
        };

        this.left_join = function(){
            return __perform("left_join", arguments);
        };

        this.order_by = function(){
            return __perform("order_by", arguments);
        };

        this.group_by = function(){
            return __perform("group_by", arguments);
        };

        this.having = function(){
            return __perform("having", arguments);
        };

        this.or = function(){
            return __perform("or", arguments);
        };

        this.and = function(){
            return __perform("and", arguments);
        };

        this.or_in = function(){
            return __perform("or_in", arguments);
        };

        this.and_in = function(){
            return __perform("and_in", arguments);
        };

        this.limit = function(){
            return __perform("limit", arguments);
        };

        this.query = __Query__.query;
        this.row = __Query__.row;
        this.col = __Query__.col;
    };

    var SelectQueryBuilder = function(){
        var _sql = "", _query_data = [], _this = this;

        this.select = function(select){
            return _sql = 'SELECT ' + (select ? select : "*");
        };

        this.from = function(table, as) {
            return _sql += ' FROM ' + table + (as ? " AS "+as : "");
        };

        this._where_query = function(type, operator1, operator2, comparator){
            _query_data.push(operator2);
            return _sql+= " "+type+" "+operator1+(comparator ? comparator : "=")+"?";
        };

        this.where = function(operator1, operator2, comparator){
            return _this._where_query("WHERE", operator1, operator2, comparator);
        };

        this.or = function(operator1, operator2, comparator){
            return _this._where_query("OR", operator1, operator2, comparator);
        };

        this.and = function(operator1, operator2, comparator){
            return _this._where_query("AND", operator1, operator2, comparator);
        };

        this._where_in_query = function(type, field, values){
            _query_data = _query_data.concat(values);
            return _sql += " "+type+" " + field+" IN ("+array_to_sql(values)+")";
        };

        this.where_in = function(field, values) {
            return _this._where_in_query("WHERE", field, values);
        };

        this.or_in = function(field, values){
            return _this._where_in_query("OR", field, values);
        };

        this.and_in = function(field, values){
            return _this._where_in_query("AND", field, values);
        };

        this._join_query = function(type, table, field1, field2, comparator) {
            var on = (field1 + (comparator ? comparator : " = ") + field2);
            return _sql += ' '+type+' JOIN ' + table + ' ON ' + on;
        };

        this.join = function(table, field1, field2, comparator) {
            return _this._join_query("INNER", table, field1, field2, comparator);
        };

        this.left_join = function(table, field1, field2, comparator) {
            return _this._join_query("LEFT", table, field1, field2, comparator);
        };

        this.order_by = function(order, desc) {
            return _sql += ' ORDER BY ' + order + (desc ? ' DESC' : "");
        };

        this.group_by = function(group) {
            return _sql += ' GROUP BY ' + group;
        };

        this.having = function(operator1, operator2, comparator) {
            _query_data.push(operator2);
            return _sql+= " HAVING "+operator1+(comparator ? comparator : "=")+"?";
        };

        this.limit = function(limit, offset) {
            return _sql += ' LIMIT ' + limit + (offset ? (" OFFSET " + offset) : "");
        };

        this.query = function() {
            return new ExecuteSql().query(_sql, _query_data);
        };

        this.row = function() {
            // return one row
            _sql += ' LIMIT 1';
            var q = new ExecuteSql();
            return q.query(_sql, _query_data);
        };

        this.col = function() {
            // return one col
            _sql += ' LIMIT 1';
            var q = new ExecuteSql(), deferred = $q.defer();
            q.query(_sql, _query_data).then(function(data){
                deferred.resolve( data.length > 0 ? data[0][ Object.keys(data[0])[0] ] : [] );
            }, deferred.reject);
            return deferred.promise;
        };
    };

    var InsertQuery = function(){
        this.insert = function(table, data){
            var
            object_sql = object_to_sql(data),
            sql = 'INSERT INTO '+ table +' ('+ object_sql.keys +') VALUES ('+ object_sql.query + ')';
            return new ExecuteSql().query(sql, object_sql.values);
        }
    };

    var API = {
        select: function(select){
            return new SelectQuery().select(select);
        },
        update: function(){

        },
        insert: function(table, values) {
            return new InsertQuery().insert(table, values);
        },
        remove: function(){

        }
    };

    return InitInterface(W_SQL_CONFIG.PARAMS, W_SQL_CONFIG.TABLES_SQL, W_SQL_CONFIG.CLEAR);

});