/* global Reqx */

var reqx = new Reqx();

function Load(){
	console.log('loaded', reqx);
}

function PointerDown(evt){
	if({ GET: 1, POST: 1 }[evt.target.id]){
		evt.preventDefault();

		reqx[evt.target.id.toLowerCase()](document.getElementById('PATH').value, function(err, res){
			document.getElementById('OUT').textContent = JSON.stringify(arguments);
		});
	}
}

document.addEventListener('mousedown', PointerDown);
document.addEventListener('touchstart', PointerDown);

document.addEventListener('DOMContentLoaded', Load);