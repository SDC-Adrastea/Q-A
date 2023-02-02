const express = require('express');
const axios = require('axios')
const app = express();
const port = process.env.DEV_PORT || 3022;
app.use(express.json());
var dbIndex = require('./db/index.js')

app.get('/qa/questions', function (req, res) {
  console.log('here is query111', req.query.product_id)

  dbIndex.getQuestions(req.query.product_id)
    // .then((data) => { console.log(data, "datttttt"), res.send(data) })
    // .catch(function (error) {
    //   res.send(error);
    //   console.error(error);
    // })
})

app.post('/qa/questions', function (req, res) {
  console.log('here is query2222', req.body)
  // QuestionPost(req.body.formInfo, TOKEN)
  //   .then((data) => { res.send(data) })
  //   .catch(function (error) {
  //     res.send(error);
  //     console.error(error);
  //   })
});

app.put('/questions/helpful', function (req, res) {
  console.log('here is query333', req.body)
  // helpfulQuestion(req.body.question_id, TOKEN)
  //   .then((data) => { res.send(data) })
  //   .catch(function (error) {
  //     res.send(error);
  //     console.error(error);
  //   })
});

app.put('/answers/helpful', function (req, res) {
  console.log('here is query444', req.body)
  // console.log('here is query', req.body.answer_id)
  // helpfulAnswer(req.body.answer_id, TOKEN)
  //   .then((data) => { res.send(data) })
  //   .catch(function (error) {
  //     res.send(error);
  //     console.error(error);
  //   })
});



app.get('/answers', function (req, res) {
  console.log('here is query555', req.body)
  // AnswersGet(req.query.questionId, TOKEN)
  //   .then((data) => { res.send(data) })
  //   .catch(function (error) {
  //     res.send(error);
  //     console.error(error);
  //   })
})

app.post('/answers', function (req, res) {
  console.log('here is query6666', req.body)
  // AnswerPost(req.body.formInfo, TOKEN)
  //   .then((data) => { res.send(data) })
  //   .catch(function (error) {
  //     res.send(error);
  //     console.error('here is answer post', error);
  //   })
});

app.put('/answers/report', function (req, res) {
  console.log('here is query7777', req.body)
  // console.log('here is query', req.body.answer_id, TOKEN)
  // reportAnswer(req.body.answer_id, TOKEN)
  //   .then((data) => { res.send(data) })
  //   .catch(function (error) {
  //     res.send(error);
  //     console.error(error);
  //   })
});



app.listen(port, () => {
  console.log(`listening on port ${port}`)
})