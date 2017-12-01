# notebook

Notebook is a web scraper for my university website.
It uses facebook bot integration for sending messages containing the latest announcements.

http://www.cs.ubbcluj.ro/

>example:
>
>from:
>
>![image](https://user-images.githubusercontent.com/13131778/33073286-17791234-cecb-11e7-834a-7e6b8aa04497.png)
>
>to
>
>![image](https://user-images.githubusercontent.com/13131778/33073030-40bf7e2c-ceca-11e7-9a39-dd3ee360afda.png)
>
>(new post, {url}, description)

#### 1. Motivation

  While studying at my university, I was constantly missing quite interesting news and opportunities that were posted on the faculty website.

#### 2. Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [MongoDB](https://docs.mongodb.com/manual/installation/) installed.

```
Make sure you have a mongodb instance listening on port :27017
```

```
git clone git@github.com:fpopa/notebook.git
cd notebook
npm install
node receiver
```
Your app should now be running on [localhost:3005](http://localhost:3005/).

#### 3. Developing

Use the (http://localhost:3005/dev/:message) endpoint for mocking facebook messages.

Check the console for the result.

## Contributing / Questions

Get in contact with me via the bot. [Notebook](https://www.facebook.com/Notebook-1302927229836873/)

## License

This project is licensed under the terms of the MIT license.
