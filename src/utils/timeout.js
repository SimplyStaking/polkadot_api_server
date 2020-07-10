const Timeout = require('await-timeout');

module.exports = {
    callFnWithTimeoutSafely: async function (
        callback, params, timeout, returnIfTimeoutExceeded
    ) {
        const timer = new Timeout();
        try {
            return await Promise.race([
                callback.apply(this, params),
                Timeout.set(timeout, returnIfTimeoutExceeded)
            ]);
        } finally {
            timer.clear();
        }
    }
};
