const express = require('express');
const axios = require('axios')
const app = express();
const port = process.env.DEV_PORT || 3022;
app.use(express.json());
var dbIndex = require('./db/index.js')

app.get('/qa/questions',  function (req, res) {

 dbIndex.getQuestions(req.query.product_id).then((data) => { res.send(data) })
    .catch(function (error) {
      res.send(error);
      console.error(error);
    })
})

app.post('/qa/questions', function (req, res) {
  dbIndex.postQuestions(req.body)
    .then((data) => {
      res.send('Created')
    })
    .catch(function (error) {
      res.send(error);
      console.error(error);
    })
});

app.put(`/qa/questions/:question_id/helpful`, function (req, res) {
  dbIndex.helpfulQuestion(req.params.question_id)
    .then((data) => {res.end() })
    .catch(function (error) {
      res.send(error);
      console.error(error);
    })
});

app.put('/qa/answers/:answerId/helpful', function (req, res) {
  dbIndex.helpfulAnswer(req.params.answerId)
    .then((data) => { res.end() })
    .catch(function (error) {
      res.send(error);
      console.error(error);
    })
});



app.get('/qa/questions/:question_id/answers', function (req, res) {
  dbIndex.AnswersGet(req.params.question_id)
    .then((data) => {res.send(data) })
    .catch(function (error) {
      res.send(error);
      console.error(error);
    })
})

app.post('/qa/questions/:questionId/answers', function (req, res) {
  dbIndex.postAnswer(req.params.questionId, req.body)
  .then((data) => {
    res.send('Created')
  })
  .catch(function (error) {
    res.send(error);
    console.error(error);
  })
});

app.put('/qa/answers/:answerId/report', function (req, res) {
  dbIndex.reportAnswer(req.params.answerId)
  .then((data) => {res.send(data) })
  .catch(function (error) {
    res.send(error);
    console.error(error);
  })
});

app.put('/qa/questions/:questionId/report', function (req, res) {
  dbIndex.reportQuestion(req.params.questionId)
  .then((data) => {res.send(data) })
  .catch(function (error) {
    res.send(error);
    console.error(error);
  })
});



app.listen(port, () => {
  console.log(`listening on port ${port}`)
})