"use strict";

/*
 * Created with @iobroker/create-adapter v1.21.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const safeJsonStringify = require('./lib/json');

class Chartjs extends utils.Adapter {

    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    constructor(options) {
        super({
            ...options,
            name: "chartjs",
        });
        this.on("ready", this.onReady.bind(this));
        this.on("objectChange", this.onObjectChange.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }

    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here

        // in this template all states changes inside the adapters namespace are subscribed
        //this.subscribeStates("*");
    }

    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     * @param {() => void} callback
     */
    onUnload(callback) {
        try {
            this.log.info("cleaned everything up...");
            callback();
        } catch (e) {
            callback();
        }
    }

    /**
     * Is called if a subscribed object changes
     * @param {string} id
     * @param {ioBroker.Object | null | undefined} obj
     */
    onObjectChange(id, obj) {
        if (obj) {
            // The object was changed
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        } else {
            // The object was deleted
            this.log.info(`object ${id} deleted`);
        }
    }

    /**
     * Is called if a subscribed state changes
     * @param {string} id
     * @param {ioBroker.State | null | undefined} state
     */
    onStateChange(id, state) {
        if (state) {
            // The state was changed
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            // The state was deleted
            this.log.info(`state ${id} deleted`);
        }
    }

    /**
     * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
     * Using this method requires "common.message" property to be set to true in io-package.json
     * @param {ioBroker.Message} obj
     */
    onMessage(obj) {
    	if (typeof obj === "object" && obj.message) {
            switch (obj.command) {
    		    case "gen2file":
        			// Send response in callback if required
                    this.generateToFile(obj.message.width, obj.message.height, obj.message.config, obj.message.filename)
                    .then(() => {
                        if (obj.callback) this.sendTo(obj.from, obj.command, obj.message.filename, obj.callback);
                    });
                    break;
                default:
                    this.log.warn('Unknown command: ' + obj.command);
                    break;
    		}
    	}
    }

    generateToFile(width, height, config, filename) {
        const canvasRenderService = new ChartJSNodeCanvas({width, height, chartCallback: (ChartJS) => {
            ChartJS.defaults.global.responsive = true;
            ChartJS.defaults.global.maintainAspectRatio = false;
        }});
        return this.parseDatasets(config)
        .then((config) => {
            this.log.debug(safeJsonStringify(config));
            return canvasRenderService.renderToBuffer(config);
        })
        .then((res) => {
            return new Promise((resolve, reject) => {
                fs.writeFile(filename, res, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });
        })
        .catch((err)=>{
            this.log.error(err.stack);
            reject(err);
        });
    }

    sendToPromise(adaper, cmd, params) {
        return new Promise((resolve, reject)=>{
            this.sendTo(adaper, cmd, params, (result) => {
                resolve(result);
            });
        });
    }

    parseDatasets(config) {
        return new Promise(async (resolve, reject) => {
            if (config && config.data.datasets) {
                for (const dataset of config.data.datasets) {
                    if (dataset.data && dataset.data.type == 'history') {
                        dataset.data = await this.sendToPromise(
                            dataset.data.source, 
                            'getHistory', 
                            {
                                id: dataset.data.id,
                                options: {
                                    start: dataset.data.start,
                                    end: dataset.data.end,
                                    aggregate: 'onchange'
                                }
                            }
                        ).then((result) => {
                            return result.result.length ? result.result : [];
                        })
                        .then((result) => {
                            return result.map((item) => {
                                return {y: item.val, t: new Date(item.ts)}
                            })
                        });
                    }
                }
            }
            return resolve(config);
        });
    }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export the constructor in compact mode
    /**
     * @param {Partial<ioBroker.AdapterOptions>} [options={}]
     */
    module.exports = (options) => new Chartjs(options);
} else {
    // otherwise start the instance directly
    new Chartjs();
}
