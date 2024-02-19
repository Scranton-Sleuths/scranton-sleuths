const test_routes = require('./test_routes');

const constructorMethod = (app) => {
    app.use('/test', test_routes);
    app.use('*', (req, res) => {
      res.status(404).json({error: 'Not found'})
    });
  };
  
  module.exports = constructorMethod;