# Twitter-Crawler
Get tweets from followers of any account using Twitter's API.
Please use it for account valuation analysis.

#### How to setup

1. Install
```bash
git clone https://github.com/tomokazukozuma/Twitter-Crawler.git
```
2. npm

```bash
cd Twitter-Crawler
npm install
npm install -g sequelize-cli
```

3. Setting Environment Variables
```bash
vi .env

CONSUMER_KEY=consumer-key
COMSUMER_SECRET=consumer-secret
ACCESS_TOKEN_KEY=access-token-key
ACCESS_TOKEN_SECRET=access-token-secret
```

4. Setting Database for MySQL

Setting sequelize config
```bash
vi sequelize/config/config.json

{
    "local": {
        "username": "user",
        "password": "password",
        "database": "twitter_crawler",
        "host": "127.0.0.1",
        "dialect": "mysql",
        "dialectOptions": {
            "charset": "utf8mb4"
        },
        "logging": false
    }
}
```

Create MySQL Database
```bash
mysql -u user -p
CREATE DATABASE twitter_crawler;
```

Execute Migaration
```bash
cd sequelize
sequelize db:migrate --env local
```

5. Run

```bash
babel-node script/twitter/twitter_follower.js --screenName=`Any screen name`
```

```bash
babel-node script/twitter/twitter_follower_tweet.js
```