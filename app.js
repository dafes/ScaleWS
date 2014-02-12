/**
 * Module dependencies.
 */
var express = require('express'),
  http = require('http'),
  path = require('path'),
  app = express(),
  io = require('socket.io');
var mongoose = require('mongoose');
var config = require('./config.js')(app, express, mongoose);

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var socketio = io.listen(server);
socketio.set('log level', 1);
var sockets= socketio.sockets;

var measures = require('./app/models/measure')(mongoose, sockets);
// measures.db.collections.measures.find({}, function(message, result){
//   console.log(result);
// });

//CRUD functions
var create = function (socket, data) {
  try{
    measures.create(data.value, data.type); //emit a newMeasure to the client
  }catch(err){
    socket.emit('error', err);
  }
};

var read = function (socket, query) {
  measures.find(query, function (err, result) {
    if (!err) {
      socket.emit('read-answer',result);
    } else {
      socket.emit('error', err);
    }
  });        
};

var update = function (socket, element) {
  measures.db.collections.measures.save(element, function(err, result){
    if(err){
      socket.emit('error', err);
    }else{
      socket.emit('update-answer',result);
    }
  });
};

var destroy = function (socket, id) {
  measures.db.collections.measures.remove({_id : id},function(err, result){
    if(err){
      socket.emit('error', err);
    }else{
      socket.emit('delete-answer',result);
    }
  }); 
};






sockets.on('connection', function (socket) {
  //politeness
  socket.emit('news', "hello you !");
  socket.broadcast.emit('news', "new user connected");

  //CRUD
  socket.on('create', function (query){
    create(socket,query);
  });
  socket.on('read', function (query){
    read(socket,query);
  });
  socket.on('update', function (query){
    update(socket,query);
  });
  socket.on('delete', function (query){
    destroy(socket,query);
  });
});




// Routes
var scale = require('./app/routes/cgi-bin')(measures),
  routes = require('./app/routes');

// Client
routes.init(app, model);
// Scale
app.post('/cgi-bin/:page', scale);
app.post('/cgi-bin/:version/:page', scale);
