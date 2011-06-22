var express = require('express');
var products = require('./products');

var app = express.createServer();

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

// Routes

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
  res.render('products/edit', {
    product: product
  });
});

app.put('/products/:id', function(req, res) {
  var id = req.params.id;
  products.set(id, req.body.product);
  res.redirect('/products/'+id);
});

// Only listen on $ node app.js

if (!module.parent) {
  app.listen(4000);
  console.log("Express server listening on port %d", app.address().port);
}