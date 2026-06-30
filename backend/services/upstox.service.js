import UpstoxClient from "upstox-js-sdk";

class UpstoxService {
    constructor() {
        this.streamer = null;
        this.subscribedKeys = new Set();
        this.eventListeners = [];
        this.isConnected = false;
    }

    connect() {
        const token = process.env.UPSTOX_ACCESS_TOKEN;
        if (!token) {
            console.error("UPSTOX_ACCESS_TOKEN is missing. Skipping market data connection.");
            return;
        }

        const defaultClient = UpstoxClient.ApiClient.instance;
        defaultClient.authentications["OAUTH2"].accessToken = token;

        this.streamer = new UpstoxClient.MarketDataStreamerV3();
        this.streamer.connect();

        this.streamer.on("open", () => {
            this.isConnected = true;
            console.log("Upstox MarketDataStreamer connected.");
            if (this.subscribedKeys.size > 0) {
                this.streamer.subscribe([...this.subscribedKeys], "full");
                console.log(`Subscribed to ${this.subscribedKeys.size} instrument keys.`);
            }
        });

        this.streamer.on("message", (data) => {
            try {
                const feed = JSON.parse(data.toString("utf-8"));
                if (feed?.feeds) {
                    this.eventListeners.forEach(cb => cb(feed.feeds));
                }
            } catch (err) {
                console.error("Failed to parse market data:", err.message);
            }
        });

        this.streamer.on("error", (err) => {
            console.error("Upstox Streamer Error:", err);
        });

        this.streamer.on("close", () => {
            this.isConnected = false;
            console.log("Upstox Streamer disconnected.");
        });
    }

    subscribe(instrumentKeys) {
        if (!instrumentKeys?.length) return;

        let hasNew = false;
        for (const key of instrumentKeys) {
            if (!this.subscribedKeys.has(key)) {
                this.subscribedKeys.add(key);
                hasNew = true;
            }
        }
        
        if (hasNew && this.streamer && this.isConnected) {
            this.streamer.subscribe([...this.subscribedKeys], "full");
        }
    }

    onMarketData(callback) {
        this.eventListeners.push(callback);
    }
}

export const upstoxService = new UpstoxService();

