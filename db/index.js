const mongoose = require('mongoose');

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
// [{ type: mongoose.Schema.Types.ObjectId, ref: 'question' }]
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
//[{ type: mongoose.Schema.Types.ObjectId, ref: 'answer' }]
let photoSchema = new mongoose.Schema({
  id: Number,
  answer_id: Number,
  url: String
})
let setAnswerSchema = new mongoose.Schema({
  question: Number,
  page: Number,
  count: Number,
  results: [{
  answer_id: Number,
  body: String,
  date: { type: Date },
  answerer_name: String,
  helpfulness: String,
  photos: [{
    id: Number,
    url: String,
    }]
  }]
});

let setQuestionSchema = new mongoose.Schema({
  product_id: String,
  results: [{
    question_id: Number,
    question_body: String,
    question_date: { type: Date },
    asker_name: String,
    question_helpfulness: String,
    reported: Boolean,
    answers: {
      String: {
        id: Number,
        body: String,
        date: { type: Date } ,
        answerer_name: String,
        helpfulness: Number,
        photos: [],
      }
    }
  }]
})


let SetQuestions = mongoose.model('setquestion', setQuestionSchema);
let SetAnswers = mongoose.model('setanswer', setAnswerSchema);
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
  return clientObj;
}

let postQuestions  = async (data) => {
  let counting = await Questions.countDocuments({}, function( err, count){
    return count
  })
  var obj = {
    id: counting +1,
    product_id: data.product_id,
    body: data.body,
    date_written: Math.floor(new Date().getTime() / 1000),
    asker_name: data.name,
    asker_email: data.email,
    reported: 0,
    helpful: 0,
  }
  let created = await Questions.create(obj)
  return created
}

let helpfulQuestion  = async (questionId) => {
  let updated = await Questions.findOneAndUpdate({id: questionId}, {  $inc: { helpful: 1 } })
  return updated
}

let AnswersGet = async (questionId) => {
  var clientObj = { question: questionId,
                    page: 1,
                    count: 100,
                    results: [] }

  var answers = await Answers.aggregate(
    [{ $match: { question_id: Number(questionId) } }
    ])

  for (const answer of answers) {

    var curAnswer = {
      answer_id: answer.id,
      body: answer.body,
      date: new Date(answer.date_written).toISOString(),
      answerer_name: answer.answerer_name,
      helpfulness: answer.helpful,
      photos: []
    }
    var photos = await Photos.aggregate(
      [{ $match: { answer_id: answer.id } }
      ])
    //for each photo get url
    if (photos !== []) {
      for (const photoObj of photos) {
        curAnswer.photos.push({id: photoObj.id, url: photoObj.url})
      }
    }

    clientObj.results.push(curAnswer)
  }

return clientObj;

}
let postAnswer = async (questionId, data) => {
  let counting = await Answers.countDocuments({}, function( err, count){
    return count
  })
  var obj = {
    id: counting +1,
    question_id: Number(questionId),
    body: data.body,
    date_written: Math.floor(new Date().getTime() / 1000),
    answerer_name: data.name,
    answerer_email: data.email,
    reported: 0,
    helpful: 0,
  }
  let created = await Answers.create(obj)
  return created
}

let helpfulAnswer = async (answerId) => {
  let updated = await Answers.findOneAndUpdate({id: Number(answerId)}, {  $inc: { helpful: 1 } })
  return updated
}

let reportAnswer = async (answerId) => {
  console.log(answerId, "hh")
  let updated = await Answers.findOneAndUpdate({id: Number(answerId)}, { reported: true })
  return updated
}

let reportQuestion = async (questionId) => {
  console.log(questionId, "hh")
  let updated = await Questions.findOneAndUpdate({id: Number(questionId)}, { reported: true })
  return updated
}



let setAnswers = async () => {

  let counting = await Questions.countDocuments({}, function( err, count){
    return count
  })

  for ( var i = 1; i < counting; i++) {
    var clientObj = { question: i,
      page: 1,
      count: 100,
      results: [] }
    const answers = await Answers.aggregate(
      [{ $match: { question_id: i} }
      //{ $project: {_id: 0, answerer_email: 0,  reported: 0}}
      ])

      for (const answer of answers) {

        var curAnswer = {
          answer_id: answer.id,
          body: answer.body,
          date: new Date(answer.date_written).toISOString(),
          answerer_name: answer.answerer_name,
          helpfulness: answer.helpful,
          photos: []
        }
        var photos = await Photos.aggregate(
          [{ $match: { answer_id: answer.id } }
          ])
        //for each photo get url
        if (photos !== []) {
          for (const photoObj of photos) {
            curAnswer.photos.push({id: photoObj.id, url: photoObj.url})
          }
        }
        clientObj.results.push(curAnswer)
      }
      let created = await SetAnswers.create(clientObj)
  }
  return
}

let setQuestions = async () => {
  //intitiate object to send back to clien

  for ( var i = 1; i < 1000012; i++) {

  var clientObj = { product_id: i, results: [] }
  //get questions from db
  var questions = await Questions.aggregate(
    [
      { $match: { product_id: i } }
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
    console.log(clientObj, "kkk")
  }
  let created = await SetQuestions.create(clientObj)
  }
  return
}

module.exports = {
  getQuestions: getQuestions,
  postQuestions: postQuestions,
  helpfulQuestion: helpfulQuestion,
  AnswersGet: AnswersGet,
  postAnswer: postAnswer,
  helpfulAnswer: helpfulAnswer,
  reportAnswer: reportAnswer,
  reportQuestion: reportQuestion,
  setAnswers: setAnswers,
  setQuestions: setQuestions,
}
