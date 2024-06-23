const {createProxyMiddleware} = require('http-proxy-middleware');

module.exports = function (app) {
    console.log("Initializing proxy middleware...");

    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:8080/api',
            changeOrigin: true
        })
    );

    app.use(
        '/v3',
        createProxyMiddleware({
            target: 'http://localhost:8080/v3',
            changeOrigin: true
        })
    );

    console.log("Proxy middleware loaded");
};
