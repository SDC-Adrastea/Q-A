const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/QandA');

let questionSchema = new mongoose.Schema({
    id: Number,
    product_id: Number,
    body: String,
    date_written: { type: Date} ,
    asker_name: String,
    asker_email: String,
    reported: Boolean,
    helpful: Number,
});

let answerSchema = new mongoose.Schema({
  id: Number,
  question_id: Number,
  body: String,
  date_written: { type: Date} ,
  answerer_name: String,
  answerer_email: String,
  reported: Boolean,
  helpful: Number

})
let photoSchema = new mongoose.Schema({
  id: Number,
  answer_id: Number,
  url: String
})

let Questions = mongoose.model('question', questionSchema);
let Answers = mongoose.model('answer', answerSchema);
let Photos = mongoose.model('photo', photoSchema);

let getQuestions = (prod_id)=>{
  //intitiate object to send back to client
  var clientObj = {product_id: prod_id, results: []}
  var thisObj;
  //get questions from db
   var ques =  Questions.aggregate(
    [ { $match : { product_id : Number(prod_id) } }
     ])

Promise.all([ques]).then((questions) => {
  var answerPromises = []
  //for each question get answers
   questions[0].forEach((quest) => {
    //transform reported to true and false
    var report = false;
    if(quest.reported === 1){
      report = true;
    }
    //build client obj with question info
    thisObj = {
      question_id: quest.id,
      question_body: quest.body,
      question_date: quest.date_written, //transform date
      asker_name: quest.asker_name,
      question_helpfulness: quest.helpful,
      reported: report, //
      answers: {}
    }
    //answers from db
    var ans = Answers.aggregate(
      [{$match : {question_id: quest.id}}
    ])
    answerPromises.push(ans)
  })
   Promise.all(answerPromises).then((answers) => {
    var answerPhotosPromises = []
    //for each answer get photos
    answers.forEach((answ) => {
      answ.forEach((answer)=>{
        //build client obj with answer info
        thisObj.answers[answer.id.toString()] = {
          id: answer.id,
          body: answer.body,
          date: answer.date, //trnasform date
          answerer_name: answer.answerer_name,
          helpfulness: answer.helpful,
          photos: []
        }
        //get photos from db
        var photo = Photos.aggregate(
          [{$match : {answer_id: answer.id}}
        ])
       answerPhotosPromises.push(photo)

      })
    })
    Promise.all(answerPhotosPromises).then((photos) => {
      //for each photo get url
     photos.forEach((phot) => {
      if(phot !== []){
      phot.forEach((photoObj) => {
          thisObj.answers[photoObj.answer_id.toString()].photos.push(phot.url)
      })
    }
     })
     clientObj.results.push(thisObj)

   })

   .then(()=>{
    console.log(clientObj, "clinettttttt")
    return clientObj

   })

   })
})
console.log(clientObj, "ttttt")
//return clientOBJ inside promise
}



module.exports = {
  getQuestions: getQuestions
}
