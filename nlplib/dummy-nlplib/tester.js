var worker = new Worker("web_worker.js");
worker.onmessage = function() {
  alert("Reply: " + event.data);
}
console.log(worker);
//worker.postMessage("Hello worker!");*/