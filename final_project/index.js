const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const auth = require('./router/auth_users.js');
const customer_routes = auth.authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();
app.use(express.json());

app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
  })
);

app.use('/customer/auth/*', (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, auth.SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log('Server is running'));
