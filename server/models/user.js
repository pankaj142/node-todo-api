const mongoose = require('mongoose')
const Users = mongoose.model("User", {
    email: {
        type: String,
        required : true,
        trim: true,
        minlength: 5
    }
})

module.exports = {Users}