var users = {
  'admin' : {login: 'admin', password: 'admin', role: 'admin'},
  'user' : {login: 'user', password: 'user', role: 'user'},
};

module.exports.authenticate = function(login, password, callback) {
  var user = users[login];
  if (!user) {
    callback(null);
    return;
  }
  if (user.password == password) {
    callback(user);
    return;
  }
  callback(null);
}