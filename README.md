# vinted-back
## API creation project
A Node.js student project where you can create an account, log in with a token, publish, update and delete offers.

HTTP requests : Postman

Database : MongoDB

## Initialization
Install all packages and node_modules with ```npm i```

## mongoose
Replace ```process.Env.MONGODB_URI``` with your uri.
On local : ```mongobd://localhost/your-project-name```

## Cloudinary
Create a Cloudinary account to store all the files uploaded.
Report the cloud name, api key & api secret on your project : 

```
cloudinary.config({
  cloud_name: "YOUR CLOUD NAME",
  api_key: "YOUR API KEY",
  api_secret: "YOUR API SECRET"
})
```

## app.listen
On local, replace ```process.env.PORT``` by a port of your choice. By default, 3000.

## HTTP requests
You can use Postman for HTTP Requests

## Heroku & MongoDBAtlas
For this project, I used Heroku server & MongoDB Atlas database cloud service.

Requests are possible on : https://vinted-back-tommy.herokuapp.com/offers
