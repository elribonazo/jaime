
export default (protocol, domain, port) => (req, res, next) => {
    res.header('Access-Control-Allow-Origin', `*`);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Accept, Origin, Referer, User-Agent, Content-Type, Authorization, Refresh-Token, Payment-Token, X-Accept-Version');
    res.header('Access-Control-Expose-Headers', 'Accept, Origin, Referer, User-Agent, Content-Type, Authorization, Refresh-Token, Payment-Token, X-Accept-Version');
    res.header('Vary', 'Origin');
    if ('OPTIONS' == req.method) {
        return res.send(200);
    }
    next();
};