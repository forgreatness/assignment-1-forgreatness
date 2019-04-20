const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const port = process.env.PORT || 8000;

const businesses = [];

app.use(bodyParser.json());

app.post('/businesses', (req, res, next) => {
  if (req.body && req.body.name && req.body[ 'street address' ] && req.body.city && req.body.state && req.body[ 'ZIP code' ] && req.body[ 'phone number' ] && req.body.category) {
    businesses.push(req.body);
    const id = businesses.length - 1;
    res.status(201).send({
      id: id
    });
  } else {
    res.status(400).send({
      err: "Request needs a body with a name field"
    });
  }
});

app.get('/businesses', (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const numPerPage = 10;
  const lastPage = Math.ceil(businesses.length / numPerPage);
  const start = (page - 1) * numPerPage;
  const end = start + numPerPage;
  const pageBusinesses = businesses.slice(start, end);
  const links = {};
  if (page < lastPage) {
  	links.nextPage = '/businesses?page=' + (page + 1);
  	links.lastPage = '/businesses?page=' + lastPage;
  }
  if (page > 1) {
  	links.prevPage = '/businesses?page=' + (page - 1);
  	links.firstPage = '/businesses?page=1';
  }
  res.status(200).send({
    pageNumber: page,
    totalPages: lastPage,
    pageSize: numPerPage,
    totalCount: businesses.length,
    businesses: pageBusinesses,
    links: links
  });
});

app.patch('/businesses/:id', (req, res, next) => {
  const id = req.params.id;
  if (req.body) {
    if (req.body.name) {
      businesses[id].name = req.body.name;
    }
    if (req.body[ 'street address' ]) {
      businesses[id][ 'street address' ] = req.body[ 'street address' ];
    }
    if (req.body.city) {
      businesses[id].city = req.body.city;
    }
    if (req.body.state) {
      businesses[id].state = req.body.state;
    }
    if (req.body[ 'ZIP code' ]) {
      businesses[id][ 'ZIP code' ] = req.body[ 'ZIP code' ];
    }
    if (req.body[ 'phone number' ]) {
      businesses[id][ 'phone number' ] = req.body[ 'phone number' ];
    }
    if (req.body.category) {
      businesses[id].category = req.body.category;
    }
    res.status(204).send({
      msg: "business id " + id + " general information updated"
    });
  } else {
    res.status(404).send({
      err: "Resource is not found"
    });
  }
});

app.delete('/businesses/:id', (req, res, next) => {
  const id = req.params.id;
  if (businesses[id]) {
    delete businesses[id];
    res.status(204).send();
  } else {
    next();
  }
});

app.get('/businesses/photos', (req, res, next) => {
  var photos = [];
  for (var i = 0; i < businesses.length; i++) {
    if (businesses[i].images) {
      photos = photos.concat(businesses[i].images);
    }
  }
  res.status(200).send({
    photos: photos
  });
});

app.patch('/businesses/photos/:id', (req, res, next) => {
  const id = req.params.id;
  const files = req.query.files;
  if (businesses[id]) {
    if (businesses[id].images) {
      businesses[id].images.forEach(function(image, index) {
        if (image.files == files) {
          if (req.body.caption) {
            image.caption = req.body.caption;
            res.status(204).send({
              msg: "business id" + id + ", image file " + files + " caption updated"
            });
          } else {
            res.status(400).send({
              err: "Request needs a body with a caption field"
            });
          }
        } else {
          res.status(404).send({
            err: "Resource with files " + files + " is not found"
          });
        }
      });
    } else {
      res.status(404).send({
        err: "Resource does not contain any images"
      });
    }
  } else {
    res.status(404).send({
      err: "Resource with id " + id + " is not found"
    });
  }
});

app.post('/businesses/photos/:id', (req, res, next) => {
  const id = req.params.id;
  if (businesses[id]) {
    if (req.body.images){
      if (Array.isArray(req.body.images)) {
        for (i = 0; i < req.body.images.length; i++) {
          if (!req.body.images[i].files) {
            res.status(400).send({
              err: "Request needs an attribute files under each object of the images array"
            });
            break;
          }
        }

        if (businesses[id].images) {
          businesses[id].images = businesses[id].images.concat(req.body.images);
        } else{
          businesses[id].images = req.body.images;
        }
        res.status(201).send({
          msg: "Succesfully added images"
        });
      } else {
        res.status(400).send({
          err: "Request needs a body with an array of object in an images field"
        });
      }
    } else {
      res.status(400).send({
        err: "Request needs a body with an array of object in an images field"
      });
    }
  } else {
    res.status(404).send({
      err: "Resource with id " + id + " is not found"
    });
  }
});

app.delete('/businesses/photos/:id', (req, res, next) => {
  const id = req.params.id;
  const files = req.query.files;
  if (businesses[id]) {
    if (businesses[id].images) {
      for (var i = 0; i < businesses[id].images.length; i++) {
        if (businesses[id].images[i].files == files) {
          delete businesses[id].images[i];
          res.status(204).send({
            msg: "Sucessfully deleted image files " + files + " from business id " + id
          });
          break;
        } else if (i == businesses[id].images.length - 1) {
          res.status(404).send({
            err: "Cannot find any image files name " + files + " from business id " + id
          });
        }
      }
    } else {
      res.status(404).send({
        err: "Resource with id " + id + " does not contain images"
      });
    }
  } else {
    res.status(404).send({
      err: "Resource with id " + id + " is not found"
    });
  }
});

app.get('/businesses/reviews', (req, res, next) => {
  var reviews = [];
  for (var i = 0; i < businesses.length; i++) {
    if (businesses[i].review) {
      reviews = reviews.concat(businesses[i].review);
    }
  }
  res.status(200).send({
    reviews: reviews
  });
});

app.patch('/businesses/reviews/:id', (req, res, next) => {
  const id = req.params.id;
  if (businesses[id]) {
    if (businesses[id].review) {
      if (req.body.review.star) {
        if (!Number.isInteger(req.body.review.star)) {
          res.status(400).send({
            err: req.body.review.star + " is either not a number or an integer"
          });
        } else {
          if (parseInt(req.body.review.star) >= 0 && parseInt(req.body.review.star) <= 5) {
            if (!Number.isInteger(req.body.review[ '$' ])) {
              res.status(400).send({
                err: req.body.review[ '$' ] + " is either not a number or an integer"
              });
            } else {
              if (parseInt(req.body.review[ '$' ]) > 0 && parseInt(req.body.review[ '$' ]) < 5) {
                businesses[id].review = req.body.review;
                res.status(201).send({
                  msg: "Succesfully added review for business with id " + id
                });
              } else {
                res.status(400).send({
                  err: "$ can only be between 1 and 4"
                });
              }
            }
          } else {
            res.status(400).send({
              err: "star can only be between 0 and 5"
            });
          }
        }
      } else {
        res.status(400).send({
          err: "Request needs a body with a review field containing a review object that has a star rating between 0 and 5, a $ field between 1 and 4 for how expensive, and an optional written review"
        });
      }
    } else {
      res.status(404).send({
        err: "Resource does not contain any review"
      });
    }
  } else {
    res.status(404).send({
      err: "Resource with id " + id + " is not found"
    });
  }
});

app.post('/businesses/reviews/:id', (req, res, next) => {
  const id = req.params.id;
  if (businesses[id]) {
    if (req.body.review) {
      if (req.body.review.star) {
        if (!Number.isInteger(req.body.review.star)) {
          res.status(400).send({
            err: req.body.review.star + " is either not a number or an integer"
          });
        } else {
          if (parseInt(req.body.review.star) >= 0 && parseInt(req.body.review.star) <= 5) {
            if (!Number.isInteger(req.body.review[ '$' ])) {
              res.status(400).send({
                err: req.body.review[ '$' ] + " is either not a number or an integer"
              });
            } else {
              if (parseInt(req.body.review[ '$' ]) > 0 && parseInt(req.body.review[ '$' ]) < 5) {
                businesses[id].review = req.body.review;
                res.status(201).send({
                  msg: "Succesfully added review for business with id " + id
                });
              } else {
                res.status(400).send({
                  err: "$ can only be between 1 and 4"
                });
              }
            }
          } else {
            res.status(400).send({
              err: "star can only be between 0 and 5"
            });
          }
        }
      } else {
        res.status(400).send({
          err: "Request needs a body with a review field containing a review object that has a star rating between 0 and 5, a $ field between 1 and 4 for how expensive, and an optional written review"
        });
      }
    } else {
      res.status(400).send({
        err: "Request needs a body with a review field containing a review object that has a star rating between 0 and 5, a $ field between 1 and 4 for how expensive, and an optional written review"
      });
    }
  } else {
    res.status(404).send({
      err: "Resource with id " + id + " is not found"
    });
  }
});

app.delete('/businesses/reviews/:id', (req, res, next) => {
  const id = req.params.id;
  if (businesses[id]) {
    if (businesses[id].review) {
      delete businesses[id].review;
      res.status(204).send({
        msg: "Sucessfully deleted review from resource id " + id
      });
    } else {
      res.status(404).send({
        err: "Resource with id " + id + " already does not have a review"
      });
    }
  } else {
    res.status(404).send({
      err: "Resource with id " + id + " is not found"
    });
  }
});

app.use('*', (req, res, next) => {
  res.status(404).send({
    err: "The path " + req.originalUrl + " doesn't exist"
  });
});

app.listen(port, () => {
  console.log("== Server is listening on port:", port);
});
