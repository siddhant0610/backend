const mongoose = require('mongoose');
const courseSchema = mongoose.Schema({
    name:String,
    ShortDescription:String,
    description:String,
    image:String,
    benefits: [String], 
    topics: [String],
    keyAttractions: [String],
    imageGallery:[String],
    contactLink:String
});
module.exports = mongoose.model('Course', courseSchema);