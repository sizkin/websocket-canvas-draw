(function() {
  var App, Bg;
  window.App = App = {};
  window.Bg = Bg = {};
  /*
   * Init 
   */
  App.init = function() {
    App.canvas = document.getElementById('whiteboard');
    App.canvas.width = $('#container').width();
    App.canvas.height = $('#container').height();
    App.ctx = App.canvas.getContext("2d");
    App.ctx.fillStyle = "solid";
    App.ctx.strokeStyle = $('#stroke_color').val();  // #ECD018
    App.ctx.lineWidth = 5;
    App.ctx.lineCap = "round";
    App.socket = io.connect('http://localhost:8002');
    App.socket.on('draw', function(data) {
      return App.draw(data.x, data.y, data.type);
    });
    App.socket.on('clearAll', function(data) {
      return App.ctx.clearRect(0, 0, App.canvas.width, App.canvas.height);        
    });
    App.draw = function(x, y, type) {
      if (type === "dragstart") {
        App.ctx.beginPath();
        return App.ctx.moveTo(x, y);
      } else if (type === "drag") {
        App.ctx.lineTo(x, y);
        return App.ctx.stroke();
      } else {
        return App.ctx.closePath();
      }
    };
  };
  /*
   * Background
   */
  Bg.init = function() {
    Bg.socket = io.connect('http://localhost:8002');
    Bg.socket.on('setBackground', function(data) {
      if ( $('.background').length > 0 ) {
        Bg.update(data.base64Img);
      } else {
        Bg.create(data.base64Img);
      }
    });

    Bg.create = function(bgData) {
      Bg.element = document.createElement('div');
      Bg.element.className = 'background';
      $('#container').append(Bg.element);
      // console.log(bgData);
      $('.background').width($('#container').width()).height($('#container').height());
      $('.background').css({ 'background': 'url('+ bgData +') no-repeat' });
    };

    Bg.update = function(bgData) {
      $('.background').css({ 'background': 'url('+ bgData +') no-repeat' });
    };
  };
  /*
   * Draw Events
   */
  $(function() {
    App.init();
    Bg.init();
    $('#container').on('drag dragstart dragend', '#whiteboard', function(e) {
      var offset, type, x, y;
      type = e.handleObj.type;
      offset = $(this).offset();
      e.offsetX = e.clientX- offset.left;
      e.offsetY = e.clientY - offset.top;
      x = e.offsetX;
      y = e.offsetY;
      // console.log($(this).offset());
      // console.log(e);
      App.draw(x, y, type);
      App.socket.emit('drawStart', {
        x: x,
        y: y,
        type: type
      });
    });

    $('#choose_bg').change(function(e) {
      // console.log(e);
      var reader = new FileReader();
      var file = e.target.files[0];
      reader.readAsDataURL(file);
      reader.onloadend = function() {
        var bgData = reader.result;
        console.log(reader);
        Bg.create(bgData);
        Bg.socket.emit('wantSetBackground', {
          base64Img: bgData    
        });
      };
    }); 

    $('#stroke_color').change(function(e) {
      var newStrokeColor = $(this).val();
      App.ctx.strokeStyle = newStrokeColor;      
    });

    $('#clearDraw').click(function(e) {
      App.ctx.clearRect(0, 0, App.canvas.width, App.canvas.height);
      App.socket.emit('clearBoard');
    });

    /*
     * label attr(for) workaround for FF
     */
    if ($.browser.mozilla) {
      $('label').live('click', function(e) {
        if (e.target == this) {
          $('#' + $(this).attr('for')).trigger('click');
        }
      });
    }
  });
}).call(this);
