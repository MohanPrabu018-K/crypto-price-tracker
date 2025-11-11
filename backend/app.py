from flask import Flask, jsonify
from flask_cors import CORS
import requests, time

app = Flask(__name__)
CORS(app)

cached_data = []
last_fetch = 0

@app.route("/get_top_coins")
def get_top_coins():
    global cached_data, last_fetch
    if time.time() - last_fetch < 3 and cached_data:
        return jsonify(cached_data)

    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": 100,
        "page": 1,
        "sparkline": "false",
        "price_change_percentage": "24h"
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()

        coins = []
        for coin in data:
            coins.append({
                "id": coin["id"],
                "name": coin["name"],
                "symbol": coin["symbol"].upper(),
                "price": coin["current_price"],
                "change": coin["price_change_percentage_24h"],
                "image": coin["image"],
                "market_cap": coin["market_cap"],
                "high_24h": coin["high_24h"],
                "low_24h": coin["low_24h"],
                "circulating_supply": coin["circulating_supply"]
            })

        cached_data = coins
        last_fetch = time.time()
        return jsonify(coins)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
