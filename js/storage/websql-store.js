var WebSqlStore = function(successCallback, errorCallback) {

    this.initializeDatabase = function(successCallback, errorCallback) {
        var self = this;
        this.db = window.openDatabase("EmployeeDB", "1.0", "Employee Demo DB", 200000);
        this.db.transaction(
                function(tx) {
                    self.createTable(tx);
                    self.addSampleData(tx);
                },
                function(error) {
                    console.log('Transaction error: ' + error);
                    if (errorCallback) errorCallback();
                },
                function() {
                    console.log('Transaction success');
                    if (successCallback) successCallback();
                }
        )
    }

    this.createTable = function(tx) {
        tx.executeSql('DROP TABLE IF EXISTS employee');
        var sql = "CREATE TABLE IF NOT EXISTS employee ( " +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "firstName VARCHAR(50), " +
            "lastName VARCHAR(50), " +
            "title VARCHAR(50), " +
            "managerId INTEGER, " +
            "city VARCHAR(50), " +
            "officePhone VARCHAR(50), " +
            "cellPhone VARCHAR(50), " +
            "email VARCHAR(50))";
        tx.executeSql(sql, null,
                function() {
                    console.log('Create table success');
                },
                function(tx, error) {
                    alert('Create table error: ' + error.message);
                });
    }

    this.addSampleData = function(tx, employees) {
        var employees = [
                {"id": 1, "firstName": "Ep", "lastName": "Worth", "title":"Epworth CEO", "managerId": 0, "city":"Melbourne - VIC", "cellPhone":"(03)999-8888", "officePhone":"(03)999-8887", "email":"ryan@econference.com"},
                {"id": 2, "firstName": "Michael", "lastName": "Scott", "title":"Senior Surgeon", "managerId": 1, "city":"Melbourne - VIC", "cellPhone":"(03)865-2536", "officePhone":"(03)123-4567", "email":"michael@econference.com"},
                {"id": 3, "firstName": "Dwight", "lastName": "Schrute", "title":"Senior Psychologist", "managerId": 1, "city":"Melbourne - VIC", "cellPhone":"(03)865-1158", "officePhone":"(03)843-8963", "email":"dwight@econference.com"},
                {"id": 4, "firstName": "Jim", "lastName": "Halpert", "title":"Cardiothoracic Surgeon", "managerId": 1, "city":"Melbourne - VIC", "cellPhone":"(03)865-8989", "officePhone":"(03)968-5741", "email":"dwight@econference.com"},
                {"id": 5, "firstName": "Pamela", "lastName": "Beesly", "title":"Surgeon", "managerId": 4, "city":"Melbourne - VIC", "cellPhone":"(03)999-5555", "officePhone":"(03)999-7474", "email":"pam@econference.com"},
                {"id": 6, "firstName": "Angela", "lastName": "Martin", "title":"Senior Cardiologist", "managerId": 4, "city":"Melbourne - VIC", "cellPhone":"(03)555-9696", "officePhone":"(03)999-3232", "email":"angela@econference.com"},
                {"id": 7, "firstName": "Kevin", "lastName": "Malone", "title":"Cardiologist", "managerId": 6, "city":"Melbourne - VIC", "cellPhone":"(03)777-9696", "officePhone":"(03)111-2525", "email":"kmalone@econference.com"},
                {"id": 8, "firstName": "Oscar", "lastName": "Martinez", "title":"Cardiologist", "managerId": 6, "city":"Melbourne - VIC", "cellPhone":"(03)321-9999", "officePhone":"(03)585-3333", "email":"oscar@econference.com"},
                {"id": 9, "firstName": "Creed", "lastName": "Bratton", "title":"General Physicist", "managerId": 2, "city":"Melbourne - VIC", "cellPhone":"(03)222-6666", "officePhone":"(03)333-8585", "email":"creed@econference.com"},
                {"id": 10, "firstName": "Andy", "lastName": "Bernard", "title":"Radiation Oncology Specialist", "managerId": 1, "city":"Melbourne - VIC", "cellPhone":"(03)555-0000", "officePhone":"(03)646-9999", "email":"andy@econference.com"},
                {"id": 11, "firstName": "Phyllis", "lastName": "Lapin", "title":"Oncology Specialist", "managerId": 10, "city":"Melbourne - VIC", "cellPhone":"(03)241-8585", "officePhone":"(03)632-1919", "email":"phyllis@econference.com"},
                {"id": 12, "firstName": "Stanley", "lastName": "Hudson", "title":"Oncology Specialist", "managerId": 10, "city":"Melbourne - VIC", "cellPhone":"(03)700-6464", "officePhone":"(03)787-9393", "email":"shudson@econference.com"},
                {"id": 13, "firstName": "Meredith", "lastName": "Palmer", "title":"Psychologist", "managerId": 3, "city":"Melbourne - VIC", "cellPhone":"(03)588-6567", "officePhone":"(03)981-6167", "email":"meredith@econference.com"},
                {"id": 14, "firstName": "Kelly", "lastName": "Kapoor", "title":"General Physicist", "managerId": 2, "city":"Melbourne - VIC", "cellPhone":"(03)123-9654", "officePhone":"(03)125-3666", "email":"kelly@econference.com"},
                {"id": 15, "firstName": "Toby", "lastName": "Flenderson", "title":"Plastic Surgeon", "managerId": 2, "city":"Melbourne - VIC", "cellPhone":"(03)485-8554", "officePhone":"(03)699-5577", "email":"toby@econference.com"}
            ];
        var l = employees.length;
        var sql = "INSERT OR REPLACE INTO employee " +
            "(id, firstName, lastName, managerId, title, city, officePhone, cellPhone, email) " +
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        var e;
        for (var i = 0; i < l; i++) {
            e = employees[i];
            tx.executeSql(sql, [e.id, e.firstName, e.lastName, e.managerId, e.title, e.city, e.officePhone, e.cellPhone, e.email],
                    function() {
                        console.log('INSERT success');
                    },
                    function(tx, error) {
                        alert('INSERT error: ' + error.message);
                    });
        }
    }

    this.findByName = function(searchKey, callback) {
        this.db.transaction(
            function(tx) {

                var sql = "SELECT e.id, e.firstName, e.lastName, e.title, count(r.id) reportCount " +
                    "FROM employee e LEFT JOIN employee r ON r.managerId = e.id " +
                    "WHERE e.firstName || ' ' || e.lastName LIKE ? " +
                    "GROUP BY e.id ORDER BY e.lastName, e.firstName";

                tx.executeSql(sql, ['%' + searchKey + '%'], function(tx, results) {
                    var len = results.rows.length,
                        employees = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        employees[i] = results.rows.item(i);
                    }
                    callback(employees);
                });
            },
            function(error) {
                alert("Transaction Error: " + error.message);
            }
        );
    }

    this.findById = function(id, callback) {
        this.db.transaction(
            function(tx) {

                var sql = "SELECT e.id, e.firstName, e.lastName, e.title, e.city, e.officePhone, e.cellPhone, e.email, e.managerId, m.firstName managerFirstName, m.lastName managerLastName, count(r.id) reportCount " +
                    "FROM employee e " +
                    "LEFT JOIN employee r ON r.managerId = e.id " +
                    "LEFT JOIN employee m ON e.managerId = m.id " +
                    "WHERE e.id=:id";

                tx.executeSql(sql, [id], function(tx, results) {
                    callback(results.rows.length === 1 ? results.rows.item(0) : null);
                });
            },
            function(error) {
                alert("Transaction Error: " + error.message);
            }
        );
    };

    this.initializeDatabase(successCallback, errorCallback);

}
