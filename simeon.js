/**
 * Evaluation builder factory
 *
 * Calling simeon gives you an evaluation builder. With this builder you can use an
 * expressive chaining syntax to figure out whether or not a user is allowed to do
 * things.
 *
 * @returns {simeon} The evaluation builder factory
 */
simeon = (function(_){

  /**
   * Simeon's default options
   *
   * @type {{user: undefined, roles: {}, granted: (function()), denied: (function(*))}}
   */
  const config = {
    user: undefined,
    roles: {},
    granted() {
      return true;
    },
    denied(reason) {
      throw new Error(`Not authorized`);
    }
  };

  /**
   * Configure a set of simeon options
   *
   * @param options
   * @param user
   * @param granted
   * @param denied
   */
  function configure(options, {user, granted, denied}) {
    if (typeof user !== "undefined") { options.user = user; }
    if (typeof granted !== "undefined") { options.granted = granted; }
    if (typeof denied !== "undefined") { options.denied = denied; }
  }

  /**
   * Methods for configuring simeon's access control
   *
   * @type {{addRole: (function(*, *)), configure: (function(*, *, *))}}
   */
  var simeonInterface = {

    /**
     * Add a new role
     *
     * @param name
     * @param test
     */
    addRole(name, test) {
      config.roles[name] = test;
    },

    /**
     * Configure simeon
     *
     * @param user
     * @param granted
     * @param denied
     */
    configure({user, granted, denied}) {
      configure(config, {user, granted, denied});
    }
  };

  /**
   * Examination builder factory
   *
   * Returns an examination builder, to which you can add checks to see
   * whether a user has permission to do something.
   *
   * @param user
   * @returns {examinationBuilder}
   */
  var examinationBuilder = function(user) {
    var roles = {};
    var options = _.extend({}, config);

    if (typeof user !== "undefined") { options.user = user; }
    if (typeof options.user === "function") { options.user = options.user(); }

    return {

      /**
       * Add a required role
       *
       * @param name
       * @returns {examinationBuilder}
       */
      only(name) {
        roles[name] = config.roles[name];
        return this;
      },

      /**
       * Run the examination
       *
       * @param granted
       * @param denied
       * @returns {*}
       */
      allowed({granted, denied}={}) {
        configure(options, {granted, denied});
        _.each(roles, (test, name) => {
          if (!test(options.user)) {
            return options.denied(`User is not ${name}`);
          }
        });
        return options.granted();
      }
    }
  };

  return _.extend(examinationBuilder, simeonInterface);
}(_));
