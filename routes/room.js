
/*
 * GET rooms listing.
 */

var roomsPool = [];

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.info = function(req, res) {
  var roomId = req.params.roomId;
  var room = roomsPool[roomId];
  res.send(room.name);
};

exports.create = function(req, res) {
  if (req.body.roomName) {
    var rid = roomsPool.length+1;
    roomsPool.push({
      id: rid,
      name: req.body.roomName,
      private: req.body.private,
      password: req.body.password
    });
    res.setHeader("Location", "/" + rid);
    return res.send(302);
  } else {
    res.setHeader("Location", "/");
    res.send(404);
  }
};

exports.delete = function(req, res) {
  
};
