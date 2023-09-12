"use strict";

module.exports = {
  hello: hello,
};

function hello(req, res) {
  res.json({ message: "Hello, World!" });
}
