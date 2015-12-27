Simeon
======

Access control for isomorphic javascript applications

![Saint Peter holding the keys to the pearly gates](http://parish.rcdow.org.uk/hatfieldsouth/wp-content/uploads/sites/209/2013/10/hatfield-south-st-peter.jpg)


Status
------

This package is in an experimental stage. It has not tested been tested in any context except Meteor.


Philosophy
----------

Simeon gives you a flexible, readable and future-proof way to set up your access control.

```javascript
simeon(user).only().admin().or().authorOfPost(post).allowed();
```

The idea is to stimulate you to write your access rules as composable functions. The assumptions are that you start with a user object and end with a boolean.


Usage
-----

**Basic usage**

```javascript
const user = { admin: true };

const admin = user => user.admin === true;

const allowed = simeon(user).only(admin).allowed();

if (allowed) {
  doProtectedThing();
}
 ```


User fetching
-------------

**Usage**

In most applications there will be boilerplate code involved in fetching a user. You register a function to Simeon to fetch the user.

```javascript
simeon.user(() => user);
```

After which calling Simeon looks like this:

```javascript
simeon().only(admin).allowed();
```

**Example: Passport**

A [Connect](https://github.com/senchalabs/connect) or [Express](http://expressjs.com/) app using [Passport](http://passportjs.org/docs/configure) session can expose user object as such

```javascript
let user;

app.use(passport.session());
app.use(req => {
  user = req.user;
  next();
});

simeon.user(() => user);
```

**Example: Meteor**

Meteor makes this very easy. *Note: this won't work in [publications](http://docs.meteor.com/#/full/meteor_user)*

```javascript
simeon.user(Meteor.user);
```

**Arguments**

If you need runtime arguments, that's also possible:

```javascript
const getCurrentUser = ({session}, users) => {
  return users.findOne(session.userId);
};

simeon(req, users).only(admin).allowed();
```


Composing rules
---------------

and, or, xor, some / any, every / all, none, notAll

```javascript
const withEditCommentPermission = (user, comment) => {
  return admin(user) | authorOfComment(user, comment);
}
```

```javascript
const withEditCommentPermission = simeon.or(admin, authorOfComment);
```


Registering rules
-----------------

Registering to be used on 

```javascript
simeon.addRule('admin', user => user.admin === true);
```

```javascript
simeon().only().admin().allowed();
```

**Multiple instances**

```javascript
const guard = simeon.instance();
```


Granted and denied
------------------

Rather than using the returned boolean, you may want to set functions to execute when access is either granted or denied.

```javascript
simeon.granted(() => console.log('Hurrah!'));
simeon.denied(() => throw new Error('Boo!'));
```

*What does it get as arguments? (like in 'As middleware?')*


As middleware
-------------

```javascript
const authorOfComment = (user, comment) => user._id === comment.authorId;

simeon.addRule('authorOfComment', authorOfComment);

simeon.granted(({next}) => next());
simeon.denied(({req}) => req.status(403).send('Forbidden'));

app.get('/comment/:id/edit', (req, res, next) => {
  const comment = Comments.findOne(req.params.id);
  simeon().only().authorOfComment(comment).allowed({req, next});
}, 
```


Multiple instances
------------------

If you expect to 

```javascript
postGuard = simeon.clone();
```


Asynchronous rules
------------------



Subsetting data
---------------



To do
-----

Disallow using 'simeon' directly?

```javascript
const guard = simeon.instance();
const otherGuard = guard.clone();
```

Data chaining?

```javascript
simeon({user, comment}).only().admin().or().authorOfComment().allowed();
```

Steams?
