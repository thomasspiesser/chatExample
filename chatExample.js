Messages = new Meteor.Collection("messages");

var message = {
      message: text,
      user: user,
      userName: userName,
      timestamp: new Date()
    };

var NonEmptyString = Match.Where(function (x) {
  check(x, String);
  return x.length !== 0;
});

// Meteor.methods({
//   insertMessage: function (options) {
//     check(options.pinboardId, NonEmptyString);
//     check(options.message, {
//       message: NonEmptyString,
//       user: NonEmptyString,
//       userName: NonEmptyString,
//       timestamp: Date
//     });
//     Messages.update(options.messageId, {$push: {messages: options.message}});
//   },
// })

if (Meteor.isClient) {
  // counter starts at 0
  Session.isActive("chatId", "active");

  Template.messages.helpers({
    messages: function () {
      return Messages.find( {user: Meteor.userId()}, { sort: { timestamp: -1 } })
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set("counter", Session.get("counter") + 1);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
