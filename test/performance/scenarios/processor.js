module.exports = {
  generateUserData: function (userContext, events, done) {
    const salt = Math.random().toString(36).substring(2, 10);
    userContext.vars = userContext.vars || {};
    userContext.vars.email = `user_${salt}@example.com`;
    userContext.vars.password = `Pass123!`;
    userContext.vars.firstName = `First${salt}`;
    userContext.vars.lastName = `Last${salt}`;
    return done();
  },

  generateEventData: function (userContext, events, done) {
    const salt = Math.random().toString(36).substring(2, 10);
    userContext.vars = userContext.vars || {};
    userContext.vars.eventName = `Event ${salt}`;
    userContext.vars.eventDescription = `Description for event ${salt}`;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    userContext.vars.eventDate = tomorrow.toISOString();

    return done();
  },
};
