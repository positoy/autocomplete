var fs = require('fs');
var cheerio = require('cheerio');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var serve_static = require('serve-static');
app.use(serve_static("."));

var _GLOBAL = {};
_GLOBAL.path_reference = "./user_data/";


app.get('/', function(req, res){
  res.sendfile('editor.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
    
    socket.on("getList", function(path) {
        
        var class_path = _GLOBAL.path_reference + path;
        console.log(class_path);
        
        fs.readFile(class_path, function(err, html) {

            var methods_list = [];

            if (err)
            {
                socket.emit("getList_response", null);
                throw err;
            }
            else
            {
                var $ = cheerio.load(html);

                $(".jd-details-title").each(function(){

                    if ($(this).children(".normal").length == 2) {
                        var obj = {};
                        obj.arr = [];

                        obj.name = $(this).children(".sympad").text();
                        obj.arr.push($(this).text().split(obj.name)[0].trim().replace(/(\r\n|\n|\r)/gm,"").replace(/\s{2,}/g, ' '));
                        obj.arr.push($(this).text().split(obj.name)[1].trim().replace(/(\r\n|\n|\r)/gm,"").replace(/\s{2,}/g, ' '));

                        methods_list.push(obj);
                    }
                });

                socket.emit("getList_response", methods_list);
            }
        });
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
