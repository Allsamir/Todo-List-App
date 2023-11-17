 // exporting the current-date.js moduel to my server.js;
 
 module.exports.getDate = function () {

                     const date = new Date();

                     const options = {
                               weekday: "long",
                               year: "numeric",
                               month: "long",
                               day: "numeric"
                     }; 

                     return date.toLocaleDateString(undefined, options);

           } // this module is an JS Object 


           module.exports.getDay = function () {

                    const date = new Date();

                    const options = {weekday : "long"}; 

                    return date.toLocaleDateString(undefined, options);
           };

           

           console.log(module.exports);