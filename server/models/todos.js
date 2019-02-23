const mongoose = require('mongoose');

var todoSchema = new mongoose.Schema({
        text: {
            type: String,
            required : true,
            trim : true,
            minlength: 3,
        },
        completed:{
            type: Boolean,
            default: false
        },
        completedAt:{
            type: Number,
            default: null
        },
        _creator: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        }
});

let Todos = mongoose.model('Todos', todoSchema);
module.exports = {Todos};
