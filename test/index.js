'use strict';

require('should');

var restify = require('restify');
var request = require('supertest');

var json = require('../lib');
var getSampleData = require('./sample.js');

describe('JSON formatter', function() {
  var server;
  var data = getSampleData();

  before(function createServer() {
    server = restify.createServer({
      formatters: {
        'application/json': json
      }
    });

    server.use(restify.queryParser());
    server.use(restify.bodyParser());

    server.get('/', function(req, res, next) {
      res.send(getSampleData());
      return next();
    });
  });

  describe('Normal Worflow', function() {
    it('should remove useless fields', function(done) {
      request(server)
        .get('/')
        .query({
          fields: 'count, max_score'
        })
        .expect(200)
        .expect(function(res) {
          res.body.should.eql({count: data.count, max_score: data.max_score});
        })
        .end(done);
    });

    it('should remove useless fields with array', function(done) {
      request(server)
        .get('/')
        .query({
          fields: 'data.id,facets.providers.id'
        })
        .expect(200)
        .expect(function(res) {
          res.body.should.eql({
            facets: {
              providers: [
                {id: '53cf9b4fa60b43c235680d7a'},
                {id: '53cf88997f247be935ebfd7a'}
              ],
            },
            data: [
              {id: '53cf88a5cf25841c6144ee46'},
              {id: '53cf9ceacf25841c6144fbc7'}
            ]
          });
        })
        .end(done);
    });

    it('should remove useless fields recursively', function(done) {
      request(server)
        .get('/')
        .query({
          fields: 'data.id, data.provider.client.id, data.provider.client.name'
        })
        .expect(200)
        .expect(function(res) {
          res.body.should.eql({
            data: [
              {
                id: '53cf88a5cf25841c6144ee46',
                provider: {
                  client: {
                    id: '539ef7289f240405465a2e1f',
                    name: "Google Drive"
                  }
                }
              },
              {
                id: '53cf9ceacf25841c6144fbc7',
                provider: {
                  client: {
                    id: '53047faac8318c2d65000096',
                    name: "GMail"
                  }
                }
              }
            ]
          });
        })
        .end(done);
    });
  });

  describe('Weird worflow', function() {
    it("shouldn't crash with a key which does not exist", function(done) {
      request(server)
        .get('/')
        .query({
          fields: 'foo.bar, count'
        })
        .expect(200)
        .expect(function(res) {
          res.body.should.eql({count: data.count});
        })
        .end(done);
    });

    it("shouldn't crash with consecutive .", function(done) {
      request(server)
        .get('/')
        .query({
          fields: 'data., count'
        })
        .expect(200)
        .expect(function(res) {
          res.body.should.eql({
            count: data.count,
            data: [
              {},
              {}
            ]
          });
        })
        .end(done);
    });

    it("shouldn't crash with an empty key", function(done) {
      request(server)
        .get('/')
        .query({
          fields: 'count,,foo'
        })
        .expect(200)
        .expect(function(res) {
          res.body.should.eql({count: data.count});
        })
        .end(done);
    });

    it("shouldn't crash with empty fields", function(done) {
      request(server)
        .get('/')
        .query({
          fields: ''
        })
        .expect(200)
        .expect(function(res) {
          res.body.should.eql(data);
        })
        .end(done);
    });

    it("shouldn't crash with weird fields", function(done) {
      request(server)
        .get('/')
        .query({
          fields: 'foo, "lol", count'
        })
        .expect(200)
        .expect(function(res) {
          res.body.should.eql({count: data.count});
        })
        .end(done);
    });
  });
});
