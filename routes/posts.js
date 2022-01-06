var express = require("express");
var router = express.Router();
var { format, callbackify } = require("util");
var multer = require("multer");
var { Storage } = require("@google-cloud/storage");
var storage = new Storage({
  keyFilename: "essential-hawk-314005-71a713c5e8d4.json",
});
// bucket 이름
var bucket = storage.bucket("tokki");
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
// upload 경로를 Google Cloud Storage로 설정
/*
var upload = multer({
  storage: multerGoogleStorage.storageEngine({
    bucket: 'tokki',
    projectId: 'My First Project',
    keyFilename: 'essential-hawk-314005-71a713c5e8d4.json',
  }),
})
var upload2 = multer();
*/
var Post = require("../models/Post");
var User = require("../models/User");
var Comment = require("../models/Comment");
var File = require("../models/File");
var util = require("../util");
const { post } = require("./files");

// Index
router.get("/", async function (req, res) {
  var page = Math.max(1, parseInt(req.query.page));
  var limit = Math.max(1, parseInt(req.query.limit));
  page = !isNaN(page) ? page : 1;
  limit = !isNaN(limit) ? limit : 10;

  var skip = (page - 1) * limit;
  var maxPage = 0;
  var searchQuery = await createSearchQuery(req.query); // find로만하면 exact한 value만 검색하기때문에 CreateSearchQuery로 조정해줌.

  var posts = [];

  if (searchQuery) {
    var count = await Post.countDocuments(searchQuery); // 그런다음 search해줌. mongodb operators / Aggregation Pipeline Operators
    maxPage = Math.ceil(count / limit);
    posts = await Post.aggregate([
      { $match: searchQuery },
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "post",
          as: "comments",
        },
      },
      {
        $lookup: {
          from: "files",
          localField: "attachment",
          foreignField: "_id",
          as: "attachment",
        },
      },
      {
        $unwind: {
          path: "$attachment",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1,
          author: {
            username: 1,
          },
          views: 1,
          numId: 1,
          price: 1, // get이 왔을때 search해주는데 속성값이 1이여야 찾아주는거임.
          attachment: {
            $cond: [
              { $and: ["$attachment", { $not: "$attachment.isDeleted" }] },
              "$attachment",
              "",
            ],
          },
          createdAt: 1,
          commentCount: { $size: "$comments" },
          status: 1,
          url1: 1,
          url2: 1,
        },
      },
    ]).exec();
  }

  res.render("posts/index", {
    posts: posts,
    currentPage: page,
    maxPage: maxPage,
    limit: limit,
    searchType: req.query.searchType,
    searchText: req.query.searchText,
  });
});

// Image - create => 이 함수 안씀
/* upload는 req.files를 받음 => files 객체를 받음 */
router.post("/upload", upload.array("imag"), (req, res) => {
  console.log("upload image");
  console.log(req.file);
  // file의 url을 반환
  res.json({ url: req.file.path });
});

// New - 새로운 게시판 글 작성 페이지로 넘어감
router.get("/new", util.isLoggedin, function (req, res) {
  var post = req.flash("post")[0] || {};
  var errors = req.flash("errors")[0] || {};
  res.render("posts/new", { post: post, errors: errors });
});

// create - 새로운 게시판 글 생성 posts에 추가
router.post(
  "/",
  util.isLoggedin,
  upload.array("attachment", 2),
  async function (req, res, next) {
    console.log("새로운 글~~~~");
    console.log(req.files);
    console.log(req.files.length);

    if (req.files.length == 0) {
      // 사진 파일 없이 post create

      console.log("There is no file");
      req.body.author = req.user._id;

      Post.create(req.body, function (err, post) {
        if (err) {
          req.flash("post", req.body);
          req.flash("errors", util.parseError(err));
          return res.redirect("/posts/new" + res.locals.getPostQueryString());
        }
        /*
      if(attachment){
        attachment.postId = post._id;
        attachment.save();
      }*/
        res.redirect(
          "/posts" +
            res.locals.getPostQueryString(false, { page: 1, searchText: "" })
        );
      });
    } else if (req.files.length == 2) {
      var blob = [];
      blob.push(bucket.file(req.files[0].originalname));
      blob.push(bucket.file(req.files[1].originalname));

      console.log("req.files[0].originalname");
      console.log(req.files[0].originalname);
      console.log(req.files[1].originalname);

      var blobStream = [];

      blobStream.push(blob[0].createWriteStream()); // 해당 파일을 stream으로 가져옴
      blobStream.push(blob[1].createWriteStream());

      blobStream[0].on("error", (err) => {
        next(err);
      });

      blobStream[0].on("finish", () => {
        console.log("url 가져오기");

        // 해당 파일의 Url가져오기
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob[0].name}`
        );

        console.log(publicUrl);
        /*
        var publicUrl = format(
          'https://storage.googleapis.com/${bucket.name}/${blob.name}'
        );*/

        req.body.author = req.user._id;
        req.body.url1 = publicUrl;

        console.log(req.body);
      });

      // url2

      blobStream[1].on("error", (err) => {
        next(err);
      });

      blobStream[1].on("finish", () => {
        console.log("url 가져오기");

        // 해당 파일의 Url가져오기
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob[1].name}`
        );

        req.body.author = req.user._id;
        console.log(publicUrl);
        /*
      var publicUrl = format(
        'https://storage.googleapis.com/${bucket.name}/${blob.name}'
      );*/
        req.body.url2 = publicUrl;
        console.log(req.body);

        Post.create(req.body, function (err, post) {
          if (err) {
            console.log(err);
            req.flash("post", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/posts/new" + res.locals.getPostQueryString());
          } else res.redirect("/posts" + res.locals.getPostQueryString(false, { page: 1, searchText: "" }));
        });
      });

      // blobStream 끝
      blobStream[1].end(req.files[1].buffer);
      // blobStream 끝
      blobStream[0].end(req.files[0].buffer);

      console.log("create");
      console.log(req.files.length);
    } else if (req.files.length == 1) {
      var blob = [];
      blob.push(bucket.file(req.files[0].originalname));

      console.log("req.files[0].originalname");
      console.log(req.files[0].originalname);

      var blobStream = [];

      blobStream.push(blob[0].createWriteStream()); // 해당 파일을 stream으로 가져옴

      blobStream[0].on("error", (err) => {
        next(err);
      });

      blobStream[0].on("finish", () => {
        console.log("url 가져오기");

        // 해당 파일의 Url가져오기
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob[0].name}`
        );

        console.log(publicUrl);
        /*
        var publicUrl = format(
          'https://storage.googleapis.com/${bucket.name}/${blob.name}'
        );*/

        req.body.author = req.user._id;
        req.body.url1 = publicUrl;

        Post.create(req.body, function (err, post) {
          if (err) {
            console.log(err);
            req.flash("post", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect("/posts/new" + res.locals.getPostQueryString());
          } else res.redirect("/posts" + res.locals.getPostQueryString(false, { page: 1, searchText: "" }));
        });

        console.log(req.body);
      });

      // blobStream 끝
      blobStream[0].end(req.files[0].buffer);
    }
  }
);

// show - 게시판 글의 상세 목록 보여주기
router.get("/:id", function (req, res) {
  var commentForm = req.flash("commentForm")[0] || { _id: null, form: {} };
  var commentError = req.flash("commentError")[0] || {
    _id: null,
    parentComment: null,
    errors: {},
  };

  Promise.all([
    Post.findOne({ _id: req.params.id })
      .populate({ path: "author", select: "username" })
      .populate({ path: "attachment", match: { isDeleted: false } }),
    Comment.find({ post: req.params.id })
      .sort("createdAt")
      .populate({ path: "author", select: "username" }),
  ])
    .then(([post, comments]) => {
      console.log(post.url);
      post.views++;
      post.save();
      var commentTrees = util.convertToTrees(
        comments,
        "_id",
        "parentComment",
        "childComments"
      );
      res.render("posts/show", {
        post: post,
        commentTrees: commentTrees,
        commentForm: commentForm,
        commentError: commentError,
      });
    })
    .catch((err) => {
      return res.json(err);
    });
});

// edit
router.get("/:id/edit", util.isLoggedin, checkPermission, function (req, res) {
  var post = req.flash("post")[0];
  var errors = req.flash("errors")[0] || {};
  if (!post) {
    Post.findOne({ _id: req.params.id })
      .populate({ path: "attachment", match: { isDeleted: false } })
      .exec(function (err, post) {
        if (err) return res.json(err);
        res.render("posts/edit", { post: post, errors: errors });
      });
  } else {
    post._id = req.params.id;
    res.render("posts/edit", { post: post, errors: errors });
  }
});

// update -> 게시물의 정보를 수정하는 페이지
router.put(
  "/:id",
  util.isLoggedin,
  checkPermission,
  upload.array("newAsttachment", 2),
  async function (req, res, next) {
    var post = await Post.findOne({ _id: req.params.id }).populate({
      path: "attachment",
      match: { isDeleted: false },
    });

    console.log(post);

    // 요청된 파일이 없는 경우
    if (req.files.length == 0) {
      console.log("no files");
      console.log(req.body);
      // update
      Post.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { runValidators: true },
        function (err, post) {
          if (err) {
            req.flash("post", req.body);
            req.flash("errors", util.parseError(err));
            return res.redirect(
              "/posts/" +
                req.params.id +
                "/edit" +
                res.locals.getPostQueryString()
            );
          }
          res.redirect(
            "/posts/" + req.params.id + res.locals.getPostQueryString()
          );
        }
      );
    } else if (req.files.length == 1) {
      console.log(req.body);

      var blob = [];
      blob.push(bucket.file(req.files[0].originalname));

      console.log("req.files[0].originalname");
      console.log(req.files[0].originalname);

      var blobStream = [];

      blobStream.push(blob[0].createWriteStream()); // 해당 파일을 stream으로 가져옴

      blobStream[0].on("error", (err) => {
        next(err);
      });

      blobStream[0].on("finish", () => {
        console.log("url 가져오기");

        // 해당 파일의 Url가져오기
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob[0].name}`
        );

        console.log(publicUrl);
        /*
        var publicUrl = format(
          'https://storage.googleapis.com/${bucket.name}/${blob.name}'
        );*/

        req.body.author = req.user._id;
        req.body.url1 = publicUrl;

        Post.findOneAndUpdate(
          { _id: req.params.id },
          req.body,
          { runValidators: true },
          function (err, post) {
            if (err) {
              console.log(err);
              req.flash("post", req.body);
              req.flash("errors", util.parseError(err));
              return res.redirect(
                "/posts/" +
                  req.params.id +
                  "/edit" +
                  res.locals.getPostQueryString()
              );
            } else
              res.redirect(
                "/posts" +
                  res.locals.getPostQueryString(false, {
                    page: 1,
                    searchText: "",
                  })
              );
          }
        );

        console.log(req.body);
      });

      // blobStream 끝
      blobStream[0].end(req.files[0].buffer);
    } else if (req.files.length == 2) {
      var blob = [];
      blob.push(bucket.file(req.files[0].originalname));
      blob.push(bucket.file(req.files[1].originalname));

      console.log("req.files[0].originalname");
      console.log(req.files[0].originalname);
      console.log(req.files[1].originalname);

      var blobStream = [];

      blobStream.push(blob[0].createWriteStream()); // 해당 파일을 stream으로 가져옴
      blobStream.push(blob[1].createWriteStream());

      blobStream[0].on("error", (err) => {
        next(err);
      });

      blobStream[0].on("finish", () => {
        console.log("url 가져오기");

        // 해당 파일의 Url가져오기
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob[0].name}`
        );

        console.log(publicUrl);
        /*
        var publicUrl = format(
          'https://storage.googleapis.com/${bucket.name}/${blob.name}'
        );*/

        req.body.author = req.user._id;
        req.body.url1 = publicUrl;

        console.log(req.body);
      });

      // url2

      blobStream[1].on("error", (err) => {
        next(err);
      });

      blobStream[1].on("finish", () => {
        console.log("url 가져오기");

        // 해당 파일의 Url가져오기
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob[1].name}`
        );

        req.body.author = req.user._id;
        console.log(publicUrl);
        /*
      var publicUrl = format(
        'https://storage.googleapis.com/${bucket.name}/${blob.name}'
      );*/
        req.body.url2 = publicUrl;
        console.log(req.body);

        Post.findOneAndUpdate(
          { _id: req.params.id },
          req.body,
          { runValidators: true },
          function (err, post) {
            if (err) {
              console.log(err);
              req.flash("post", req.body);
              req.flash("errors", util.parseError(err));
              return res.redirect(
                "/posts/" +
                  req.params.id +
                  "/edit" +
                  res.locals.getPostQueryString()
              );
            } else
              res.redirect(
                "/posts" +
                  res.locals.getPostQueryString(false, {
                    page: 1,
                    searchText: "",
                  })
              );
          }
        );
      });

      // blobStream 끝
      blobStream[1].end(req.files[1].buffer);
      // blobStream 끝
      blobStream[0].end(req.files[0].buffer);

      console.log("create");
      console.log(req.files.length);
    }
  }
);
// destroy
router.delete("/:id", util.isLoggedin, checkPermission, function (req, res) {
  Post.deleteOne({ _id: req.params.id }, function (err) {
    if (err) return res.json(err);
    res.redirect("/posts" + res.locals.getPostQueryString());
  });
});

module.exports = router;

// private functions
function checkPermission(req, res, next) {
  Post.findOne({ _id: req.params.id }, function (err, post) {
    if (err) return res.json(err);
    if (post.author != req.user.id) return util.noPermission(req, res);

    next();
  });
}

async function createSearchQuery(queries) {
  var searchQuery = {};
  if (
    queries.searchType &&
    queries.searchText &&
    queries.searchText.length >= 1
  ) {
    var searchTypes = queries.searchType.toLowerCase().split(",");
    var postQueries = [];
    if (searchTypes.indexOf("title") >= 0) {
      postQueries.push({
        title: { $regex: new RegExp(queries.searchText, "i") },
      });
    }
    if (searchTypes.indexOf("body") >= 0) {
      postQueries.push({
        body: { $regex: new RegExp(queries.searchText, "i") },
      });
    }
    if (searchTypes.indexOf("author!") >= 0) {
      var user = await User.findOne({ userid: queries.searchText }).exec();
      if (user) postQueries.push({ author: user._id });
    } else if (searchTypes.indexOf("author") >= 0) {
      var users = await User.find({
        userid: { $regex: new RegExp(queries.searchText, "i") },
      }).exec();
      var userIds = [];
      for (var user of users) {
        userIds.push(user._id);
      }
      if (userIds.length > 0) postQueries.push({ author: { $in: userIds } });
    }
    if (postQueries.length > 0) searchQuery = { $or: postQueries };
    else searchQuery = null;
  }

  return searchQuery;
}
