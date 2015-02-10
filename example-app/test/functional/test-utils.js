// function to make a URL for a random image
var makeImageUrl = function (width, height) {
  return 'http://lorempixel.com/' + width + '/' + height +
         '?cacheBust=' + (new Date()).getTime();
};
