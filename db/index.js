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
  var clientObj = {}
   var ques =  Questions.aggregate(
    [ { $match : { product_id : Number(prod_id) } }
     ])

Promise.all([ques]).then((questions) => {
  var answerPromises = []
  console.log("qqqq", questions, "qqqq")
   questions[0].forEach((quest) => {
    //update clientObj with ques info
    var ans = Answers.aggregate(
      [{$match : {question_id: quest.id}}
    ])
    answerPromises.push(ans)
   })
   Promise.all(answerPromises).then((answers) => {
    console.log("wwww", answers, "wwww")
    var answerPhotosPromises = []
    answers.forEach((answ) => {
      answ.forEach((answer)=>{
        console.log("yyyy", answer, "yyyy")
        ////update clientObj with answers info
        var photo = Photos.aggregate(
          [{$match : {answer_id: answer.id}}
        ])
       answerPhotosPromises.push(photo)

      })
    })
    Promise.all(answerPhotosPromises).then((photos) => {
     console.log("OOO", photos, "OOO")
     ////update clientObj with answersphotos info

   })

   })
});

console.log(clientObj, "clinettttttt")
//return clientOBJ inside promise
}



module.exports = {
  getQuestions: getQuestions
}
