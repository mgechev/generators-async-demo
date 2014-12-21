/* global console, Promise, XMLHttpRequest */

function getJSON(url) {
  'use strict';
  var xhr = new XMLHttpRequest();
  var d = Promise.defer();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        d.resolve(JSON.parse(xhr.responseText));
      } else {
        d.reject(xhr.responseText);
      }
    }
  };
  xhr.open('GET', url);
  xhr.send();
  return d.promise;
}

function spawn(genFunc) {
  'use strict';
  var generator = genFunc();
  function co(type, arg) {
    var res;
    try {
      res = generator[type](arg);
    } catch (e) {
      return Promise.reject(e);
    }
    if (res.done) {
      if (type === 'throw') {
        return arg;
      } else {
        return res.value;
      }
    } else {
      return Promise.resolve(res.value)
      .then(function (val) {
        return co('next', val);
      }, function (err) {
        return co('throw', err);
      });
    }
  }
  co('next');
}

function loadUsers() {
  'use strict';
  spawn(function * () {
    var users = yield getJSON('users.json');
    for (var user of users.users_list.map(getJSON)) {
      console.log(yield user);
    }
  });
}

loadUsers();
