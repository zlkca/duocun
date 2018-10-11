'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var prompt = require('prompt');

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }

    if (process.env.NODE_ENV == 'development') {
      autoMigrateValidate();
    } else {
      autoUpdate([]);
    }
  });
};

var autoUpdate = function(tables) {
  var ds = app.dataSources.db;
  // if tables list is not supplied - try and extract them from datasource
  if (!tables || tables.length == 0) {
    tables = getTablesFromDataSource(ds);
  }
  console.log(`Starting autoupdate of tables into database ${ds.connector.settings.database}`);

  ds.autoupdate(tables, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log(`Completed auto update of tables: ${tables.join(', ')}.`);
    }
  });
};

var getTablesFromDataSource = function(ds) {
  let modelnames = Object.keys(ds.models);
  let tables = modelnames.filter(function(modelname) {
    let model = ds.models[modelname];
    if (model && model.dataSource && model.dataSource.name === 'db') {
      return true;
    } else {
      return false;
    }
  });
  return tables;
};

var autoMigrateValidate = function() {
  prompt.start();
  prompt.get([{name: 'reply', description: 'Do you want to reset database? (y/n)',
  }], function(err, res) {
    if (res.reply == 'y') {
      // reset data in database
      autoMigrateAction();
    } else {
      console.log('skipping automigrate');
      autoUpdate([]);
    }
  });
};

var autoMigrateAction = function() {
  var ds = app.dataSources.db;
  ds.automigrate(function() {
    createData(ds)
    .then(function() {
      console.log('auto migrate completed');
    });
  });
};

// If required to load data when intializing db
var createData = function(ds) {
  return ds.models.Account.create(
    {username: 'admin', email: 'admin@example.com', password: 'admin', type: 'super'}
  )
  .then(function() {
    return ds.models.Role.create({name: 'super'});
  })
  .then(function(role) {
    return role.principals.create({
      principalType: 'USER',
      principalId: 1,
    });
  })
  .then(function() {
    return ds.models.Account.create([
      {username: 'sun', email: 'sun@example.com', password: 'sun', type: 'business'},
      {username: 'user', email: 'user@example.com', password: 'user', type: 'user'},
    ]);
  })
  .then(function() {
    return ds.models.Restaurant.create([
      {
        name: 'rest 1',
        ownerId: 1,
        location: {lat: 43.721539, lng: -79.451079},
      },
      {
        name: 'rest 2',
        ownerId: 2,
        location: {lat: 43.791539, lng: -79.401079},
      },
      {
        name: 'rest 3',
        ownerId: 2,
        location: {lat: 31.791539, lng: -76.401079},
      },
    ]);
  })
  .then(function() {
    return ds.models.Category.create([
      {
        name: 'category 1',
        description: 'category 1',
      },
    ]);
  })
  .then(function() {
    return ds.models.Product.create([
      {
        name: 'prod 1',
        restaurantId: 1,
        categoryId: 1,
        price: 13,
      },
      {
        name: 'prod 2',
        restaurantId: 1,
        categoryId: 1,
        price: 12,
      },
      {
        name: 'prod 3',
        restaurantId: 1,
        categoryId: 1,
        price: 4,
      },
      {
        name: 'prod 4',
        restaurantId: 2,
        categoryId: 1,
        price: 18,
      },
    ]);
  })
  .catch(function(err) {
    console.log(err);
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module) {
    app.start();
    // app.io = require('socket.io')(app.start());
    // require('socketio-auth')(app.io, {
    //   authenticate: function(socket, value, callback) {
    //     var AccessToken = app.models.AccessToken;
    //     // get credentials sent by the client
    //     var token = AccessToken.find({
    //       where: {
    //         and: [{
    //           userId: value.userId,
    //         }, {
    //           id: value.id,
    //         }],
    //       },
    //     }, function(err, tokenDetail) {
    //       if (err) throw err;
    //       if (tokenDetail.length) {
    //         callback(null, true);
    //       } else {
    //         callback(null, false);
    //       }
    //     });
    //   },
    // });

    // app.io.on('connection', function(socket) {
    //   console.log('a user connected');
    //   socket.on('disconnect', function() {
    //     console.log('user disconnected');
    //   });
    // });
  }
});
