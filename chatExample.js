Messages = new Meteor.Collection("messages");

Meteor.methods({
  insertMessage: function(message) {
    var message = _.pick(message, 'message', 'user', 'username', 'timestamp');
    check(message, {
      message: String,
      user: String,
      username: String,
      timestamp: Date});
    Messages.insert(message);
    Meteor.call('removeIfTooMany');
  }
});

if (Meteor.isClient) {
  Meteor.subscribe('messages');
  

  Template.errorMessage.helpers({
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

      Accounts.createUser({username: username, password: password}, function(err){
        if (err) {
          Session.set( "createError", err.reason );
        } else {
          Session.set( "createError", '' );
        }
      });
      return false;
    }
  });

  Tracker.autorun(function () {
    var latest = Messages.find({}, { sort: { timestamp: -1 }, limit: 1 }).fetch();
    if (latest.length) {
      $("#messageContainer").animate({scrollTop:$("#messageContainer")[0].scrollHeight}, 1000);
    }
  });

  Template.messages.rendered = function () {
    $("#messageContainer").animate({scrollTop:$("#messageContainer")[0].scrollHeight}, 1000);
  };

  Template.messages.helpers({
    messages: function () {
      return Messages.find( {}, { sort: { timestamp: 1 } })
    },
    when: function () {
      return this.timestamp.toLocaleString();
    },
    ownMessage: function () {
      return Meteor.userId() === this.user ? 'float: right; background-color:rgba(215, 44, 44, 0.3);':'';
    }
  });

  Template.messages.events({
    'click .sendNewMessage, submit .form': function (event, template) {
      event.preventDefault()
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
        Meteor.call('insertMessage', message, function (error, result) {
          if (error) {
            Session.set( "createError", error.reason );
          }
          else {
            $('#inputField').val("");
            Session.set( "createError", '' );
          }
        });
      } else {
        Session.set( "createError", "Message may not be empty." );
      }
      return false;
    }
  });

  Template.logout.events({
    'click #logoutButton': function () {
      var id = Meteor.userId();
      Meteor.logout();
      Meteor.call('Remove', id);
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish("messages", function() {
    if (!this.userId) return this.ready(); 
    return Messages.find();
  });
  Meteor.methods({
    Remove: function (id) {
      Meteor.users.remove({_id: id});
    },
    removeIfTooMany: function () {
      var messageCount = Messages.find( {} ).count();
      var maxMessagesAllowed = 50;
      if (messageCount > maxMessagesAllowed) {
        var messages = Messages.find( {}, { sort: { timestamp: -1 }, skip: maxMessagesAllowed }).fetch();
        var ids = _.pluck(messages, '_id');
        Messages.remove({_id: {$in: ids} });
      }
    }
  })
}
