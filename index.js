const crypto = require('crypto');
const express = require('express');
const cookieparser = require('cookie-parser');
const logger = require('./server/logger');
const apiRouter = require('./server/api');
const app = express();
app.use(cookieparser());

app.use((req, res, next) => {
  const begin = new Date();

  res.on('finish', () => {
    const end = new Date();

    logger.info('finished response', {
      method: req.method,
      url: req.originalUrl,
      status_code: res.statusCode,
      response_time: end - begin
    });
  });
  next();
});

app.use((req, res, next) => {
  if (!req.cookies || !req.cookies.sessionid) {
    res.cookie('sessionid', crypto.randomBytes(32).toString('hex'), {
      path: '/',
      httpOnly: true
    });
  }

  next();
});

app.use('/api', apiRouter);
app.use(express.static('dist'));
app.use((req, res) => {
  if (!res.headersSent) {
    res.sendFile(__dirname + '/dist/index.html');
  }
});

app.listen(3000, () => {
  logger.info('listening on :3000');
});
