var express  = require('express'),
    form     = require('connect-form'),
    fs       = require('fs'),
    util     = require('util'),
    products = require('./products'),
    photos   = require('./photos'),
    users    = require('./users');

var app = express.createServer(
  form({keepExtensions: true})
);

// Configuration

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.session({ secret: "keyboard cat" }));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

app.dynamicHelpers(
  {
    session: function(req, res) {
      return req.session;
    },

    flash: function(req, res) {
      return req.flash();
    }
  }
);

function requiresLogin(req, res, next){
  if (req.session.user) {
    next();
  } else {
    res.redirect('/sessions/new?redir=' + req.url);
  }
};

/**
 * Routes
 */

// Products

app.get('/', function(req, res) {
  res.render('root');
});

app.get('/sessions/new', function(req, res) {
  res.render('sessions/new', {
    redir: req.query.redir
  });
});

app.post('/sessions', function(req, res) {
  users.authenticate(req.body.login, req.body.password, function(user) {
    if (user) {
      req.session.user = user;
      res.redirect(req.body.redir || '/');
    } else {
      req.flash('warn', 'Login failed');
      res.render('sessions/new', {
        redir: req.body.redir
      });
    }
  });
});

app.get('/sessions/destroy', function(req, res) {
  delete req.session.user;
  res.redirect('/sessions/new');
});

app.get('/products', function(req, res) {
  res.render('products/index', {
    products: products.all
  });
});

app.get('/products/new', requiresLogin, function(req, res) {
  res.render('products/new', {
    product: req.body && req.body.product || products.new()
  });
});

app.post('/products', requiresLogin, function(req, res) {
  var id = products.insert(req.body.product);
  res.redirect('/products/'+id);
});

app.get('/products/:id', function(req, res) {
  var product = products.find(req.params.id);
  res.render('products/show', {
    product: product
  });
});

app.get('/products/:id/edit', requiresLogin,  function(req, res) {
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

app.put('/products/:id', requiresLogin, function(req, res) {
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

app.get('/photos/new', requiresLogin, function(req, res) {
  res.render('photos/new');
});

app.post('/photos', requiresLogin, function(req, res) {
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