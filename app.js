const http = require('http');

const start = () => {
  
  const app = require('./config/express')();   
  
  var server = http.createServer(app);
  server.listen(process.env.PORT || 8080, () =>{
    console.log(`Express server starting`   )
  });

  server.timeout = 240000;

}

exports = start;
start();
