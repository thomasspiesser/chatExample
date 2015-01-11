Messages = new Meteor.Collection("messages");

if (Meteor.isClient) {
  Template.body.helpers({
    error: function() {
    return Session.get("createError");
    }
  });

  Template.login.helpers({
    randomUsername: function () {
      var user = Random.choice(["scary", "sweet", "tricky", "green", "holy", "red", "funny", "sophisticated", "smart"])
      var name = Random.choice(["elephant", "mouse", "rabbit", "cat", "dog", "weasel", "horse", "tiger"])
      var username = user + ' ' + name
      return username;
    },
    randomPassword: function () {
      var password = Math.random().toString(36).substr(2,6);
      return password;
    }
  });

  Template.login.events({
    'click #signUpButton': function (event,template) {
      var username = template.find('#username').value;
      var password = template.find('#password').value;

      Accounts.createUser({username: username, password : password}, function(err){
        if (err) {
          Session.set( "createError", "Sorry, "+err.reason );
        } else {
          Session.set( "createError", '' );
        }
      });
      return false;
    }
  });

  Template.messages.helpers({
    messages: function () {
      return Messages.find( {}, { sort: { timestamp: 1 } })
    }
  });

  Template.messages.events({
    'click .sendNewMessage': function (event, template) {
      var text = template.find('#inputField').value;
      var user = Meteor.userId();
      var username = Meteor.user().username;

      if (text.length) {
        var message = {
          message: text,
          user: user,
          username: username,
          timestamp: new Date()
        };
        Messages.insert(message, function (error, result) {
          if (error) {
            Session.set( "createError", "Sorry, "+err.reason );
          }
          else {
            $('#inputField').val("");
            Session.set( "createError", '' );
            $("#messageContainer").animate({scrollTop:$("#messageContainer")[0].scrollHeight}, 1000);
          }
        });
      } else {
        Session.set( "createError", "Please, write something" );
      }
    return false;
    }
  });

  Template.logout.events({
    'click #logoutButton': function () {
      var id = Meteor.userId();
      Meteor.logout;
      Meteor.call('Remove', id);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
  Meteor.methods({
    Remove: function (id) {
      Meteor.users.remove({_id: id});
    }
  })
}
