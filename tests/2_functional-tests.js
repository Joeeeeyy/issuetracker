const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let deleteID;
suite('Functional Tests', function() {
  suite("POST tests /api/issues/{project}", function() {
    test("Create an issue with every field", function(done){
      chai
      .request(server)
      .post("/api/issues/test")
      .set("content-type", "application/json")
      .send({
          issue_title: "Issue", 
          issue_text: "Functional Test", 
          created_by: "FCC", 
          assigned_to: "Joey", 
          status_text: "Not done"
        })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        deleteID = res.body._id;
        assert.equal(res.body.issue_title, "Issue");
        assert.equal(res.body.assigned_to, "Joey");
        assert.equal(res.body.created_by, "FCC");
        assert.equal(res.body.status_text, "Not done");
        assert.equal(res.body.issue_text, "Functional Test");
        done();
      });
    });
    test("Create an issue with only required fields", function(done){
      chai
      .request(server)
      .post("/api/issues/test")
      .send({issue_title: "Issue", issue_text: "Functional Test", created_by: "FCC"})
      .end(function(err,res){
        assert.equal(res.status, 200)
        assert.equal(res.body.issue_title, "Issue");
        assert.equal(res.body.created_by, "FCC");
        assert.equal(res.body.issue_text, "Functional Test");
        assert.isDefined(res.body.created_on)
        assert.isDefined(res.body.updated_on)
        assert.isDefined(res.body.open)
        done()
      })
    })
    test("Create an issue with missing required fields", function(done){
      chai
      .request(server)
      .post("/api/issues/test")
      .send({issue_title: "Issue"})
      .end(function(err, res){
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"error":"required field(s) missing"}')
        done()
      })
    })
  })

  suite("GET tests", function() {
    test("View issues on a project", function(done){
      chai
      .request(server)
      .get("/api/issues/test")
      .end(function(err,res){
        assert.equal(res.status, 200)
        assert.isArray(res.body)
        done()
      })
    })
    test("View issues on a project with one filter", function(done){
      chai
      .request(server)
      .get("/api/issues/test")
      .query({issue_title: "Issue"})
      .end(function(err, res){
        assert.equal(res.status, 200)
        assert.isArray(res.body)
        assert.equal(res.body[0].issue_text, "Functional Test")
        assert.equal(res.body[0].open, true)
        done()
      })
    })
    test("View issues on a project with multiple filters", function(done){
      chai
      .request(server)
      .get("/api/issues/test")
      .query({issue_title: "Issue", issue_text: "Functional Test"})
      .end(function(err, res){
        assert.equal(res.status, 200)
        assert.isArray(res.body)
        assert.equal(res.body[0].issue_text, "Functional Test")
        assert.equal(res.body[0].status_text, "Not done")
        done()
      })
    })
  })

  suite("PUT tests", function() {

    test("Update one field on an issue", function(done){
      chai
      .request(server)
      .put("/api/issues/test")
      .send({
          "_id": "60c3f666c080628cdd8e5823",
          issue_title: "new title"
      })
      .end(function(err, res){
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"result":"successfully updated","_id":"60c3f666c080628cdd8e5823"}');
        done()
      })
    })
    test("Update multiple fields on an issue", function(done){
      chai
      .request(server)
      .put("/api/issues/test")
      .send({
          "_id": "60c3f666c080628cdd8e5823",
          issue_title: "new title",
          issue_text: "new text"
      })
      .end(function(err, res){
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"result":"successfully updated","_id":"60c3f666c080628cdd8e5823"}');
        done()
      })
    })
    test("Update an issue with missing _id", function(done){
      chai
      .request(server)
      .put("/api/issues/test")
      .send({issue_title:"new title", issue_text: "new text"})
      .end(function(err, res){
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"error":"missing _id"}')
        done()
      })
    })
    test("Update an issue with no fields", function(done){
      chai
      .request(server)
      .put("/api/issues/test")
      .send({"_id":"606ae54a59e1f70390896c49"})
      .end(function(err, res){
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"error":"no update field(s) sent","_id":"606ae54a59e1f70390896c49"}')
        done()
      })
    })
    test("Update an issue with an invalid _id", function(done){
      chai
      .request(server)
      .put("/api/issues/test")
      .send({"_id":"406ae54a59e1f77390896c48",issue_title:"new title"})
      .end(function(err, res){
        assert.equal(res.status, 200)
        assert.equal(res.text, '{"error":"could not update","_id":"406ae54a59e1f77390896c48"}')
        done()
      })
    })

  })
  suite("DELETE tests", function() {

    test("Delete an issue", function(done){
      chai
      .request(server)
      .delete("/api/issues/test")
      .send({
          _id: "60c3f6052e7eaa89e4b55d8f",
        })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.text, '{"result":"successfully deleted","_id":"60c3f6052e7eaa89e4b55d8f"}')
        
        done();
      });
    });
    test("Delete an issue with an invalid _id", function(done){
      chai
      .request(server)
      .delete("/api/issues/test")
      .send({
          _id: "60c3f5afe76cc1849bf18b7cinvalid"
        })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not delete");

        done();
      });
    });
    test ("Delete an issue with missing _id", function(done){
      chai
      .request(server)
      .delete("/api/issues/test")
      .send({})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
    });

  });




});