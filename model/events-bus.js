const EventsBus = {
    subscribers: {},

    createSubscriberEntry: (event) => {
        if (!EventsBus.subscribers.hasOwnProperty(event)) {
            EventsBus.subscribers[event] = [];
        }
    },

    unsubscribe: (event, callback) => {
        if (EventsBus.subscribers.hasOwnProperty(event)) {
            EventsBus.subscribers[event] = EventsBus.subscribers[event].filter(
                registeredCallback => registeredCallback !== callback
            );

            if (EventsBus.subscribers[event].length < 1) {
                delete EventsBus.subscribers[event];
            }
        }
    },

    subscribe: (event, callback) => {
        EventsBus.createSubscriberEntry(event);
        EventsBus.subscribers[event].push(callback);
    },

    subscribeOnce: (event, callback) => {
        EventsBus.subscribe(event, (data) => {
            EventsBus.unsubscribe(event, callback);
            callback(data);
        });
    },

    dispatch: (event, data) => {
        if (data === undefined) {
            data = null;
        }

        if (EventsBus.subscribers.hasOwnProperty(event)) {
            EventsBus.subscribers[event].forEach(callback => callback(data));
        }
    }
};

module.exports = EventsBus;
