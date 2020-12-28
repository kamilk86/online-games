// FUNCTION NOT NEEDED
/**
function update_keys(option) {
    // Change board states key values to correspond with smaller or larger canvas
    if (option == 0) {
        // change my board keys to large, opponent to small
       for(var i=0; i<2;i++){
        var ctr = 1;
        var x_add = 10;
        var y_add = 0;
        var x = null;
        var y = null;
        var new_state = {};
        for (var [key, value] of Object.entries(boards_state[i])) {

            x = parseInt(key.split(":")[0]);
            y = parseInt(key.split(":")[1]);

            if (ctr <= 10) {
                y_add += 10;
            } else {
                x_add += 10;
                y_add = 10;
                ctr = 1;
            };
            ctr++;
            if(i==0) {
                x += x_add
                y += y_add
            } else {
                x -= x_add
                y -= y_add
            };
           
            var newKey = "" + x + ":" + y;
            new_state[newKey] = value;
            
        };
        boards_state[i] = new_state;
        
       };
        
    } else {
       
        for(var i=0; i < 2; i++) {
            var ctr = 1;
            var x_add = 10;
            var y_add = 0;
            var x = null;
            var y = null;
            var new_state = {};
        
            for (var [key, value] of Object.entries(boards_state[i])) {

                x = parseInt(key.split(":")[0]);
                y = parseInt(key.split(":")[1]);
    
                if (ctr <= 10) {
                    y_add += 10;
                } else {
                    x_add += 10;
                    y_add = 10;
                    ctr = 1;
                };
                ctr++;
                if(i==0) {
                    x -= x_add
                    y -= y_add
                } else {
                    x += x_add
                    y += y_add
                };
                
                var newKey = "" + x + ":" + y;
                new_state[newKey] = value;
               
            };
            boards_state[i] = new_state;
        };
    };

}; */
