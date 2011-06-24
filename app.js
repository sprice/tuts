var express  = require('express'),
    form     = require('connect-form'),
    fs       = require('fs'),
    util     = require('util'),
    products = require('./products'),
    photos = require('./photos');

var app = express.createServer(
  form({keepExtensions: true})
);

// Configuration

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.logger());
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

/**
 * Routes
 */

// Products

app.get('/', function(req, res) {
  res.render('root');
});

app.get('/products', function(req, res) {
  res.render('products/index', {
    products: products.all
  });
});

app.get('/products/new', function(req, res) {
  res.render('products/new', {
    product: req.body && req.body.product || products.new()
  });
});

app.post('/products', function(req, res) {
  var id = products.insert(req.body.product);
  res.redirect('/products/'+id);
});

app.get('/products/:id', function(req, res) {
  var product = products.find(req.params.id);
  res.render('products/show', {
    product: product
  });
});

app.get('/products/:id/edit', function(req, res) {
  var product = products.find(req.params.id);
  photos.list(function(err, photo_list) {
    if (err) {
      throw err;
    }
    res.render('products/edit', {
      product: product,
      photos: photo_list
    });
  });
});

app.put('/products/:id', function(req, res) {
  var id = req.params.id;
  products.set(id, req.body.product);
  res.redirect('/products/'+id);
});

// Photos

app.get('/photos', function(req, res) {
  photos.list(function(err, photo_list) {
    res.render('photos/index', {
      photos: photo_list
    });
  })
});

app.get('/photos/new', function(req, res) {
  res.render('photos/new');
});

app.post('/photos', function(req, res) {
  // from https://gist.github.com/893110
  req.form.complete(function(err, fields, files) {
    if(err) {
      next(err);
    } else {
      ins = fs.createReadStream(files.photo.path);
      ous = fs.createWriteStream(__dirname + '/public/uploads/photos/' + files.photo.filename);
      util.pump(ins, ous, function(err) {
        if(err) {
          next(err);
        } else {
          res.redirect('/photos');
        }
      });
    }
  });
});

// Only listen on $ node app.js
if (!module.parent) {
  app.listen(4000);
  console.log("Express server listening on port %d", app.address().port);
}