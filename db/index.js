const mongoose = require('mongoose');
//const nanoid = require('nanoid');
//import { nanoid } from 'nanoid';
mongoose.connect('mongodb://localhost/QandA', { useNewUrlParser: true, useCreateIndex: true });

let questionSchema = new mongoose.Schema({
  id: Number,
  product_id: Number,
  body: String,
  date_written: { type: Date },
  asker_name: String,
  asker_email: String,
  reported: Boolean,
  helpful: Number,
});

let answerSchema = new mongoose.Schema({
  id: Number,
  question_id: Number,
  body: String,
  date_written: { type: Date },
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


let getQuestions = async (prod_id) => {
  //intitiate object to send back to client
  var clientObj = { product_id: prod_id, results: [] }
  //get questions from db
  var questions = await Questions.aggregate(
    [
      { $match: { product_id: Number(prod_id) } }
    ]
  )

  //for each question get answers
  for (const question of questions) {

    //transform reported to true and false
    var report = false;
    if (question.reported === 1) {
      report = true;
    }
    //build client obj with question info
    var curQuestion = {
      question_id: question.id,
      question_body: question.body,
      question_date: new Date(question.date_written).toISOString(), //transform date
      asker_name: question.asker_name,
      question_helpfulness: question.helpful,
      reported: report, //
      answers: {}
    }
    //answers from db
    var answers = await Answers.aggregate(
      [{ $match: { question_id: question.id } }
      ])

    for (const answer of answers) {
      //build client obj with answer info
      curQuestion.answers[answer.id.toString()] = {
        id: answer.id,
        body: answer.body,
        date: answer.date, //trnasform date
        answerer_name: answer.answerer_name,
        helpfulness: answer.helpful,
        photos: []
      }
      //get photos from db
      var photos = await Photos.aggregate(
        [{ $match: { answer_id: answer.id } }
        ])
      //for each photo get url
      if (photos !== []) {
        for (const photoObj of photos) {

          curQuestion.answers[photoObj.answer_id.toString()].photos.push(photoObj.url)
        }
      }
    }
    clientObj.results.push(curQuestion)
  }
  console.log(clientObj, "client obj")
  return clientObj;
}

let postQuestions  = async (data) => {
  console.log(data, "qqqqqqpot")
  var counter;
  let counting = await Questions.countDocuments({}, function( err, count){
    counter = count
    return
  })
  console.log(counter+1, "ddss")
  var obj = {
    id: counter +1,
    product_id: data.product_id,
    body: data.body,
    date_written: Math.floor(new Date().getTime() / 1000),
    asker_name: data.name,
    asker_email: data.email,
    reported: false,
    helpful: 0,
  }
  let created = await Questions.create(obj)
  .then((data) =>{
    console.log(data, "in server after creating documentttt")

    return data
  })
  .catch(function (error) {
    console.error(error);
  })
  return created


}

module.exports = {
  getQuestions: getQuestions,
  postQuestions: postQuestions,
}
