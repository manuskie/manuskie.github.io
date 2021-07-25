(function () {
    var myConnector = tableau.makeConnector();

    /*
    // Init function for connector, called during every phase
    myConnector.init = function(initCallback) {
        console.log('init');
        tableau.authType = tableau.authTypeEnum.custom;
        initCallback();
    }    
    */

    myConnector.getSchema = function (schemaCallback) {
        var cols = [{
            id: "id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "childFirstName",
            alias: "childFirstName",
            dataType: tableau.dataTypeEnum.string
        }];
    
        var tableSchema = {
            id: "xapBookings",
            alias: "XAP Bookings",
            columns: cols
        };
    
        schemaCallback([tableSchema]);
    };

    myConnector.getData = function(table, doneCallback) {

        console.log(tableau.username);
        console.log(tableau.password);

        var settings = {
            "url": "https://id.xap.rocks/connect/token",
            "method": "POST",
            "timeout": 0,
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            "data": {
              "grant_type": "client_credentials",
              "scope": "kidsxap",
              "client_id": tableau.username,
              "client_secret": tableau.password
            }
          };
          
          $.ajax(settings).done(function (response) {
            console.log(response);

            var accessToken = response.access_token;
            $.ajax({
                "url": "https://webgateway.xap.rocks/api/Booking/ListBookingInfo",
                "method": "post",            
                "headers": {
                    "Authorization": "Bearer " + accessToken,
                    "Content-Type": "application/json"
                },
                "data": JSON.stringify({
                    "updatedSince": "2005-01-09T00:00:00Z",
                    "sortBy": "bookingDate",
                    "pageSize": 200,
                    "page": 1,
                    "organisationIds": [
                      "4dcc3eb9-e4a7-4978-820b-ede361eaac96"
                    ]
                  }),            
                "success": function(data){
                    console.log(data);
                    tableData = [];
        
                // Iterate over the JSON object
                for (var i = 0, len = data.items.length; i < len; i++) {
                    tableData.push({
                        "id": data.items[i].id,
                        "childFirstName": data.items[i].childFirstName
                    });
                }
        
                table.appendRows(tableData);                
                    doneCallback();
                },"error": function(req,status,error){
                    var message = "Error during getData phase, using access token:" + auth.accessToken + " - " + error;
                    log(message,true);
                }
            });

          });
        
    };

/*
        $.getJSON("https://webgateway.xap.rocks/api/Booking/ListBookingInfo", function(resp) {
            var feat = resp.features,
                tableData = [];
    
            // Iterate over the JSON object
            for (var i = 0, len = feat.length; i < len; i++) {
                tableData.push({
                    "id": feat[i].id,
                    "mag": feat[i].properties.mag,
                    "title": feat[i].properties.title,
                    "location": feat[i].geometry
                });
            }
    
            table.appendRows(tableData);
            doneCallback();
        });
    };
*/
    tableau.registerConnector(myConnector);

    $(document).ready(function () {
        $("#submitButton").click(function () {
            tableau.connectionName = "XAP Bookings";
            console.log($("#username").val());
            console.log($("#password").val());              
            tableau.username = $("#username").val();
            tableau.password = $("#password").val();          
            tableau.submit();
        });
    });    
})();
