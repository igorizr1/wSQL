angular.module('wSQL.db', [
    'wSQL.db.config'
])
.factory('wSQL', function(W_SQL_CONFIG, $q) {
    var _extends = function(child, parent) { for (var key in parent) { if (_hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; }, _hasProp = {}.hasOwnProperty;

    var object_to_sql = function(data){
        var i = 0, query = "", query_with_as = "", query_for_set = "", values = [];
        for (var key in data) {
            query += (i == 0 ? "?" : ",?");
            query_with_as += (i == 0 ? "? as " : ",? as ")+key;
            query_for_set += (i == 0 ? "" : ",") + key + "=?";
            values.push(data[key]);
            ++i;
        }
        return {
            keys: Object.keys(data).join(),
            values: values,
            query: query,
            query_with_as: query_with_as,
            query_for_set: query_for_set
        }
    },
    array_to_sql = function(values){
        var str = "";
        values.forEach(function(v, k){
            str += (k === 0 ? "?" : ", ?");
        });
        return str;
    };

    var
    Db = (function(){
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
    })()

    , InitInterface = function(db_params, tables_sql, clear){
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
            for(var t in tables_sql)
                drops.push(new DropQuery().drop(t));
            $q.all(drops).then(function(){
                for(var t in tables_sql)
                    new CreateQuery().create(t, tables_sql[t]);
            });
        }else{
            console.warn("DB was NOT cleaned");
            for(var t in tables_sql)
                new CreateQuery().create(t, tables_sql[t])
        }

        return API;
    }

    , ExecuteSql = (function(){
        function ExecuteSql(){}
        ExecuteSql.prototype._querySuccess = function(tx, results, callback){
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
        };
        ExecuteSql.prototype._queryDB = function(tx, sql, data, callback) {
            var _this = this;
            console.info(sql, data);
            tx.executeSql(sql, data, function(tx, results){
                _this._querySuccess(tx, results, callback);
            }, function(err){
                _this._errorCB(err, sql, data, callback);
            });
        };
        ExecuteSql.prototype._errorCB = function(err, sql, data, callback) {
            console.error("Error processing SQL, error & sql below:");
            console.error(err);
            if(callback)callback({error:err});
        };

        ExecuteSql.prototype.query = function(sql, data) {
            var deferred = $q.defer(), _this = this;
            Db.get().transaction(function(tx){
                _this._queryDB(tx, sql, data || [], deferred.resolve);
            }, function(err){
                _this._errorCB(err, sql, deferred.reject);
            });
            return deferred.promise;
        };
        return ExecuteSql;
    })()

    , CreateQuery = (function(){
        function CreateQuery(){}
        CreateQuery.prototype.create = function(table, fields){
            return new ExecuteSql().query("CREATE TABLE IF NOT EXISTS "+table+ "(" +fields.join() + ")", []);
        };
        return CreateQuery;
    })()

    , DropQuery = (function(){
        function DropQuery(){}
        DropQuery.prototype.drop = function(table){
            return new ExecuteSql().query("DROP TABLE IF EXISTS "+table, []);
        };
        return DropQuery;
    })()

    , InsertQuery = (function(){
        function InsertQuery(){}
        InsertQuery.prototype.insert = function(table, data){
            var
            object_sql = object_to_sql(data),
            sql = 'INSERT INTO '+ table +' ('+ object_sql.keys +') VALUES ('+ object_sql.query + ')';
            return new ExecuteSql().query(sql, object_sql.values);
        };
        InsertQuery.prototype.batch_insert = function(table, data){
            var sql = 'INSERT INTO ' + table + ' ('+object_to_sql(data[0]).keys+')', sql_values = [];
            data.forEach(function(row, k){
                var row_sql = object_to_sql(row);
                sql_values = sql_values.concat(row_sql.values);
                if(k === 0)
                    sql += ' SELECT '+row_sql.query_with_as;
                else
                    sql +=  ' UNION SELECT '+row_sql.query;
            });
            return new ExecuteSql().query(sql, sql_values);
        };
        return InsertQuery;
    })()

    , CoreQueryBuilder = (function(){
        function CoreQueryBuilder(){
            this._sql = "";
            this._query_data = [];
        }

        CoreQueryBuilder.prototype.select = function(select){
            return this._sql = 'SELECT ' + (select ? select : "*");
        };

        CoreQueryBuilder.prototype.update = function(table, data) {
            this._sql = "UPDATE "+ table;
            return data ? this.set(data) : this._sql;
        };

        CoreQueryBuilder.prototype.set = function(data) {
            var sql_data = object_to_sql(data);
            this._query_data = sql_data.values;
            return this._sql += " SET "+ sql_data.query_for_set;
        };

        CoreQueryBuilder.prototype.delete = function(table) {
            return this._sql = "DELETE FROM "+ table;
        };

        CoreQueryBuilder.prototype.from = function(table, as) {
            return this._sql += ' FROM ' + table + (as ? " AS "+as : "");
        };

        CoreQueryBuilder.prototype._where_query = function(type, operator1, operator2, comparator){
            this._query_data.push(operator2);
            return this._sql+= " "+type+" "+operator1+(comparator ? comparator : "=")+"?";
        };

        CoreQueryBuilder.prototype.where = function(operator1, operator2, comparator){
            return this._where_query("WHERE", operator1, operator2, comparator);
        };

        CoreQueryBuilder.prototype.or = function(operator1, operator2, comparator){
            return this._where_query("OR", operator1, operator2, comparator);
        };

        CoreQueryBuilder.prototype.and = function(operator1, operator2, comparator){
            return this._where_query("AND", operator1, operator2, comparator);
        };

        CoreQueryBuilder.prototype._where_in_query = function(type, field, values){
            this._query_data = this._query_data.concat(values);
            return this._sql += " "+type+" " + field+" IN ("+array_to_sql(values)+")";
        };

        CoreQueryBuilder.prototype.where_in = function(field, values) {
            return this._where_in_query("WHERE", field, values);
        };

        CoreQueryBuilder.prototype.or_in = function(field, values){
            return this._where_in_query("OR", field, values);
        };

        CoreQueryBuilder.prototype.and_in = function(field, values){
            return this._where_in_query("AND", field, values);
        };

        CoreQueryBuilder.prototype._join_query = function(type, table, field1, field2, comparator) {
            var on = (field1 + (comparator ? comparator : " = ") + field2);
            return this._sql += ' '+type+' JOIN ' + table + ' ON ' + on;
        };

        CoreQueryBuilder.prototype.join = function(table, field1, field2, comparator) {
            return this._join_query("INNER", table, field1, field2, comparator);
        };

        CoreQueryBuilder.prototype.left_join = function(table, field1, field2, comparator) {
            return this._join_query("LEFT", table, field1, field2, comparator);
        };

        CoreQueryBuilder.prototype.order_by = function(order, desc) {
            return this._sql += ' ORDER BY ' + order + (desc ? ' DESC' : "");
        };

        CoreQueryBuilder.prototype.group_by = function(group) {
            return this._sql += ' GROUP BY ' + group;
        };

        CoreQueryBuilder.prototype.having = function(operator1, operator2, comparator) {
            this._query_data.push(operator2);
            return this._sql+= " HAVING "+operator1+(comparator ? comparator : "=")+"?";
        };

        CoreQueryBuilder.prototype.limit = function(limit, offset) {
            return this._sql += ' LIMIT ' + limit + (offset ? (" OFFSET " + offset) : "");
        };

        CoreQueryBuilder.prototype.query = function() {
            return new ExecuteSql().query(this._sql, this._query_data);
        };

        CoreQueryBuilder.prototype.row = function() {
            // return one row
            this._sql += ' LIMIT 1';
            return new ExecuteSql().query(this._sql, this._query_data);
        };

        CoreQueryBuilder.prototype.col = function() {
            // return one col
            this._sql += ' LIMIT 1';
            var deferred = $q.defer();
            new ExecuteSql().query(this._sql, this._query_data).then(function(data){
                deferred.resolve( data.length > 0 ? data[0][ Object.keys(data[0])[0] ] : [] );
            }, deferred.reject);
            return deferred.promise;
        };

        return CoreQueryBuilder;
    })()

    , QueryBuilder = (function(){
        function QueryBuilder(){
            this.queryBuilderAPI = new CoreQueryBuilder();
        }

        QueryBuilder.prototype.__perform = function(type, ___arguments){
            var
            _this = this,
            responses = {
                select: {
                    from: function(){return _this.from.apply(_this, arguments);}
                },
                update: {
                    set: function(){return _this.set.apply(_this, arguments);},
                    where: function(){return _this.where.apply(_this, arguments);},
                    where_in: function(){return _this.where_in.apply(_this, arguments);},
                    query: function(){return _this.query.apply(_this, arguments);}
                },
                set: {
                    where: function(){return _this.where.apply(_this, arguments);},
                    where_in: function(){return _this.where_in.apply(_this, arguments);},
                    query: function(){return _this.query.apply(_this, arguments);}
                },
                'delete': {
                    where: function(){return _this.where.apply(_this, arguments);},
                    where_in: function(){return _this.where_in.apply(_this, arguments);},
                    query: function(){return _this.query.apply(_this, arguments);}
                },
                from: {
                    where: function(){return _this.where.apply(_this, arguments);},
                    where_in: function(){return _this.where_in.apply(_this, arguments);},
                    join: function(){return _this.join.apply(_this, arguments);},
                    left_join: function(){return _this.left_join.apply(_this, arguments);},
                    order_by: function(){return _this.order_by.apply(_this, arguments);},
                    group_by: function(){return _this.group_by.apply(_this, arguments);},
                    limit: function(){return _this.limit.apply(_this, arguments);},
                    query: function(){return _this.query.apply(_this, arguments);},
                    row: function(){return _this.row.apply(_this, arguments);},
                    col: function(){return _this.col.apply(_this, arguments);}
                },
                where: {
                    and: function(){return _this.and.apply(_this, arguments);},
                    or: function(){return _this.or.apply(_this, arguments);},
                    and_in: function(){return _this.and_in.apply(_this, arguments);},
                    or_in: function(){return _this.or_in.apply(_this, arguments);},
                    order_by: function(){return _this.order_by.apply(_this, arguments);},
                    group_by: function(){return _this.group_by.apply(_this, arguments);},
                    limit: function(){return _this.limit.apply(_this, arguments);},
                    query: function(){return _this.query.apply(_this, arguments);},
                    row: function(){return _this.row.apply(_this, arguments);},
                    col: function(){return _this.col.apply(_this, arguments);}
                },
                join: {
                    where: function(){return _this.where.apply(_this, arguments);},
                    where_in: function(){return _this.where_in.apply(_this, arguments);},
                    join: function(){return _this.join.apply(_this, arguments);},
                    left_join: function(){return _this.left_join.apply(_this, arguments);},
                    order_by: function(){return _this.order_by.apply(_this, arguments);},
                    group_by: function(){return _this.group_by.apply(_this, arguments);},
                    having: function(){return _this.having.apply(_this, arguments);},
                    limit: function(){return _this.limit.apply(_this, arguments);},
                    query: function(){return _this.query.apply(_this, arguments);},
                    row: function(){return _this.row.apply(_this, arguments);},
                    col: function(){return _this.col.apply(_this, arguments);}
                },
                group_by: {
                    order_by: function(){return _this.order_by.apply(_this, arguments);},
                    having: function(){return _this.having.apply(_this, arguments);},
                    limit: function(){return _this.limit.apply(_this, arguments);},
                    query: function(){return _this.query.apply(_this, arguments);},
                    row: function(){return _this.row.apply(_this, arguments);},
                    col: function(){return _this.col.apply(_this, arguments);}
                },
                order_by: {
                    having: function(){return _this.having.apply(_this, arguments);},
                    limit: function(){return _this.limit.apply(_this, arguments);},
                    query: function(){return _this.query.apply(_this, arguments);},
                    row: function(){return _this.row.apply(_this, arguments);},
                    col: function(){return _this.col.apply(_this, arguments);}
                },
                having: {
                    and: function(){return _this.and.apply(_this, arguments);},
                    or: function(){return _this.or.apply(_this, arguments);},
                    and_in: function(){return _this.and_in.apply(_this, arguments);},
                    or_in: function(){return _this.or_in.apply(_this, arguments);},
                    order_by: function(){return _this.order_by.apply(_this, arguments);},
                    limit: function(){return _this.limit.apply(_this, arguments);},
                    query: function(){return _this.query.apply(_this, arguments);},
                    row: function(){return _this.row.apply(_this, arguments);},
                    col: function(){return _this.col.apply(_this, arguments);}
                },
                limit: {
                    query: function(){return _this.query.apply(_this, arguments);},
                    row: function(){return _this.row.apply(_this, arguments);},
                    col: function(){return _this.col.apply(_this, arguments);}
                }
            };

            this.queryBuilderAPI[type].apply(this.queryBuilderAPI, ___arguments);
            return responses[type];
        };

        QueryBuilder.prototype.select = function(){return this.__perform("select", arguments);};
        QueryBuilder.prototype.update = function(){return this.__perform("update", arguments);};
        QueryBuilder.prototype.set = function(){return this.__perform("set", arguments);};
        QueryBuilder.prototype.delete = function(){return this.__perform("delete", arguments);};
        QueryBuilder.prototype.from = function(){return this.__perform("from", arguments);};
        QueryBuilder.prototype.where = function(){return this.__perform("where", arguments);};
        QueryBuilder.prototype.where_in = function(){return this.__perform("where", arguments);};
        QueryBuilder.prototype.or = function(){return this.__perform("where", arguments);};
        QueryBuilder.prototype.and = function(){return this.__perform("where", arguments);};
        QueryBuilder.prototype.or_in = function(){return this.__perform("where", arguments);};
        QueryBuilder.prototype.and_in = function(){return this.__perform("where", arguments);};
        QueryBuilder.prototype.join = function(){return this.__perform("join", arguments);};
        QueryBuilder.prototype.left_join = function(){return this.__perform("join", arguments);};
        QueryBuilder.prototype.order_by = function(){return this.__perform("order_by", arguments);};
        QueryBuilder.prototype.group_by = function(){return this.__perform("group_by", arguments);};
        QueryBuilder.prototype.having = function(){return this.__perform("having", arguments);};
        QueryBuilder.prototype.limit = function(){return this.__perform("limit", arguments);};
////        SelectQuery.prototype.query = SelectQuery.__super__.query;
////        SelectQuery.prototype.row = SelectQuery.__super__.row;
////        SelectQuery.prototype.col = SelectQuery.__super__.col;
        QueryBuilder.prototype.query = function(){return this.queryBuilderAPI.query();};
        QueryBuilder.prototype.row = function(){return this.queryBuilderAPI.row();};
        QueryBuilder.prototype.col = function(){return this.queryBuilderAPI.col();};
        return QueryBuilder;
    })()
//    })(QueryBuilder)

    , API = {
        select: function(select){
            return new QueryBuilder().select(select);
        },
        update: function(table, data){
            return new QueryBuilder().update(table, data);
        },
        insert: function(table, values) {
            return new InsertQuery().insert(table, values);
        },
        batch_insert: function(table, values){
            if (typeof table != "string")
                return false; // table is a string not an array
            if (values instanceof Array === false)
                return false; // data is array here
            return new InsertQuery().batch_insert(table, values);
        },
        delete: function(table){
            return new QueryBuilder().delete(table);
        }
    };

    return InitInterface(W_SQL_CONFIG.PARAMS, W_SQL_CONFIG.TABLES_SQL, W_SQL_CONFIG.CLEAR);

});