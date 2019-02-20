var {SHA256} = require('crypto-js');
var jwt = require('jsonwebtoken');

var data = {
    id: 10
}
var token = jwt.sign(data, '123abc')
var decode = jwt.verify(token, '123abc')
console.log('decode',decode)

// // console.log("hash",SHA256("I am pankaj").toString())

// var data = {
//     id: 5
// }
// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString()

// //middleman 
// token.data.id = 6;
// token.hash = SHA256(JSON.stringify(token.data)).toString()

// if(resultHash == token.hash){
//     console.log('data wasnot change')
// }else{
//     console.log('data was changed.')
// }
