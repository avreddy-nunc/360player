(function (window) {
    var timeStart = new Date();
    var _s = {}; //settings or initial values global object;
    _s.carImgs = [];
    _s.carsData = [];
    _s.hsData = [];
    _s.lastX = 0;
    _s.direction = "";
    _s.currentFrame = 0;
    _s.runAnim = false;
    _s.imgCount = 0;
    _s.totalImages = window.globalVar.totalImages;
    _s.aspectRatio = getAspectRatio();
    _s.playerWidth = parseFloat($('#wrapper').width());
    _s.playerHeight = _s.playerWidth * _s.aspectRatio;
    _s.maxImageWidth = Number(window.globalVar.maxWidth);
    _s.maxImageHeight = _s.maxImageWidth * _s.aspectRatio;
    _s.maxZoomLevel = 40;
    _s.redrawImgCount =  3;
    _s.resetRedrawCount = 0;
    _s.requiredImgCount = 216;
    _s.zoomIn = false;
    _s.spinCompleted = 0;
    _s.stats = {};
    _s.stats.trackID = window.globalVar.trackID || "abc123456";
    _s.stats.spins = 0;
    _s.stats.highlights = [];
    _s.stats.prevImgStartTime = getCurDateTime();
    _s.stats.seenImages = [];
    _s.stats.count = 0;
    _s.stats.prevImg;
    _s.showHighlights = true;
    _s.swipeThreshold = (window.globalVar.swipeThreshold && !isNaN(Number(window.globalVar.swipeThreshold)) && Number(window.globalVar.swipeThreshold))? Number(window.globalVar.swipeThreshold): 0.6;
    _s.swipeTotalImages =  (window.globalVar.totalImages && !isNaN(Number(window.globalVar.totalImages)) && Number(window.globalVar.totalImages))? Number(window.globalVar.totalImages): 0;
    _s.baseImgWidth = window.globalVar.baseImgWidth;
    _s.baseImgHeight = window.globalVar.baseImgHeight;

    $('#wrapper').height(_s.playerHeight);
    /*var imgDim = new Image();
    imgDim.onload = function(){
        setPlayerSize(this.width, this.height);
    };
    imgDim.src = window.firstLoadImg;
*/
    $('#ext-player-icon').on('click', function () {
        closeFullscreen();
        var carsJson = 'exterior';
        var url = '?video_fk=' + window.videoFK;
        getUrl = url + "&playerType=" + carsJson;
        location.replace(getUrl);
    });

    $('#int-player-icon').on('click', function () {
        closeFullscreen();
        var carsJson = 'interior';
        var url = '?video_fk=' + window.videoFK;
        getUrl = url + "&playerType=" + carsJson;
        location.replace(getUrl);
    });
    $('#pano-player-icon').on('click', function () {
        closeFullscreen();
        var carsJson = 'interior-pano';
        var url = '?video_fk=' + window.videoFK;
        getUrl = url + "&playerType=" + carsJson;
        location.replace(getUrl);
    });
    $('#hotspots-icon').on('click', function(){
        closeShareList();
        _s.showHighlights ? _s.showHighlights = false:_s.showHighlights = true;
        $('.hotspot').toggle();
        $(this).toggleClass('active');
    });
    $('#share-icon').on('click', function (e) {
        e.preventDefault();
        $(this).toggleClass('active');
        $(this).find('#share-list').toggle();
    });
    $("#facebook-icon").on("click touch", function (e) {
        e.stopImmediatePropagation();
        e.preventDefault();
        var url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(window.location);
        window.open(url, 'mywin', 'left=355, top=200, width=600, height=368, toolbar=1, resizable=0');
    });

    $("#twitter-icon").on("click touch", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var pageTitle = $("title").text();
        var url = "https://twitter.com/intent/tweet?text=" + encodeURI(pageTitle) + "&url=" + encodeURI(window.location);
        window.open(url, 'mywin', 'left=355, top=200, width=600, height=368, toolbar=1, resizable=0');
    });
    function closeShareList(){
        $('#share-icon').removeClass('active');
        $('#share-list').hide();
    }
    function closeFullscreen() {
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen();
            $('#hotspots-div, #wrapper').css('max-width', _s.maxImageWidth + "px");
            $('#hotspots-div, #wrapper').css('max-height',_s.maxImageHeight + "px");
            $('#fullscreen-icon').removeClass('active');
            $('#fullscreen-icon img').attr({"src":"./img/fullscreen.svg"});
        }
    }
    //alert(window.orientation)
    if(document.fullscreenEnabled){
        $('#fullscreen-icon').show();
    }
    $('#fullscreen-icon').on("click touch", function (e) {
        var elem = document.body;
        if (!document.fullscreenElement) {
            elem.requestFullscreen();
            $('#hotspots-div, #wrapper').css('max-width',"100%");
            $('#hotspots-div, #wrapper').css('max-height',"100%");
            $('#fullscreen-icon').addClass('active');
            $('#fullscreen-icon img').attr({"src":"./img/fullscreen-close.svg"});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                $('#hotspots-div, #wrapper').css('max-width', _s.maxImageWidth + "px");
                $('#hotspots-div, #wrapper').css('max-height',_s.maxImageHeight + "px");
                $('#fullscreen-icon').removeClass('active');
                $('#fullscreen-icon img').attr({"src":"./img/fullscreen.svg"});
            }
        }
    });
    function fullscreenChanged() {
        if (document.fullscreenElement) {
            $('#fullscreen-icon').addClass('active');
            $('#hotspots-div, #wrapper').css('max-width',"100%");
            $('#hotspots-div, #wrapper').css('max-height',"100%");
            $('#fullscreen-icon img').attr({"src": "./img/fullscreen-close.svg"});
        } else {
            $('#fullscreen-icon').removeClass('active');
            $('#hotspots-div, #wrapper').css('max-width', _s.maxImageWidth + "px");
            $('#hotspots-div, #wrapper').css('max-height',_s.maxImageHeight + "px");
            $('#fullscreen-icon img').attr({"src": "./img/fullscreen.svg"});
        }
    }
    document.addEventListener("fullscreenchange", fullscreenChanged,false);
    document.addEventListener("MSFullscreenChange", fullscreenChanged,false);
    document.addEventListener("mozfullscreenchange", fullscreenChanged,false);
    document.addEventListener("webkitfullscreenchange", fullscreenChanged,false);
    document.addEventListener("webkitfullscreenchange", fullscreenChanged,false);

    function isMobile() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return (/android/i.test(userAgent)) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)
    }
    if(isMobile()){
        $('#circle-indicator').addClass('mobile');
        $('.ctrls').addClass('mobile');
    }
    if(window.globalVar.nextPlayerType === 'interior'){
        $("#int-player-icon").show();
    }else if(window.globalVar.nextPlayerType === 'interior-pano'){
        $("#pano-player-icon").show();
    }
    if (window.globalVar.playerType === "exterior" || typeof window.globalVar.playerType === "undefined") {
        $("#ext-player-icon").addClass('icon-active');
        $("#ext-player-icon").hide();
        $("#int-player-icon").removeClass('icon-active');
        $("#pano-player-icon").removeClass('icon-active');
        $('#ext-player-icon').off('click');
        $('#ext-player-icon').off('touch');

    } else if (window.globalVar.playerType === "interior") {
        $("#int-player-icon").addClass('icon-active');
        $("#int-player-icon").hide();
        $("#ext-player-icon").removeClass('icon-active');
        $("#pano-player-icon").removeClass('icon-active');
        $('#int-player-icon').off('click');
        $('#int-player-icon').off('touch');
    } else if (window.globalVar.playerType === "interior-pano") {
        $("#pano-player-icon").addClass('icon-active');
        $("#pano-player-icon").hide();
        $("#ext-player-icon").removeClass('icon-active');
        $("#int-player-icon").removeClass('icon-active');
        $('#pano-player-icon').off('click');
        $('#pano-player-icon').off('touch');
    }
    Array.prototype.tweenLoad = function (callback) {
        var start = 0, end=this.length-1;
        callback(this[start],start);
        callback(this[end],end);
        var self = this;
        sendMid.call(null,[start,end]);
        function sendMid() {
            var args = [];
            for(var i=0;i<sendMid.arguments.length;i++){
                var start = sendMid.arguments[i][0];
                var end = sendMid.arguments[i][1];
                if ((end - start)>1) {
                    if ((start + end) % 2 === 0) {
                        var mid = (start + end) / 2;
                        callback(self[mid], mid);
                        args.push([start,mid]);
                        args.push([mid,end]);
                    } else {
                        var mid1 = Math.floor((start + end) / 2);
                        var mid2 = Math.ceil((start + end) / 2);
                        callback(self[mid1], mid1);
                        callback(self[mid2], mid2);
                        args.push([start,mid1]);
                        args.push([mid2,end]);
                    }
                }else{
                    return start;
                }
            }
            return sendMid.apply(null, args);
        }
    };
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var loadedImagesCount = 0;
    var wrapper = document.getElementById('wrapper');
    wrapper.style.backgroundImage =  "url('"+window.firstLoadImg+"')";
    wrapper.style.backgroundImage =  "url('"+window.firstLoadImg+"')";
    wrapper.style.backgroundSize = "cover";
    var fi = new Image();
    fi.onload = function(){
        setPlayerSize(this.width, this.height);
    };
    fi.src = window.firstLoadImg;

    var _dataLength = 0;
    var _loadedImages = [];
    var _loadedHighResImages = [];
    var _loadedHighResImagesSample = [];
    var _rawData = {allCars:[]};
    function loadedCars(cars){
        var count = 0,
            onload = function () {
                count++;
                imageLoaded(count);
                /*if(count===cars.length){
                    loadHighResImages();
                }*/
                delete this.onload;
            };
        cars.tweenLoad(function (img, index) {
            var el = document.createElement('img');
            // Avoid early reflows as images load without sizes. Wait for onload.
            el.onload = onload;
            el.src = img.src;
            _loadedImages[index] = el;
        });
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', window.getDataUrl, true);
    xhr.onload = function(e) {
        if (this.status == 200) {
            _rawData = JSON.parse(this.response);
            _dataLength =  _rawData.allCars.length;
            loadedCars(_rawData.allCars);
        }
    };
    xhr.send();
    function getData(done){
        var getDataInterval = setInterval(function(){
            if( _loadedImages.length > 0 && _rawData.allCars.length > 0){
                done([_loadedImages, _rawData]);
                clearInterval(getDataInterval);
            }
        }, 10);
    }
    function getHighResImages(done) {
        _rawData.allCars.forEach(function (img, index) {
            var el = document.createElement('img');
            // Avoid early reflows as images load without sizes. Wait for onload.
            el.onload = onload;
            el.src = img.highResSrc?img.highResSrc:img.src;
            _loadedHighResImages.push(el);
        });
        done(_loadedHighResImages);
    }
    function assignLoadedHighImage(lowResImage, highResImages) {
        var assignDataInterval = setInterval(function () {
            var assigned = 0;
            for(var i=0;i<loadedImages.length;i++){
                if(loadedHighResImages[i].complete){
                    assigned++;
                    loadedImages[i] = loadedHighResImages[i];
                    //console.log(loadedImages[i].src,i);
                }
            }
            if(assigned===loadedImages.length){
                clearInterval(assignDataInterval);
            }
        },200);
    }
    function imageLoaded(loadedCount) {
        _s.redrawImgCount = getSpeed(loadedCount);
        _s.redrawGyroImgCount = getGyroSpeed(loadedCount);
        setSpinIndicator(loadedCount);
    }

    var speed = window.query.speed;

    if ($.isNumeric(speed)) {
        _s.redrawImgCount = parseInt(speed);
    }

    $('#loading-div').fadeIn();

    /*=== function to get spee dof rotation based on images loaded ===*/
    function getSpeed(totalCount) {
        var speed = 3;
        //var speed = 0;
        if(_s.swipeTotalImages > 0){
            var touchDistance = Math.floor((_s.swipeThreshold*_s.playerWidth));
            speed = Math.floor(touchDistance/totalCount);
            speed =  speed>75?75:speed;
        }
        return speed;
    }
    function getGyroSpeed(totalCount) {
        var speed;
        var touchDistance = 360;
        speed = Math.floor(touchDistance/totalCount);
        speed =  speed>2?2:(speed<=1?1:speed);
        return speed;
    }

    function setPlayerSize(imgWidth, imgHeight){

        var $wrapper = $('#wrapper');
        var wrapperWidth = $wrapper.width();
        var otherWidth = 0;

        _s.aspectRatio = getAspectRatio(imgWidth, imgHeight);
        _s.maxImageHeight = _s.aspectRatio*_s.maxImageWidth;
        parent.postMessage(JSON.stringify({"aspectRation":_s.aspectRatio}),"*");
        if(_s.aspectRatio === 0.5625){
            $("#ar").addClass('ar-16-9');
        }else if(_s.aspectRatio === 0.75){
            $("#ar").addClass('ar-4-3');
        }else{
            if(imgWidth > _s.maxImageWidth){
                otherWidth = _s.maxImageWidth;
            }else{
                otherWidth = imgWidth;
            }
            $wrapper.css('max-width',otherWidth+'px');
            $("#ar").css('padding-bottom', _s.aspectRatio*100+'%');
        }
        var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
        //alert(screen.width);
        /*explicit ipad condition is used because while orientation change ipad innerwidth is not updateding, this condition can be removed if ipad functionality changes*/
        if (isMobile()) {
            if(iOS && iOS[0]==="iPad"){
                $wrapper.css('width', window.outerWidth);
                _s.playerWidth = window.outerWidth;
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
            }else {
                $wrapper.css('width', $(window).innerWidth());
                _s.playerWidth = $(window).innerWidth();
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
            }

        } else {
            $wrapper.css('width', '100%');
        _s.playerWidth = $wrapper.width();
        _s.playerHeight = _s.playerWidth * _s.aspectRatio;
        }
        if(window.innerHeight < _s.playerHeight){
            _s.playerWidth = window.innerHeight / _s.aspectRatio;
            _s.playerHeight = _s.playerWidth * _s.aspectRatio;
            $wrapper.width(_s.playerWidth);
        }
        $wrapper.height(_s.playerHeight);
        if(isMobile()) {
            $wrapper.css('max-width', '100%');
            $wrapper.css('max-height', '100%');
        }else{
            $wrapper.css('max-width', _s.maxImageWidth+'px');
            $wrapper.css('max-height', _s.maxImageHeight+'px');
        }
            _s.redrawImgCount = getSpeed(_s.totalImages);
            setSpinIndicator();
            changeSpinIndicator();
        }
    function drawPlayer(e){
        //console.log(e.alpha);
        if(e.alpha) {
            _s.runAnim = true;
            var currAlpha = Math.floor(e.alpha);
            var total = loadedImages.length - 1;
            var prevFrame = _s.currentFrame;
            if (currAlpha !== _s.lastAlpha) {
                if (_s.lastAlpha < currAlpha) {
                    _s.direction = 'moveright';
                } else {
                    _s.direction = 'moveleft';
                }
                do {
                    _s.currentFrame = getFrame(total, _s.direction, _s.currentFrame, true);
                    changeSpinIndicator();
                } while (!loadedImages[_s.currentFrame].complete);
                if (prevFrame !== _s.currentFrame) {
                    console.log(_s.currentFrame);
                    draw(_s.currentFrame, ctx, _s.playerWidth, _s.playerHeight);
                }
                _s.lastAlpha = currAlpha;
            }
        }
    }

    if(window.globalVar.playerType==='exterior' || window.globalVar.playerType==='interior') {

        var allfeatures = $.getJSON("?RUN_TYPE=GET_HOT_SPOTS&videoId=" + window.videoId + "&type=" + window.globalVar.playerType + "&all=true&player=true&dataType=json&time=" + Date.now(), function (data) {

        }).done(function (allfeatures) {
            if (allfeatures.allFeatures.length) {
                var features = " ";
                $.each(allfeatures.allFeatures, function (i, f) {
                    _s.hsData.push(f);
                    features += "<li data-fid='" + f.id + "'>" + f.featureName + "</li>";
                });
                $("#features-list ul").append(features);
                $("#features-list").show();
                $('#hotspots-icon').show();
            } else {
                $("#features-list").hide();
                $('#hotspots-icon').hide();
            }

        }).fail(function () {
            console.log("error");
            $("#features-list").hide();
            $('#hotspots-icon').hide();
        });

        var loadedData = {};
        //var allCars = [];
        loadedData = {allCars:[]};
        var loadedImages = [];
        var loadedHighResImages = [];
        var loadedZoomImages = [];
        var zoomLevel = 10;
        getData(function (data) {

            loadedImages = data[0];
            loadedData = data[1];

            //_s.totalImages = loadedData.allCars.length;
            ctx.canvas.width = _s.playerWidth;
            ctx.canvas.height = _s.playerHeight;
            if (window.globalVar.rotationReverse == "1") {
                //alert(window.globalVar.rotationReverse);
                loadedData.allCars.reverse();
                loadedImages.reverse();
            }
            registerEvents(ctx);
                    if (window.globalVar.initLoad) {
                $("#temp-div").show();
                //firstLoad();
                normalLoad();
            } else {
                normalLoad();
            }
            window.setInterval(function () {
                var percentCompleted = 0;
                if (loadedImages.length > 0) {
                    percentCompleted = _s.stats.seenImages.length / loadedImages.length;
                }
                _s.stats.count++;
                logStats({percentCompleted: percentCompleted * 100, count: _s.stats.count})
            }, 5000)
        });
        function loadHighResImages(){
            getHighResImages(function (value) {
                loadedHighResImages = value;
                assignLoadedHighImage(loadedImages,loadedHighResImages);
                value.forEach(function (node) {
                    loadedZoomImages.push(node.cloneNode(true));
                });
            });
        }

        var counter = 0;

        function normalLoad() {
            var newImg = new Image();
            newImg.onload = function () {
                setPlayerSize(this.width, this.height);
            ctx.canvas.width = _s.playerWidth;
                ctx.canvas.height = _s.playerHeight;
                ctx.drawImage(newImg, 0, 0, _s.playerWidth, _s.playerHeight);

                loadHl();
                endLoading();
            };
            newImg.src = loadedData.allCars[0].src;
        }

        function endLoading() {
            _s.currentFrame = 0;
            ctx.drawImage(loadedImages[_s.currentFrame], 0, 0, _s.playerWidth, _s.playerHeight);
            $("#temp-div").hide();
            $("#user-info-box").fadeOut();
            $("#loading-div").fadeOut();
            if(window.DeviceMotionEvent){
                _s.lastAlpha = 0;
                window.ondeviceorientation = drawPlayer;
            }
            console.log(Math.abs((new Date()).getTime()-timeStart.getTime()));
            var wrapper = document.getElementById('wrapper');
            wrapper.style.backgroundImage =  "none";
        }

        function loadHl() {
            $("#hotspots-div").children('.hotspot').empty();
            if (loadedData.allCars[_s.currentFrame].hotSpot.length) {
                $.each(loadedData.allCars[_s.currentFrame].hotSpot, function (i, hs) {
                    var updatedPos = getCoordinates(hs.left, hs.top);
                    drawHotspot(ctx, hs, _s.currentFrame, updatedPos.x, updatedPos.y);
                });
            }
        }


        function draw(currentFrame, ctx, width, height, resize) {

            if (!_s.runAnim && !resize) {
                return;
            }

            if (!resize) {
                watchSpin(currentFrame, loadedImages.length);
                if (_s.stats.prevImg !== loadedData.allCars[currentFrame].src) {
                    logStats({
                        "src": loadedData.allCars[currentFrame].src,
                        "imageId": loadedData.allCars[currentFrame].imageId,
                        "imgType": loadedData.allCars[currentFrame].imgType,
                        "imgTimeStart": _s.stats.prevImgStartTime,
                        "imgTimeEnd": getCurDateTime()
                    });
                    _s.stats.prevImgStartTime = getCurDateTime();
                    _s.stats.prevImg = loadedData.allCars[currentFrame].src;
                }
            }
            $('.hotspot').remove();
            ctx.canvas.width = _s.playerWidth;
            ctx.canvas.height = _s.playerHeight;

            ctx.drawImage(loadedImages[currentFrame], 0, 0, _s.playerWidth, _s.playerHeight);
            //console.log(_s.carsData[currentFrame].hotSpot);
            if (loadedData.allCars[currentFrame].hotSpot.length) {
                $.each(loadedData.allCars[currentFrame].hotSpot, function (i, hs) {
                    var updatedPos = getCoordinates(hs.left, hs.top);
                    drawHotspot(ctx, hs, currentFrame, updatedPos.x, updatedPos.y);
                });
            }

        }

        function watchSpin(currentFrame, totalFrames) {
            if (parseInt(currentFrame) === parseInt(totalFrames - 1)) {
                _s.spinCompleted++;
                if (_s.spinCompleted > 3) {
                    logStats({spin: +1});
                    _s.spinCompleted = 0;
                }
            }
        }

        function getFrame(total, direction, currentFrame, isGyro) {
            var redrawCount = isGyro?_s.redrawGyroImgCount:_s.redrawImgCount;
            if (redrawCount > _s.resetRedrawCount) {
                _s.resetRedrawCount++;
                return currentFrame;
            } else {
                _s.resetRedrawCount = 0;
            }

            if (direction === 'moveright') {
                if (total === currentFrame) {
                    currentFrame = 0;
                } else {
                    currentFrame++;
                }
            } else if (direction === 'moveleft') {
                if (currentFrame === 0) {
                    currentFrame = total;
                } else {
                    currentFrame--;
                }
            }
            if (_s.stats.seenImages.indexOf(currentFrame) == -1) {
                _s.stats.seenImages.push(currentFrame);
            }
            return Math.abs(currentFrame);
        }

        function registerEvents(ctx) {

            $('#features-list').on('click touch', function (e) {
                e.preventDefault();
                $('#features-list').find('ul').toggle();
                /* setFListHeight();*/
            });
            $('#features-list').on('click touch', 'ul li', function (e) {
                var featureId = $(this).attr("data-fid");
                var goToFrame = getGoToFrame(loadedData.allCars, featureId);
                changeSpinIndicator(goToFrame);
                runPlayer(_s.currentFrame, goToFrame, ctx, featureId, "1");
            });

            $("#loading-div").on('mousedown mousemove click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
            });

            $('#hotspots-div').on("click touch", function (e) {
                var x = e.pageX;
                var y = e.pageY;
                e.preventDefault();
            });

            $('#hotspots-div').on("click touch", '.hotspot', function (e) {
                _s.runAnim = false;
                e.preventDefault();
                e.stopImmediatePropagation();
                showHotspot(e);
            });

            $('#hotspots-div').on('mouseover', function (event) {
                $(this).removeClass("touch_mode_grabbing")
                    .addClass("touch_mode_grab");

            });

            $('#hotspots-div').on('mouseover', ".hotspot img", function (event) {
                $(this).siblings('.hover-title').show();
            }).on('mouseout', '.hotspot img', function (event) {
                $(this).siblings('.hover-title').hide();
            });

            $("body").on("mousedown touchstart", "#hotspots-div", function (e) {
                $("#hotspots-div").removeClass("touch_mode_grab")
                    .addClass("touch_mode_grabbing");
                $('#features-list ul').hide();
                if ($(e.target).attr('id') !== "hotspots-div") {
                    return;
                }
                if (typeof e.pageX !== "undefined" && e.pageX>0) {
                    _s.lastX = e.pageX;
                    _s.redrawImgCount = getSetTime();
                } else if (typeof e.originalEvent.touches[0].pageX !== "undefined") {
                    _s.lastX = e.originalEvent.touches[0].pageX;
                    _s.redrawImgCount = getSetTime("touch");
                }
                _s.runAnim = true;
                if (e.cancelable) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            });

            $("body").on("mousemove touchmove", "#hotspots-div", function (e) {
                var touch = false;
                if (typeof e.pageX !== "undefined" && e.pageX > 0) {
                    if (_s.lastX === e.pageX) {
                        return;
                    }
                } else if (typeof e.originalEvent.touches[0].pageX !== "undefined") {
                        if (_s.lastX === e.originalEvent.touches[0].pageX) {
                            return;
                        }
                }

                if (!_s.runAnim) {
                    unhideNavbar();
                    return;
                }
                window.ondeviceorientation = null;
                hideNavbar();
                closeShareList();
                var pageX = 0;

                $("#info-box").removeClass('displayed');

                $("#info-box").fadeOut();

                if (typeof e.pageX !== "undefined" && e.pageX > 0) {
                    pageX = e.pageX;
                } else if (typeof e.originalEvent.touches[0].pageX !== "undefined") {
                    pageX = e.originalEvent.touches[0].pageX;
                    touch = true;
                }
                if (_s.lastX < pageX) {
                    _s.direction = 'moveright';
                } else {
                    _s.direction = 'moveleft';
                }
                var total = loadedImages.length - 1;
                var prevFrame = _s.currentFrame;
                do {
                    for (var i = 0; i < Math.abs(_s.lastX - pageX); i++) {
                        _s.currentFrame = getFrame(total, _s.direction, _s.currentFrame);
                        changeSpinIndicator();
                    }
                }while (!loadedImages[_s.currentFrame].complete);
                if(prevFrame!==_s.currentFrame) {
                draw(_s.currentFrame, ctx, _s.playerWidth, _s.playerHeight);
                }
                _s.lastX = pageX;

            });

            $("body").on("mouseup touchend mouseout touchleave", "#hotspots-div", function (e) {
                $("#hotspots-div").removeClass("touch_mode_grabbing")
                    .addClass("touch_mode_grab");

                if (_s.runAnim) {
                    _s.runAnim = false;
                    unhideNavbar();
                    window.ondeviceorientation = drawPlayer;
                }
            });

            $("#info-box").on('click touch', "#info-close-icon", function (e) {

                $(this).parent().fadeOut();
                $(this).parent().removeClass('displayed');
                    zoomImg(_s.currentFrame, ctx, "zoomout");
                    _s.zoomIn = false;
                if (_s.stats.highlights.length) {
                    _s.stats.highlights[0].timeEnd = getCurDateTime();
                    logStats(_s.stats.highlights[0]);
                }
            });

            $("#info-box").on('click touch', "#thumb-img", function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                var $img = $(this);
                displayModalImg($img);
            });

            $("#close-modal").on('click touch', function (e) {
                if (_s.zoomIn) {
                    zoomImg(_s.currentFrame, ctx, "zoomout");
                    _s.zoomIn = false;
                }
                $("#info-close-icon").trigger('click');
                $(this).parents("#modal").fadeOut();
            });


            $("body").on('click touch', '.nav-next', function (e) {
                if (_s.stats.highlights.length) {
                    _s.stats.highlights[0].timeEnd = getCurDateTime();
                    logStats(_s.stats.highlights[0]);
                }
                e.preventDefault();
                e.stopImmediatePropagation();
                var featureId = $(this).attr('data-feature-id');
                goToFeature(e, featureId, 'nav-next');
                zoomImg(_s.currentFrame, ctx, "zoomout");
                _s.zoomIn = false;
                $("#close-modal").trigger('click');

            });

            $("body").on('click touch', '.nav-prev', function (e) {
                if (_s.stats.highlights.length) {
                    _s.stats.highlights[0].timeEnd = getCurDateTime();
                    logStats(_s.stats.highlights[0]);
                }
                e.preventDefault();
                e.stopImmediatePropagation();
                var featureId = $(this).attr('data-feature-id');
                goToFeature(e, featureId, 'nav-prev');
                zoomImg(_s.currentFrame, ctx, "zoomout");
                _s.zoomIn = false;
                $("#close-modal").trigger('click');

            });

            $('#zoom-in-icon').on("click touch", function (e) {
                if(zoomLevel<_s.maxZoomLevel) {
                    zoomLevel += 2;
                    zoomImg(_s.currentFrame, ctx, "zoomin");
                    _s.zoomIn = true;
                }
            });

            $('#zoom-out-icon').on("click touch", function (e) {
                if(zoomLevel>10) {
                    zoomLevel -= 2;
                    if (zoomLevel === 10) {
                        zoomImg(_s.currentFrame, ctx, "zoomout");
                        _s.zoomIn = false;
                        if (_s.stats.highlights.length) {
                            _s.stats.highlights[0].timeEnd = getCurDateTime();
                            logStats(_s.stats.highlights[0]);
                        }
                    }else{
                        zoomImg(_s.currentFrame, ctx, "zoomstepout");
                    }
                }
            });
            function MouseWheelHandler(e){
                if(e.deltaY<0){
                    if(zoomLevel<_s.maxZoomLevel) {
                        e.preventDefault();
                        zoomLevel += 2;
                        zoomImg(_s.currentFrame, ctx, "zoomin");
                        _s.zoomIn = true;
                    }
                }else if(e.deltaY>0){
                    if(zoomLevel>10) {
                        e.preventDefault();
                        zoomLevel -= 2;
                        if (zoomLevel === 10) {
                            zoomImg(_s.currentFrame, ctx, "zoomout");
                            if (_s.stats.highlights.length) {
                                _s.stats.highlights[0].timeEnd = getCurDateTime();
                                logStats(_s.stats.highlights[0]);
                            }

                        }else{
                            zoomImg(_s.currentFrame, ctx, "zoomstepout");
                        }
                    }
                }
            }
            document.getElementById('hotspots-div').addEventListener("mousewheel", MouseWheelHandler, false);
            // Firefox
            document.getElementById('hotspots-div').onwheel = MouseWheelHandler;
            document.getElementById('hotspots-div').addEventListener('wheel', MouseWheelHandler);
            document.getElementById('zoom-div').addEventListener("mousewheel", MouseWheelHandler, false);
            // Firefox
            document.getElementById('zoom-div').addEventListener('wheel', MouseWheelHandler);


        }

        /*=========== functions for 360 spin indicators =======*/
        function setSpinIndicator(totalImages) {
            if(!totalImages){
                totalImages =  _s.totalImages;
            }
            var indicator = document.getElementById('progress-indicator');
            var circumference = 2 * Math.PI * indicator.r.baseVal.value;
            indicator.style.strokeDashoffset = (circumference - circumference / totalImages) + 'px';
        }

        function changeSpinIndicator(goto) {
            var frame = goto ? goto : _s.currentFrame;
            var indicator = document.getElementById('progress-indicator');
            var frameValue = frame * 360 / _s.totalImages;

            if (isNaN(frameValue)) {
                frameValue = 0;
            }

            var rotationDeg = 'rotate(' + frameValue + ' ' + indicator.cx.baseVal.value + ' ' + indicator.cy.baseVal.value + ')';
            indicator.setAttribute('transform', rotationDeg);
        }

        /*=========== end of functions for 360 spin indicators ====*/
        function getSetTime(touch) {

            if (_s.redrawImgCount === 0) {
                _s.redrawImgCount = 3;

            }
            return _s.redrawImgCount;
        }

        function goToFeature(e, featureId, navType) {

            var frame;
            var feature_name;
            var forder = null;
            var feature_id;
            var len = _s.hsData.length;

            for (var i = 0; i < len; i++) {
                if (_s.hsData[i].id === featureId) {
                    forder = +_s.hsData[i].forder;
                    break;
                }
            }

            if (navType === "nav-next") {
                if (forder + 1 === len) {
                    forder = 0;
                } else {
                    forder = forder + 1;
                }

            } else if (navType === 'nav-prev') {
                if (forder === 0) {
                    forder = len - 1;
                } else {
                    forder = forder - 1;
                }
            }

            feature_id = _s.hsData[forder].id;
            forder = null;
            frame = getGoToFrame(loadedData.allCars, feature_id);
            //console.log(frame);
            setTimeout(function () {
                runPlayer(_s.currentFrame, frame, ctx, feature_id, "3");
            }, 500);
        }

        function getGoToFrame(carsData, featureId) {
            var frame;
            $.each(carsData, function (i, cd) {
                if (cd.hotSpot.length) {
                    $.each(cd.hotSpot, function (c, hs) {
                        if (parseInt(hs.mainId) === parseInt(featureId)) {
                            frame = i;
                        }
                    });
                }
            });
            return frame;
        }

        function displayModalImg($img) {
            if ($img.attr('src')) {
                var img = $('<img/>');
                $("#modal > span").children().remove();
                img.on('load', function () {

                    $("#modal > span").append(img);

                });
                img.attr('src', $img.attr('src'));
                $("#modal").fadeIn();
            }
        }

        function showHotspot(e) {
            closeShareList();
            var data = {};//360 stats
            var $el = $(e.target);
            var posX = e.pageX || e.originalEvent.touches[0].pageX;
            var posY = e.pageY || e.originalEvent.touches[0].pageY;

            var mainId = $(e.target).parent().attr('data-mainId');
            var hs = findHotspot(mainId, _s.currentFrame);
            var pos = getCoordinates(hs.left, hs.top);
            data.hid = hs.mainId; //360 stats
            data.featureName = hs.featureName;
            data.source = 2;
            data.timeStart = getCurDateTime();
            data.timeEnd = getCurDateTime();
            _s.stats.highlights.push(data);

            if ($("#info-box").hasClass('displayed')) {
                $("#info-box").removeClass('displayed');
                $("#info-box").hide();
            }

            if (hs) {
                var desc = getFeatureDesc(hs.spotName);
                if (desc.thumb) {
                    var $img = $('<img/>');
                    $img.attr('src', desc.thumb);
                    displayModalImg($img);
                    displayInfoBox(hs, false);
                } else {
                    displayInfoBox(hs, false);
                    zoomLevel += 2;
                    zoomImg(_s.currentFrame, ctx, "zoomin", {left: pos.x, top: pos.y});
                    _s.zoomIn = true;
                }
            } else {
                $("#info-box").removeClass('displayed');
                $("#info-box").hide();
            }
        }

        function buildInfoBox(desc, showImg) {
            var box = '<h3>' + desc.name + '</h3>';
            box += '<img class="fa-times info-close-icon" id="info-close-icon" src="./img/times-solid.svg" alt="..."/>';


            if (desc.thumb && showImg) {
                box += '<p class="featureThumb"><img id="thumb-img" src="' + desc.thumb + '" alt="feature thumbnail" title="click to view large image."></p>';
            }

            if (desc.desc) {
                box += '<p>' + desc.desc + '</p>';
            }
            box += '<p class="arrows"><img src="/img/arrow-circle-left-solid.svg" alt="..." class="fa-arrow-circle-left nav-prev" data-feature-id="' + desc.id + '"><img src="/img/arrow-circle-right-solid.svg" alt="..." class="fa-arrow-circle-right nav-next" data-feature-id="' + desc.id + '"></p>';
            return box;
        }

        function displayInfoBox(hs, showImg) {
            var $infoBox = $("#info-box");
            var desc = getFeatureDesc(hs.spotName);
            var info = buildInfoBox(desc, false);
            $infoBox.html(info);
            $infoBox.addClass('displayed');
            $infoBox.show();
        }

        function getFeatureDesc(spotName) {
            var desc;
            var thumb;
            var name, id;
            if (_s.hsData.length) {
                $.each(_s.hsData, function (i, d) {
                    if (d.spotName === spotName) {
                        desc = d.description;
                        thumb = d.src;
                        name = d.featureName;
                        id = d.id;
                    }
                });
            }
            var featureDesc = {
                desc: desc,
                thumb: thumb,
                name: name,
                id: id
            };
            return featureDesc;
        }

        function drawHotspot(ctx, hs, currentFrame, left, top) {
            var hotspot = $("<div/>");
            hotspot.addClass('hotspot');
            hotspot.attr("data-mainId", hs.mainId);

            hotspot.css({'left': +left - 12.5, 'top': +top - 12.5});

            //var hsicon = "<i title='"+hs.featureName+"' class='fa "+hs.iconName+"'></i>";
            var hsicon = "<img src='/img/" + hs.iconName + ".svg'><span class='hover-title'>" + hs.featureName + "</span>";

            hotspot.append(hsicon);
            $("#hotspots-div").append(hotspot).fadeIn();
            toggleHotspot();

        }

        function isEmpty(val) {
            return (val === undefined || val == null || val == 0 || val.length <= 0) ? true : false;
        }

        function getCoordinates(x, y) {
            if (isEmpty(_s.baseImgWidth)) {
                var p_width = x / 258;
                if (_s.aspectRatio === 0.75) {
                    var p_height = y / 194;
                } else {
                    var p_height = y / 145;
                }
            } else {
                var p_width = x / (_s.baseImgWidth);
                if (_s.aspectRatio === 0.75) {
                    var p_height = y / (_s.baseImgHeight);
                } else {
                    var p_height = y / (_s.baseImgHeight);
                }
            }
            var positionX = p_width * _s.playerWidth;
            var positionY = p_height * _s.playerHeight;
            return {x: positionX, y: positionY};

        }

        function findHotspot(mainId, currentFrame) {
            var hotspot;
            var hotspots = loadedData.allCars[currentFrame].hotSpot;
            $.each(hotspots, function (i, hs) {
                if (mainId === hs.mainId) {
                    hotspot = hs;
                }
            });
            if (typeof hotspot === "undefined") {
                return false;
            } else {
                return hotspot;
            }
        }

        function runPlayer(startFrame, endFrame, ctx, featureId, menu) {
            $("#info-box").removeClass('displayed');
            $("#info-box").hide();
            i = startFrame;
            var anim;
            var total = loadedData.allCars.length;

            anim = setInterval(function () {
                _s.runAnim = true;
                if (i === total) {
                    i = 0;
                }
                changeSpinIndicator(i);
                draw(i, ctx, _s.playerWidth, _s.playerHeight);
                _s.runAnim = false;

                if (i === endFrame) {
                    clearInterval(anim);
                    _s.currentFrame = i;
                    var hotspot = loadedData.allCars[_s.currentFrame].hotSpot;
                    if (hotspot.length) {
                        $.each(hotspot, function (index, hs) {
                            if (hs.mainId === featureId) {
                                setTimeout(function () {

                                    var pos = getCoordinates(hs.left, hs.top);
                                    /*=== added for the change of T476 ====*/
                                    var desc = getFeatureDesc(hs.spotName);
                                    if (desc.thumb) {
                                        var $img = $('<img/>');
                                        $img.attr('src', desc.thumb);
                                        displayModalImg($img);
                                        displayInfoBox(hs, false);
                                    } else {
                                        displayInfoBox(hs, false);
                                        zoomLevel += 2;
                                        zoomImg(_s.currentFrame, ctx, "zoomin", {left: pos.x, top: pos.y});
                                        _s.zoomIn = true;
                                    }
                                    /*=== added for the change of T476 ====*/
                                    var data = {}; //360 stats.
                                    data.hid = hs.mainId; //360 stats.
                                    data.featureName = hs.featureName;
                                    data.source = menu; //360 stats.
                                    data.timeStart = getCurDateTime();
                                    data.timeEnd = getCurDateTime();

                                    _s.stats.highlights[0] = data;
                                    _s.zoomIn = true;
                                    zoomLevel += 2;
                                    zoomImg(_s.currentFrame, ctx, "zoomin", {left: pos.x, top: pos.y});
                                }, 500);
                            }
                        });
                    } else {
                        //console.log("no hotspot");
                    }
                }
                i++;
            }, 40);
        }

        function zoomImg(frame, ctx, action, pos) {
            closeShareList();
            //alert('done');
            var img = loadedZoomImages[frame];
            if(!img){
                img = loadedImages[frame];
                if(!loadedZoomImages[frame] && loadedData.allCars[frame].highResSrc) {
                    loadedZoomImages[frame] = new Image();
                    loadedZoomImages[frame].onload = function () {
                        /*var styles = $('#zoom-div img')[0].style;
                        $('#zoom-div').empty().append(this).show();
                        $('#zoom-div img')[0].style = styles;*/
                        $('#zoom-div img').attr("src",this.src);
                    };
                    loadedZoomImages[frame].src = loadedData.allCars[frame].highResSrc;
                }
            }
            if (img) {
                if(zoomLevel===12 && action==='zoomin'){
                    $('#zoom-div').empty();
                    $('#zoom-div').append(img).show();
                    $('#zoom-div img').addClass('item');
                }
                switch (action) {
                    case 'zoomin':
                        $('#zoom-in-icon').addClass('active');
                        $('#zoom-out-icon').removeClass('active');
                        break;
                    case 'zoomstepout':
                        $('#zoom-out-icon').addClass('active');
                        $('#zoom-in-icon').removeClass('active');
                        break;
                    case 'zoomout':
                        $('#zoom-out-icon').removeClass('active');
                        break;
                }
                if ((action === 'zoomin'||action === 'zoomstepout') && zoomLevel>=10 && zoomLevel<=_s.maxZoomLevel) {
                    window.ondeviceorientation = null;
                    $('#circle-indicator').fadeOut();
                    var e = $('#zoom-div');
                    var eimg = $(".item");
                    var center = _s.playerWidth / 2;
                    var middle = _s.playerHeight / 2;

                    var zoomedImgWidth = _s.playerWidth * zoomLevel/10;
                    var zoomedImgHeight = _s.playerHeight * zoomLevel/10;
                    var zoomSize = zoomedImgWidth / _s.playerWidth;
                    var aHeight = zoomedImgHeight - _s.playerHeight;
                    var aWidth = zoomedImgWidth - _s.playerWidth;
                    var left = -aWidth/2 +'px';
                    var top = -aHeight/2 +'px';
                    if (typeof pos !== "undefined") {
                        left = center - (pos.left * zoomSize);
                        if (left < 0) {
                            if (Math.abs(left) > aWidth) {
                                left = -Math.abs(aWidth);
                            }
                        } else if (left > 0) {
                            left = 0;
                        }
                    }

                    if (typeof pos !== "undefined") {
                        top = middle - (pos.top * zoomSize);
                        if (top < 0) {
                            if (Math.abs(top) > aHeight) {
                                top = -Math.abs(aHeight);
                            }
                        } else if (top > 0) {
                            top = 0;
                        }
                    }
                    if($('#features-list ul li').length){
                        $('#features-list').fadeOut();
                    }
                    $("#zoom-div img").stop();
                    $("#zoom-div img").animate({width: zoomLevel*10+'%', left: left, top: top});
                    $('#zoom-out-icon').removeClass('disable');
                    $('#zoom-in-icon').removeClass('disable');
                    if(zoomLevel===_s.maxZoomLevel){
                        $('#zoom-in-icon').addClass('disable');
                    }else if(zoomLevel === 10){
                        $('#zoom-out-icon').addClass('disable');
                    }
                    var imgId = $("#zoom-div img").attr('id');

                } else if (action === "zoomout") {
                    window.ondeviceorientation = drawPlayer;
                    $('#circle-indicator').fadeIn();
                    if($('#features-list ul li').length){
                        $('#features-list').fadeIn();
                    }
                    $('#info-box').fadeOut();
                    $("#zoom-div img").animate({width: '100%', left: '0', top: '0'}, function () {
                        $(this).parent().hide();
                    });
                    $('#zoom-out-icon').addClass('disable');
                    $('#zoom-in-icon').removeClass('active').removeClass('disable');
                    zoomLevel = 10;
                    _s.zoomIn = false;
                }
            }
        }
        var isDragging = false;
        var zIndexTop = 1;
        var prevX = 0;
        var prevY = 0;
        $("#zoom-div").on("mousedown touchstart", ".item", function (e) {
            var $this = $(e.target);
            if (typeof e.pageX !== "undefined" && e.pageX>0) {
                prevX = e.pageX;
                prevY = e.pageY;
            } else if (typeof e.originalEvent.touches[0].pageX !== "undefined") {
                prevX = e.originalEvent.touches[0].pageX;
                prevY = e.originalEvent.touches[0].pageY;
            }
            isDragging = true;
            if (e.cancelable) {
                e.preventDefault();
                e.stopImmediatePropagation();
            }
            $this.addClass('is-dragging');
            $this.css('z-index', ++zIndexTop)
        }).on("mouseup touchend", ".item", function (e) {
            e.stopPropagation();
            var $this = $(this);
            isDragging = false;
            $this.removeClass('is-dragging');
        });

        $("#zoom-div").on("mousemove touchmove", ".item", function (e) {
            var touch = false;
            if (typeof e.pageX !== "undefined" && e.pageX>0) {
                if (prevX === e.pageX) {
                    return;
                }
            } else if (typeof e.originalEvent.touches[0].pageX !== "undefined") {
                    if (prevX === e.originalEvent.touches[0].pageX) {
                        return;
                }
            }

            if (!isDragging) {
                return;
            }
            var pageX = 0,pageY = 0;

            if (typeof e.pageX !== "undefined" && e.pageX>0) {
                pageX = e.pageX;
                pageY = e.pageY;
            } else if (typeof e.originalEvent.touches[0].pageX !== "undefined") {
                pageX = e.originalEvent.touches[0].pageX;
                pageY = e.originalEvent.touches[0].pageY;
                touch = true;
            }
            var $this = $(this);
            var allowedHeight = $this.outerHeight() - _s.playerHeight;
            var allowedWidth = $this.outerWidth() - _s.playerWidth;

            var top = $this.position().top + pageY - prevY  ;
            var left = $this.position().left + pageX - prevX;

            //console.log(top,left);
            if (top > 0) {
                top = 0;
            }

            if (Math.abs(top) > allowedHeight) {
                top = -Math.abs(allowedHeight);
            }

            if (left > 0) {
                left = 0;
            }
            if (Math.abs(left) > allowedWidth) {
                left = -Math.abs(allowedWidth);
            }

            // Stop propagation.
            e.stopPropagation();


            // Update position.
            $this
                .css('left', left + 'px')
                .css('top', top + 'px');
            prevX = pageX;
            prevY = pageY;
        });

        $("#zoom-div .item").on("mouseout touchend touchleave", function (e) {
            e.stopPropagation();
            var $this = $(this);
            isDragging = false;
            $this.removeClass('is-dragging');
        });
        function adjustPositionOnZoomLeft(imageSizeWidth, spotPositionLeft) {
            if (spotPositionLeft > 500) {
                return true;
            }
            if (spotPositionLeft < 200) {
                var actualLeft = 0;
            } else {
                //var r_Width = 150/640;
                var r_Width = 60 / 258;
                var actualLeft = r_Width * parseInt(imageSizeWidth);
            }
            return actualLeft;
        }// adjust left position when zoom in images related to hotspots

        function adjustPositionOnZoomTop(imageSizeHeight) {
            var r_Height = 4 / 145;
            var actualTop = r_Height * parseInt(imageSizeHeight);
            return actualTop;
        }// adjust top position when zoom in images related to hotspots

        var reloadPlayer = function () {
            var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
            //alert(screen.width);
            /*explicit ipad condition is used because while orientation change ipad innerwidth is not updateding, this condition can be removed if ipad functionality changes*/
            if (isMobile()) {
                if(iOS && iOS[0]==="iPad"){
                    $("#wrapper").css('width', window.outerWidth);
                    _s.playerWidth = window.outerWidth;
                    _s.playerHeight = _s.playerWidth * _s.aspectRatio;
                }else {
                    $("#wrapper").css('width', $(window).innerWidth());
                    _s.playerWidth = $(window).innerWidth();
                    _s.playerHeight = _s.playerWidth * _s.aspectRatio;
                }

            } else {
                $("#wrapper").css('width', '100%');
                _s.playerWidth = $("#wrapper").width();
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
            }
            if (window.innerHeight < _s.playerHeight) {
                _s.playerWidth = window.innerHeight / _s.aspectRatio;
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
                $("#wrapper").width(_s.playerWidth);
            }
            $("#wrapper").height(_s.playerHeight);
            if ($('#features-list ul li').length) {
                $('#features-list').fadeIn();
            }
            $('#circle-indicator').fadeIn();
            if(_s.zoomIn){
                zoomImg(_s.currentFrame, ctx, 'zoomout');
            }
            /*$("#zoom-div img").animate(
                {width: '100%', left: '0', top: '0'}, function () {
                    $(this).parent().hide();
                });*/
            $('#zoom-out-icon').removeClass('active').addClass('disable');
            $('#zoom-in-icon').removeClass('active').removeClass('disable');
            zoomLevel = 10;
            _s.zoomIn = false;
            $('#features-list ul').hide();

            ctx.canvas.width = _s.playerWidth;
            ctx.canvas.height = _s.playerHeight;
            _s.redrawImgCount = getSpeed(_s.totalImages);
            setSpinIndicator();
            changeSpinIndicator();
            draw(_s.currentFrame, ctx, _s.playerWidth, _s.playerHeight, true);
        };
        if (window.globalVar.playerType === 'exterior' || window.globalVar.playerType === 'interior') {
            window.addEventListener('resize', reloadPlayer);
        }
        function hideNavbar(){
            $('.ctrls').slideUp(100);
            if ($('#features-list ul li').length) {
                $('#features-list').slideUp(100);
            }
            parent.postMessage(JSON.stringify({"action":"removeCross"}),"*");
        }
        function unhideNavbar() {
            $('.ctrls').slideDown(100);
            if ($('#features-list ul li').length) {
                $('#features-list').slideDown(100);
            }
            parent.postMessage(JSON.stringify({"action":"addCross"}),"*");
        }
        //360 stats enhancement - 29th jan 2018.
    }
    function toggleHotspot(){
        if(_s.showHighlights){
            $('.hotspot').show();
        }else{
            $('.hotspot').hide();
        }
    }
    function logStats(data) {
        var form_data = {
            opens : data.opens || 0,
            trackID: _s.stats.trackID,
            spins: data.spin || 0,
            hid: data.hid,
            featureName: data.featureName,
            source: data.source,
            timeStart: data.timeStart,
            timeEnd : data.timeEnd,
            imageSource : data.src,
            imageId : data.imageId,
            imageType : data.imgType,
            imageStartTime : data.imgTimeStart,
            imageEndTime : data.imgTimeEnd,
            percentCompleted : _s.stats.spins ? 0: data.percentCompleted,
            count : data.count || 0
        };
        //console.log(form_data);
        _s.stats.spins = 0;
        if(!data.count) {
            _s.stats.highlights = [];
        }

        /*$.ajax({
            type: "POST",
            url: "?RUN_TYPE=SAVE_360_STATS_DETAILS&trackID=" + _s.stats.trackID,
            data: form_data,
            success: function (result, status, xhr) {
                //console.log(result);

            },
            error: function (xhr, status, error) {
                //console.log(error);
            }
        });*/
    }

    function getCurDateTime() {
        var d = new Date();
        var dd = d.getDate();
        var mn = d.getMonth();
        var yyyy = d.getFullYear();
        var hh = d.getHours();
        var mm = d.getMinutes();
        var ss = d.getSeconds();

        if (parseInt(mn) < 12) {
            mn++;
        }

        if (dd < 10) {
            dd = "0" + dd;
        }
        if (mn < 10) {
            mn = "0" + mn;
        }
        if (hh < 10) {
            hh = "0" + hh;
        }
        if (mm < 10) {
            mm = "0" + mm;
        }
        if (ss < 10) {
            ss = "0" + ss;
        }

        return yyyy + "-" + mn + "-" + dd + " " + hh + ":" + mm + ":" + ss;
    }
    function getAspectRatio(imgwidth, imgheight) {
        var width = imgwidth || Number(window.globalVar.maxWidth);
        var height = imgheight || Number(window.globalVar.maxHeight);
        var aspectRatio = height / width;
        // console.log("aspectRatio", aspectRatio);
        return aspectRatio;
    }
}(window));
var Player360 = function(options) {
    // return instance if called as a function
    if (!(this instanceof Player360)) {
        return new Player360(options);
    }
    // set default config first and then extend to options
    this.config = this.clone(this.DEFAULTS());
    this.deepmerge(this.config, options);
    console.log(this.config);
};
Player360.prototype.clone = function(src){
    Player360.prototype.deepmerge(null,src)
};
Player360.prototype.deepmerge = function(target, src) {
    var first = src;

    return (function merge(target, src) {
        if (Array.isArray(src)) {
            if (!target || !Array.isArray(target)) {
                target = [];
            }
            else {
                target.length = 0;
            }
            src.forEach(function(e, i) {
                target[i] = merge(null, e);
            });
        }
        else if (typeof src === 'object') {
            if (!target || Array.isArray(target)) {
                target = {};
            }
            Object.keys(src).forEach(function(key) {
                if (typeof src[key] !== 'object' || !src[key] || !this.isPlainObject(src[key])) {
                    target[key] = src[key];
                }
                else if (src[key] != first) {
                    if (!target[key]) {
                        target[key] = merge(null, src[key]);
                    }
                    else {
                        merge(target[key], src[key]);
                    }
                }
            });
        }
        else {
            target = src;
        }

        return target;
    }(target, src));
};
Player360.prototype.getAspectRatio = function (imgwidth, imgheight) {
    var width = imgwidth || globalVar.maxWidth;
    var height = imgheight || globalVar.maxHeight;
    return  height / width;
};
Player360.prototype.elements = function(){
    return {
        wrapper: $('#wrapper'),
    }
};
Player360.prototype.DEFAULTS = function(){
    return {
        carImgs : [],
        carsData : [],
        hsData : [],
        lastX : 0,
        direction : "",
        currentFrame : 0,
        runAnim : false,
        imgCount : 0,
        totalImages : globalVar.totalImages,
        aspectRatio : this.getAspectRatio(1200, 675),
        playerWidth : parseFloat(this.elements().wrapper.width()),
        playerHeight : this.playerWidth * this.aspectRatio,
        maxImageWidth : globalVar.maxWidth,
        maxImageHeight : this.maxImageWidth * this.aspectRatio,
        redrawImgCount :  3,
        resetRedrawCount : 0,
        requiredImgCount : 216,
        zoomIn : false,
        spinCompleted : 0,
        stats : {
            trackID : globalVar.trackID || "abc123456",
            spins : 0,
            highlights : [],
            prevImgStartTime : getCurDateTime(),
            seenImages : [],
            count : 0,
            prevImg : '',
        },
        showHighlights : true,
        swipeThreshold : (globalVar.swipeThreshold && !isNaN(Number(globalVar.swipeThreshold)) && Number(globalVar.swipeThreshold))? Number(globalVar.swipeThreshold): 0.6,
        swipeTotalImages :  (globalVar.totalImages && !isNaN(Number(globalVar.totalImages)) && Number(globalVar.totalImages))? Number(globalVar.totalImages): 0,
        baseImgWidth : globalVar.baseImgWidth,
        baseImgHeight : globalVar.baseImgHeight,
    }
};
Player360.prototype.isPlainObject = function(obj) {
    // Basic check for Type object that's not null
    if (typeof obj === 'object' && obj !== null) {
        // If Object.getPrototypeOf supported, use it
        if (typeof Object.getPrototypeOf === 'function') {
            var proto = Object.getPrototypeOf(obj);
            return proto === Object.prototype || proto === null;
        }

        // Otherwise, use internal class
        // This should be reliable as if getPrototypeOf not supported, is pre-ES5
        return Object.prototype.toString.call(obj) === '[object Object]';
    }

    // Not an object
    return false;
};

(function () {
    //var player = new Player360();
})();