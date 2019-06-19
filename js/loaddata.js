
var loadServerData = (function() {
    'use strict';
    var wrapper = document.getElementById('wrapper');
    wrapper.style.backgroundImage =  "url('"+firstLoadImg+"')";
    wrapper.style.backgroundSize = "cover";
    var fi = new Image();
    fi.onload = function(){
        // console.log(wrapper.clientWidth, wrapper.clientHeight);
        // console.log(this.src);
        //ctx1.drawImage(fi, 0, 0, wrapper.clientWidth, wrapper.clientHeigh);
    };
    fi.src = firstLoadImg;

    var _dataLength = 0;
    var _loadedImages = [];
    var _loadedImagesSample = [];
    var _loadedHighResImages = [];
    var _rawData = {allCars:[]};

    //var worker = new Worker('/js/webworker.js');

    // window.URL = window.URL || window.webkitURL;

    /*worker.addEventListener('message', function(e){
        var count = _rawData.allCars.length,
            onload = function () {
                delete this.onload;
                // _loadedImages.push(this);
                // console.log(this);
                // frag.appendChild(this);
                // _loadedImages
                if (--count === 0) {
                    //document.getElementById('output').appendChild(frag);
                }
            };
        _rawData.allCars.tweenLoad(function (img, index) {
            console.log(index);
            var el = document.createElement('img');
            // Avoid early reflows as images load without sizes. Wait for onload.
            el.onload = onload;
            el.src = img.src;
            _loadedImages[index] = el;
        });


        //URL.revokeObjectURL(url);

    });*/
    function loadedCars(cars){
        var count = 0,
            onload = function () {
                delete this.onload;
                // _loadedImages.push(this);
                // console.log(this);
                // frag.appendChild(this);
                // _loadedImages
                /*if (--count === 0) {
                    //document.getElementById('output').appendChild(frag);
                }*/
            };
        _loadedImages = new Array(cars.length);
        cars.tweenLoad(function (img, index) {
            //console.log(index);
            var el = document.createElement('img');
            // Avoid early reflows as images load without sizes. Wait for onload.
            el.onload = onload;
            el.src = img.src;

            _loadedImages[index] = el;
        });
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', getDataUrl, true);
    xhr.onload = function(e) {
        if (this.status == 200) {
            _rawData = JSON.parse(this.response);
            _dataLength =  _rawData.allCars.length;
            loadedCars(_rawData.allCars);
        }
    };
    xhr.send();

    return {

        getDataCount : function(){
            return _dataLength;
        },

        getLoadedImages : function(){
            return _loadedImages;
        },
        getLoadedData : function(){
            //console.log("called in main js", _rawData.allCars.length, counter++);
            return _rawData;
        },
        getHighResImages : function () {
            _rawData.allCars.forEach(function (img, index) {
                var el = document.createElement('img');
                // Avoid early reflows as images load without sizes. Wait for onload.
                el.onload = onload;
                el.src = img.highResSrc?img.highResSrc:img.src;
                _loadedHighResImages.push(el);
            });
            return _loadedHighResImages;
        }
    }

}());
/*
var loadServerData = (function(){
    'use strict';
    var wrapper = document.getElementById('wrapper');
    wrapper.style.backgroundImage =  "url('"+firstLoadImg+"')";
    wrapper.style.backgroundImage =  "url('"+firstLoadImg+"')";
    wrapper.style.backgroundSize = "cover";

    var _dataLength = 0;
    var _loadedImages = [];
    var _loadedHighResImages = [];
    var _rawData = {allCars:[]};

    var xhr = new XMLHttpRequest();
    xhr.open('GET', getDataUrl, true);
    xhr.onload = function(e) {
        if (this.status == 200) {
            _rawData = JSON.parse(this.response);
            _dataLength =  _rawData.allCars.length;
            _loadedImages = new Array(_dataLength);
            loaded(_rawData.allCars);
        }
    };
    xhr.send();

    function loaded(cars) {

    }
}());*/
