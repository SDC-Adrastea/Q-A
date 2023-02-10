let server = require('./index.js').app;
let db = require('./db/index.js').getQuestions
let request = require('supertest');
const express = require('express');

const app = express();

request(app)
  .get('/qa/questions')
  .expect(404)
  .end(function(err, res) {
    if (err) throw err;
  });

test('addition', () => {
  expect(1+1).toEqual(2)})