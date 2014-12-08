'use strict';

require('should');

var restify = require('restify');
var request = require('supertest');

var json = require('../lib');

describe('Formatter JSON', function() {
  var server;

  var data = {
    facets: {
      document_types: [
        {
          _type: "DocumentType",
          id: "5252ce4ce4cfcd16f55cfa3c",
          name: "document",
          document_count: 2
        }
      ],
      providers: [
        {
          _type: "AccessToken",
          id: "53cf9b4fa60b43c235680d7a",
          client: {
            _type: "Client",
            name: "GMail",
            id: "53047faac8318c2d65000096"
          },
          is_basic_token: false,
          account_name: "matthieu.bacconnier@papiel.fr",
          document_count: 1
        },
        {
          _type: "AccessToken",
          id: "53cf88997f247be935ebfd7a",
          client: {
            _type: "Client",
            name: "Google Drive",
            id: "539ef7289f240405465a2e1f"
          },
          is_basic_token: false,
          account_name: "matthieu.bacconnier@papiel.fr",
          document_count: 1
        }
      ],
      creation_dates: [
        {
          _type: "Date",
          timestamp: "1370044800000",
          date: "2013-06-26T00:00:00.000Z",
          document_count: 1
        },
        {
          _type: "Date",
          timestamp: "1404172800000",
          date: "2014-07-23T00:00:00.000Z",
          document_count: 1
        }
      ]
    },
    data: [
      {
        _type: "Document",
        id: "53cf88a5cf25841c6144ee46",
        identifier: "https://docs.google.com/file/d/0Ao1Q9EZ6RihjdHBSSnlzWG5mRFMxTm5YRVMwZzd0b0E",
        creation_date: "2013-06-26T09:13:46.552Z",
        modification_date: "2013-06-26T09:13:46.552Z",
        provider: {
          _type: "AccessToken",
          id: "53cf88997f247be935ebfd7a",
          client: {
            _type: "Client",
            name: "Google Drive",
            id: "539ef7289f240405465a2e1f"
          },
          is_basic_token: false,
          account_name: "matthieu.bacconnier@papiel.fr"
        },
        company: "53c0190ae83613e049a4845b",
        document_type: {
          _type: "DocumentType",
          id: "5252ce4ce4cfcd16f55cfa3c",
          name: "document",
          templates: {
            snippet: "<article>\n  <h1>{{{ title }}}</h1>\n  <blockquote>\n  \t{{{ snippet }}}\n  </blockquote>\n</article>\n"
          }
        },
        actions: {
          show: "https://docs.google.com/file/d/0Ao1Q9EZ6RihjdHBSSnlzWG5mRFMxTm5YRVMwZzd0b0E"
        },
        document_url: "https://api.anyfetch.com/documents/53cf88a5cf25841c6144ee46",
        projection_type: "snippet",
        data: {
          title: "Traductions.pdf",
          path: "/Traductions.pdf",
          snippet: "des entreprises\nIntégration du <span class=\"hlt\">CV</span> des participants\nApplication de recherche pour les recruteurs\nà partir de 50€/mois\nPapiel Process\nPour recrutement grande échelle\nTraductions\nIntégrez les <span class=\"hlt\">CVs</span> images"
        },
        related_count: 0,
        score: 0.58171546
      },
      {
        _type: "Document",
        id: "53cf9ceacf25841c6144fbc7",
        identifier: "https://mail.google.com/mail/#inbox/13ec7d0b8ca2b818#13f050ec6027ecef-CREATION_PHINNOV-Dossierdemande-versionjuillet2012.doc.docx",
        creation_date: "2014-07-23T11:30:50.270Z",
        modification_date: "2014-07-23T11:30:50.270Z",
        provider: {
          _type: "AccessToken",
          id: "53cf9b4fa60b43c235680d7a",
          client: {
              _type: "Client",
              name: "GMail",
              id: "53047faac8318c2d65000096"
          },
          is_basic_token: false,
          account_name: "matthieu.bacconnier@papiel.fr"
        },
        company: "53c0190ae83613e049a4845b",
        document_type: {
          _type: "DocumentType",
          id: "5252ce4ce4cfcd16f55cfa3c",
          name: "document",
          templates: {
            snippet: "<article>\n  <h1>{{{ title }}}</h1>\n  <blockquote>\n  \t{{{ snippet }}}\n  </blockquote>\n</article>\n"
          }
        },
        actions: {
          show: "https://mail.google.com/mail/#inbox/13ec7d0b8ca2b818"
        },
        document_url: "https://api.anyfetch.com/documents/53cf9ceacf25841c6144fbc7",
        projection_type: "snippet",
        data: {
          title: "CREATION PHINNOV Dossierdemande versionjuillet2012.doc",
          path: "/CREATION_PHINNOV-Dossierdemande-versionjuillet2012.doc.docx",
          snippet: "de recrutement : - Recherche des candidats en temps réel\n- Partage des profils\n- Suivi des candidatures\nPapiel Process :\n- Extraction des informations des <span class=\"hlt\">CVs</span> image\n- Interfaçage avec les outils métiers déjà"
        },
        related_count: 1,
        score: 0.18271412
      },
    ],
    count: 2,
    max_score: 0.58171546
  };

  before(function createServer() {
    server = restify.createServer({
      formatters: {
        'application/json': json
      }
    });

    server.use(restify.queryParser());
    server.use(restify.bodyParser());

    server.get('/', function(req, res, next) {
      res.send(JSON.parse(JSON.stringify(data)));
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

  /*
    Trying to access a sub key from a non existing key (eg foo.bar on {})
    Using multiple consecutive .
    Trying to use a numeral fields.0.id
    Filtering on emptiness fields=lol,,foo
    Filtering on emptiness (again) fields=
    Filtering with special chars fields="lol"
  */

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
