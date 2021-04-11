# discordselfbot

## How to run

1. Clone the repo

`$ git clone https://github.com/RaresGeo/discord-self.git`

2. Install dependencies. This might take a bit due to puppeteer installing chromium

`$ npm install`

3. Create a config.json file in the root directory, it should look like this:
```js
{
  "token": "yourtokengoeshere",
  "prefix": "%",
  "uid": "295120422244950012",
  "messageLife": 10
}
```
  Or use environment variables, it's set up to work with that or Heroku config vars (check the first function in global.js). 
  Google how to get your token, it seems to change from time to time but here's a basic idea of how to do it:
    ctrl + shift + I to inspect element in Discord
    Go to application
    Type in token in the filter/search bar at the top
    In the top left click on the mobile/tablet looking icon
    If it did not show up, press ctrl + shift + r and that should be it
    
4. Delete balance.js and copygamba.js, they only work with unbelievaboat. Or if you would like to use them you will have to make a gamble.json file in the db folder
  It should look like this: 
```js
{
    "ignoredCommands": [
        "give",
        "bj",
        "crime",
        "slut",
        "lb",
        "bal",
        "blackjack",
        "money",
        "leaderboard"
    ],
    "botId": "292953664492929025",
    "cazinoPrefix": ";",
    "channel": "824002104354930688",
    "cazinoChannel": "824002104354930688",
    "testingChannel": "829052515022274580"
}
```

4. Run the bot!

`$ npm start`

  Or do `$ node app.js -d` if you want to test the gambling commands in the testing channel rather than the casino channel (Yes, I know casino is spelled with an s, it's a joke.)

5. Hopefully not get banned. 
  Self bots are against Discord ToS so I am not liable for any loss of property or damages as a result of the use of this bot.
  A word of advice, set this up on an alt account and make more commands to work like a portable bot that's in every server. That's what the %op or %trust command is for.
