const mongoose = require('mongoose');
const courseSchema =new mongoose.Schema({
    name:String,
    ShortDescription:String,
    description:String,
    image:String,
    benefits: [String], 
    topics: [String],
    keyAttractions: [String],
    imageGallery:[String],
    contactLink:String,
    slung:String,
    video:String
});
module.exports = mongoose.model('Course', courseSchema);