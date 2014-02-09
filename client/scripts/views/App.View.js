var $ = require("jquery"),
  Backbone = require("backbone"),
  MeasureView = require('../views/Measure.View');

module.exports = Backbone.View.extend({
  initialize: function () {
    this.collection.bind('add', this.addOne, this);
    this.collection.bind('reset', this.addAll, this);
    this.collection.bind('all', this.render, this);

    this.collection.fetch();

  },

  addOne: function (measure) {
    var view = new MeasureView({model: measure});
    $("#measure-list").append(view.render().el);
  },

  // Add all items in the **Measures** collection at once.
  addAll: function () {
    this.collection.each(this.addOne);
  }
});