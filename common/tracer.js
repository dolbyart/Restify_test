const util = require('util');

const appinsights = require('applicationinsights');

let appclient = null;
const init = (opts) => {
    appinsights
        .setup()
        .setAutoDependencyCorrelation(true)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        // .setAutoCollectConsole(true)
        .start();

    appclient = appinsights.defaultClient;

    // assign common properties to all telemetry sent from the default client
    appclient.commonProperties = {
        environment: JSON.stringify(opts || {}),
    };
};

const Instance = function instance() {
    const insight = {
        SeverityLevel: {
            Verbose: 0,
            Information: 1,
            Warning: 2,
            Error: 3,
            Critical: 4,
        },

        /*
        * Log a user action or other occurrence.
        * @param   name    A string to identify this event in the portal.
        * @param   properties  map[string, string] - additional data used to filter
        events and metrics in the portal. Defaults to empty.
        * @param   measurements    map[string, number] - metrics associated with this event,
        displayed in Metrics Explorer on the portal. Defaults to empty.
        */
        trackEvent: (name, properties, measurements) => {
            appclient.trackEvent({
                name: name,
                properties: properties,
                measurements: measurements
            });
            return this;
        },

        /*
         * Log an exception you have caught.
         * @param   exception   An Error from a catch clause, or the string error message.
         * @param   properties  map[string, string] - additional data used to filter
         * events and metrics in the portal. Defaults to empty.
         * @param   measurements    map[string, number] - metrics associated with this event,
         * displayed in Metrics Explorer on the portal. Defaults to empty.
         */
        trackException: (exception, properties, measurements) => {
            console.log(exception);
            if (exception && exception.stack && exception.message) {
                appclient.trackException({
                    exception: exception,
                    properties: properties,
                    measurements: measurements
                });
                return this;
            }

            if (exception !== undefined) {
                const exc = new Error(exception);
                appclient.trackException({
                    exception: exc,
                    properties: properties,
                    measurements: measurements
                });
            }

            return this;
        },

        /*
         * * Log a numeric value that is not associated with a specific event.
         * Typically used to send regular reports of performance indicators.
         * To send a single measurement, use just the first two parameters.
         * If you take measurements very frequently, you can reduce the
         * telemetry bandwidth by aggregating multiple measurements and sending the
         * resulting average at intervals.
         *
         * @param name   A string that identifies the metric.
         * @param value  The value of the metric
         * @param count  the number of samples used to get this value
         * @param min    the min sample for this set
         * @param max    the max sample for this set
         * @param stdDev the standard deviation of the set
         */
        trackMetric: (name, value, count, min, max, stdDev, properties) => {
            appclient.trackMetric(name, value, count, min, max, stdDev, properties);
            return this;
        },

        /*
         * Log a trace message
         * @param   message    A string to identify this event in the portal.
         * @param   severityLevel type of level for severity <see SeverityLevel>
         * @param   properties  map[string, string] - additional data used to filter
         * events and metrics in the portal. Defaults to empty.
         */
        trackTrace: (message, severityLevel, properties) => {
            let msg = message;
            if (util.isArray(message)) {
                msg = util.format.apply(null, message);
            }

            console.log(msg);

            appclient.trackTrace({
                message: msg,
                severity: severityLevel,
                properties: properties
            });
            return this;
        },

        trackDependency: (
            name,
            commandName,
            elapsedTimeMs,
            success,
            dependencyTypeName,
            properties,
            async,
            target
        ) => {
            appclient.trackDependency(
                name,
                commandName,
                elapsedTimeMs,
                success,
                dependencyTypeName,
                properties,
                async,
                target
            );
            return this;
        },
    };

    return insight;
};

module.exports = (opts) => {
    const insight = new Instance();
    init(opts);

    return insight;
};