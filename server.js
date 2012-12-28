
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , room = require('./routes/room')
  , http = require('http')
  , path = require('path')
  , socket = require('socket.io');

var app = express();
var server, io;

app.configure(function(){
  app.set('port', process.env.PORT || 8002);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  // app.use(express.basicAuth('testUser', 'testPass'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/', routes.index);
app.get('/room', room.list);
app.post('/room/create', room.create);
app.get('/room/:roomId', room.info);
app.get('/room/:roomId/delete', room.delete);

server = http.createServer(app);
io = socket.listen(server);

io.sockets.on('connection', function(socket) {
  socket.on('drawStart', function(data) {
    socket.broadcast.emit('draw', {
      x: data.x,
      y: data.y,
      type: data.type 
    });
  });

  socket.on('clearBoard', function(data) {
    socket.broadcast.emit('clearAll', {});    
  });

  socket.on('wantSetBackground', function(data) {
    socket.broadcast.emit('setBackground', {
      base64Img: data.base64Img    
    });    
  });
});

server.listen(app.get('port'));
console.log("Express server listening on port " + app.get('port'));
