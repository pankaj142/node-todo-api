var env = process.env.NODE_ENV || 'development';
console.log("****** Environment => ", env);
//Heroku while deploying app on cloud server sets process.env.NODE_ENV to 'production'
//test script in package.json sets process.env.NODE_ENV to 'test'
//if none of the above case, env is set to 'development' 

if(env === 'development'){
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
}else if(env === 'test'){
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}

//Different Environments
//1. development - we set when app runs locally 
//2. testing - when we run app through mocha(testing framework)
//3. production - deploying app on cloud services like Heroku

//we can set up different values for following environment variables according to environment types
//1. PORT
//2. NODE_ENV
//3. MONGODB_URI

//process.env global variable is injected by the Node at runtime for your application to use and it represents 
//the state of the system environment your application is in when it starts. 

//Basically environment variables are used to make your app run in any environment(other computers, cloud servers or inside container(using Docker))

//Here are some specific examples of common scenarios when you should consider using environment variables.
//1. Which HTTP port to listen on
//2. Pointing to a development, test, or production database
//3. What path and folder your files are located in, that you want to serve

// test script from package.json 
//"test": "export NODE_ENV=test || SET \"NODE_ENV=test\" && mocha server/**/*.test.js"
// "test": "export NODE_ENV=test  => for OSX and Linux OS
// SET \"NODE_ENV=test\"  => for Windows OS