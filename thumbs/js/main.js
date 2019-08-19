/** @namespace 360 Player */
/** @namespace EventListeners */
/** @namespace URL Parameters
 *  @description URL Parameters are  used to extend the features and functionality of the player and are not mandatory, any parameter can be used only to activate respective feature otherwise defaults will be considered*/
/**
 * @summary We are adding forEveryElement property to existing element object to use it even for multiple elements select
 * @example document.querySelectorAll('.className').forEveryElement(function(elem){
 *     iterateds through all elements of query
 * })
 * @param {function} done - Callback function invokes for every iteration
 * @method forEveryElement*/
Object.defineProperty(Object.prototype, 'forEveryElement', {
    value: function (done) {
        if (this.length && this.length > 0) {
            for (var i = 0; i < this.length; i++) {
                done(this[i]);
            }
        }
    },
    writable: false,
    configurable: true,
    enumerable: false
});
/* === custom properties of object ends here === */

/**
 * @method tweenLoad
 * @param {tweenLoadCallback} callback - Callback function invokes for every element of array in {@link https://en.wikipedia.org/wiki/Inbetweening tweenign} pattern
 * @summary This is an extension of array.prototype used to call the array elements using {@link https://en.wikipedia.org/wiki/Inbetweening Inbetweenign} loading algorithm  */
Array.prototype.tweenLoad = function (callback) {
    var start = 0, end = this.length - 1;
    callback(this[start], start);
    callback(this[end], end);
    var self = this;
    sendMid.call(null, [start, end]);

    function sendMid() {
        var args = [];
        for (var i = 0; i < sendMid.arguments.length; i++) {
            var start = sendMid.arguments[i][0];
            var end = sendMid.arguments[i][1];
            if ((end - start) > 1) {
                if ((start + end) % 2 === 0) {
                    var mid = (start + end) / 2;
                    callback(self[mid], mid);
                    args.push([start, mid]);
                    args.push([mid, end]);
                } else {
                    var mid1 = Math.floor((start + end) / 2);
                    var mid2 = Math.ceil((start + end) / 2);
                    callback(self[mid1], mid1);
                    callback(self[mid2], mid2);
                    args.push([start, mid1]);
                    args.push([mid2, end]);
                }
            } else {
                return start;
            }
        }
        return sendMid.apply(null, args);
    }
};

(function (window) {
    /**
     * @typedef {Object}
     * @constant _s
     * @property {int} playerWidth - Width of the player we use globally and should not exceed
     * @property {int} playerHeight - Height of the player we use globally
     * @property {float} aspectRatio - Aspect ratio of the player and it is very important to maintain the aspect ratio of player while resizing the player
     * @property {Object} stats - Object containing all properties for logging stats
     * @summary This is the object containing all configurations of player */
    var _s = {};
    _s.hotspotsData = [];
    _s.lastX = 0;
    _s.direction = "";
    _s.currentFrame = 0;
    _s.runAnim = false;
    _s.imgCount = 0;
    _s.totalImages = window.globalVar.totalImages;
    _s.aspectRatio = getAspectRatio();
    _s.playerWidth = parseFloat($('#wrapper').width());
    _s.playerHeight = _s.playerWidth * _s.aspectRatio;
    /**
     * @memberOf URL Parameters
     * @name player_width
     * @summary Maximum width of the player allowed. Current default value is 1200 and can be modified in player_360_settings.php
     * @example <-- 360 player url -->?player_width=1200 //specify the maximum needed width of the player*/
    _s.maxImageWidth = Number(window.globalVar.maxWidth);
    _s.maxImageHeight = _s.maxImageWidth * _s.aspectRatio;
    /**
     * @memberOf URL Parameters
     * @name hide_buttons
     * @summary Toggle the display of controls and buttons on player for maximum player visibility. This feature is implemented for emebedding the 360 player in android and ios applications without feature buttons on it
     * @example <-- 360 player url -->?hide_buttons=1 // 1 for enabling the feature i.e. Hiding the buttons on player
     * <-- 360 player url -->?hide_buttons=0 // 0 or no parameter disables the feature i.e. Unhides the buttons on player*/
    _s.hideNavBar = !isEmpty(window.globalVar.hideNavBar);
    _s.maxZoomLevel = 40;
    _s.redrawImgCount = 3;
    _s.resetRedrawCount = 0;
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
    _s.playerAnimation = null;
    _s.showHighlights = true;
    _s.swipeThreshold = (window.globalVar.swipeThreshold && !isNaN(Number(window.globalVar.swipeThreshold)) && Number(window.globalVar.swipeThreshold)) ? Number(window.globalVar.swipeThreshold) : 0.6;
    _s.swipeTotalImages = (window.globalVar.totalImages && !isNaN(Number(window.globalVar.totalImages)) && Number(window.globalVar.totalImages)) ? Number(window.globalVar.totalImages) : 0;
    _s.baseImgWidth = window.globalVar.baseImgWidth;
    _s.baseImgHeight = window.globalVar.baseImgHeight;

    /** @memberOf URL Parameters
     * @summary Toggle the functionality of Feature thumbnails slider on 360 Player, Allowed values are 0 and 1
     * @name thumbs_player
     * @see initThumbsPlayer
     * @example <-- 360 player url -->?thumbs_player=1 // 1 for enabling the feature i.e. Generating and displaying the thumbnails slider on the player
     * <-- 360 player url -->?thumbs_player=0 // 0 or no parameter disables the feature i.e. No feathure thumbnails slider is displayed on the player. Default feature button will be displayed*/
    _s.isThumbsPlayer = !isEmpty(window.globalVar.isThumbsPlayer);

    /** @memberOf URL Parameters
     * @summary Toggles the position of feature thumbnails to below the player and on the player.<br>
     * <b>Note:</b> This feature is ignored without {@linkcode #thumbs_player thumbs_player} feature enabled and this feature also effects the aspect ratio of the player
     * @name thumbs_out
     * @example <-- 360 player url -->?thumbs_player=1&thumbs_out=1 // 1 enables the feature i.e Pushes the thumbnail slider to the below the player.
     * <-- 360 player url -->?thumbs_player=1&thumbs_out=0 // 0 or no parameter disables the feature i.e. Feature thumbnail slider will be displayed on the player */
    _s.isThumbsOut = !isEmpty(window.globalVar.isThumbsOut);

    /** @memberOf URL Parameters
     * @summary Toggles the automatic spinning of player using mobile device gyroscope data<br>
     * <b>Note</b> This feature is completely subjected to the availability of gyroscope api in mobile devices
     * @name gyroscope_spin
     * @example <-- 360 player url -->?gyroscope_spin=1 // 1 enables the feature i.e. Spins the player according to gyroscope data
     * <-- 360 player url -->?gyroscope_spin=0 // 0 or no param disables the feature i.e. Gyroscope data of device is ignored */
    _s.isGyroscope = !isEmpty(window.globalVar.isGyroscope);

    $('#wrapper').height(_s.playerHeight);


    /** @memberof EventListeners
     * @summary Adding event listeners to control buttons of player
     * @name Control buttons event listeners*/
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
    $('#hotspots-icon').on('click', function () {
        closeShareList();
        _s.showHighlights = !_s.showHighlights;
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
    $('#fullscreen-icon').on("click touch", function (e) {
        var elem = document.body;
        if (!document.fullscreenElement) {
            elem.requestFullscreen();
            $('#hotspots-div, #wrapper').css('max-width', "100%");
            $('#hotspots-div, #wrapper').css('max-height', "100%");
            $('#fullscreen-icon').addClass('active');
            $('#fullscreen-icon img').attr({"src": "./../img/fullscreen-close.svg"});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                $('#hotspots-div, #wrapper').css('max-width', _s.maxImageWidth + "px");
                $('#hotspots-div, #wrapper').css('max-height', _s.maxImageHeight + "px");
                $('#fullscreen-icon').removeClass('active');
                $('#fullscreen-icon img').attr({"src": "./../img/fullscreen.svg"});
            }
        }
    });
    document.addEventListener("fullscreenchange", fullscreenChanged, false);
    document.addEventListener("MSFullscreenChange", fullscreenChanged, false);
    document.addEventListener("mozfullscreenchange", fullscreenChanged, false);
    document.addEventListener("webkitfullscreenchange", fullscreenChanged, false);
    document.addEventListener("webkitfullscreenchange", fullscreenChanged, false);

    /**
     * @method closeShareList
     * @summary Closing the sharing icons expanded list */
    function closeShareList() {
        $('#share-icon').removeClass('active');
        $('#share-list').hide();
    }

    /**
     * @method closeFullscreen
     * @summary Closing fullscreen of the player*/
    function closeFullscreen() {
        if (document.fullscreenElement && document.exitFullscreen) {
            document.exitFullscreen();
            $('#hotspots-div, #wrapper').css('max-width', _s.maxImageWidth + "px");
            $('#hotspots-div, #wrapper').css('max-height', _s.maxImageHeight + "px");
            $('#fullscreen-icon').removeClass('active');
            $('#fullscreen-icon img').attr({"src": "./../img/fullscreen.svg"});
        }
    }

    if (document.fullscreenEnabled) {
        $('#fullscreen-icon').show();
    }

    /**
     * @method fullscreenChanged
     * @summary Trigger this function to change the fullscreen icon and size of player when fullscreen of the player changes*/
    function fullscreenChanged() {
        if (document.fullscreenElement) {
            $('#fullscreen-icon').addClass('active');
            $('#hotspots-div, #wrapper').css('max-width', "100%");
            $('#hotspots-div, #wrapper').css('max-height', "100%");
            $('#fullscreen-icon img').attr({"src": "./../img/fullscreen-close.svg"});
        } else {
            $('#fullscreen-icon').removeClass('active');
            $('#hotspots-div, #wrapper').css('max-width', _s.maxImageWidth + "px");
            $('#hotspots-div, #wrapper').css('max-height', _s.maxImageHeight + "px");
            $('#fullscreen-icon img').attr({"src": "./../img/fullscreen.svg"});
        }
    }

    /**
     * @method isMobile
     * @summary Use this method when you need to check whether device is mobile or not
     * @return {boolean} true if opened device is mobile */
    function isMobile() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        return (/android/i.test(userAgent)) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)
    }

    if (isMobile()) {
        $('#circle-indicator').addClass('mobile');
        $('.ctrls').addClass('mobile');
    }
    if (window.globalVar.nextPlayerType === 'interior') {
        $("#int-player-icon").show();
    } else if (window.globalVar.nextPlayerType === 'interior-pano') {
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
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var loadedImagesCount = 0;
    var wrapper = document.getElementById('wrapper');
    wrapper.style.backgroundImage = "url('" + window.firstLoadImg + "')";
    wrapper.style.backgroundImage = "url('" + window.firstLoadImg + "')";
    wrapper.style.backgroundSize = "cover";
    var fi = new Image();
    fi.onload = function () {
        setPlayerSize(this.width, this.height);
    };
    fi.src = window.firstLoadImg;

    var _dataLength = 0;
    var _loadedImages = [];
    var _loadedHighResImages = [];
    var _loadedHighResImagesSample = [];
    var _rawData = {allCars: []};


    function loadedCars(cars) {
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
            /**
             * @callback tweenLoadCallback
             * @param {Object} img - Image element from array
             * @param {int} index - Index of the element received
             * @summary With the frame returned a DOM Image element is created and updated the _loadedImages object */
            var el = document.createElement('img');
            // Avoid early reflows as images load without sizes. Wait for onload.
            el.onload = onload;
            el.src = img.src;
            _loadedImages[index] = el;
        });
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', window.getDataUrl, true);
    xhr.onload = function (e) {
        if (this.status == 200) {
            _rawData = JSON.parse(this.response);
            _dataLength = _rawData.allCars.length;
            loadedCars(_rawData.allCars);
        }
    };
    xhr.send();

    function getData(done) {
        var getDataInterval = setInterval(function () {
            if (_loadedImages.length > 0 && _rawData.allCars.length > 0) {
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
            el.src = img.highResSrc ? img.highResSrc : img.src;
            _loadedHighResImages.push(el);
        });
        done(_loadedHighResImages);
    }

    function assignLoadedHighImage(lowResImage, highResImages) {
        var assignDataInterval = setInterval(function () {
            var assigned = 0;
            for (var i = 0; i < loadedImages.length; i++) {
                if (loadedHighResImages[i].complete) {
                    assigned++;
                    loadedImages[i] = loadedHighResImages[i];
                    //console.log(loadedImages[i].src,i);
                }
            }
            if (assigned === loadedImages.length) {
                clearInterval(assignDataInterval);
            }
        }, 200);
    }

    function imageLoaded(loadedCount) {
        _s.redrawImgCount = getSpeed(loadedCount);
        _s.redrawGyroImgCount = getGyroSpeed(loadedCount);
        setSpinIndicator(loadedCount);
    }

    $('#loading-div').fadeIn();

    /*=== function to get spee dof rotation based on images loaded ===*/
    
    function getSpeed(totalCount) {
        var speed = 3;
        //var speed = 0;
        if (_s.swipeTotalImages > 0) {
            var touchDistance = Math.floor((_s.swipeThreshold * _s.playerWidth));
            speed = Math.floor(touchDistance / totalCount);
            speed = speed > 75 ? 75 : speed;
        }
        return speed;
    }

    function getGyroSpeed(totalCount) {
        var speed;
        var touchDistance = 360;
        speed = Math.floor(touchDistance / totalCount);
        speed = speed > 2 ? 2 : (speed <= 1 ? 1 : speed);
        return speed;
    }

    if (isMobile() && _s.isThumbsPlayer) {
        window.addEventListener('orientationchange', function () {
            initThumbsPlayer();
        })
    }

    /** @method initThumbsPlayer
     * @summary This method modifies the player controls and dimensions corresponds to feature thumbnail slider*/
    function initThumbsPlayer() {
        if (isMobile() && !isEmpty(window.globalVar.isThumbsOut)) {
            _s.isThumbsOut = (window.orientation == '0' || window.orientation == '180');
        }
        if (_s.isThumbsOut) {
            document.body.classList.remove('centered');
            document.getElementById('wrapper').classList.add('thumbs-out-player');
            document.getElementById('wrapper').classList.remove('thumbs-inline-player');
        } else {
            document.body.classList.add('centered');
            document.getElementById('wrapper').classList.remove('thumbs-out-player');
            document.getElementById('wrapper').classList.add('thumbs-inline-player');
        }
        document.getElementById('features-list').style.display = "none";
        if (_s.hotspotsData.length) {
            document.getElementById('feature-thumbs-container').style.display = "block"
        }
        if(_s.isThumbsOut){
            var ctrlsLeft = $('<ul>')[0];
            ctrlsLeft.appendChild($('#ext-player-icon').clone(true)[0]);
            ctrlsLeft.appendChild($('#int-player-icon').clone(true)[0]);
            ctrlsLeft.appendChild($('#pano-player-icon').clone(true)[0]);
            ctrlsLeft.appendChild($('#zoom-in-icon').clone(true)[0]);
            ctrlsLeft.appendChild($('#zoom-out-icon').clone(true)[0]);
            ctrlsLeft.appendChild($('#hotspots-icon').clone(true)[0]);
            var ctrlsRight = $('<ul>')[0];
            ctrlsRight.appendChild($('#facebook-icon').clone(true)[0]);
            ctrlsRight.appendChild($('#twitter-icon').clone(true)[0]);
            ctrlsRight.appendChild($('#fullscreen-icon').clone(true)[0]);
            $('.ctrls').remove();
            var leftContainerDiv = $('<div>')[0],
                rightContainerDiv = $('<div>')[0];
            leftContainerDiv.classList.add('ctrls');
            leftContainerDiv.classList.add('bottom-right');
            leftContainerDiv.appendChild(ctrlsLeft);
            rightContainerDiv.classList.add('ctrls');
            rightContainerDiv.classList.add('bottom-left');
            rightContainerDiv.appendChild(ctrlsRight);
            $('#wrapper').append(leftContainerDiv).append(rightContainerDiv);
            $('.interior-button').removeClass('v-center')
        }else{
            var controlsDiv = $('<div>')[0];
            controlsDiv.classList.add('ctrls');
            var ctrls = $('<ul>')[0];
            ctrls.appendChild($('#ext-player-icon').clone(true)[0]);
            ctrls.appendChild($('#int-player-icon').clone(true)[0]);
            ctrls.appendChild($('#pano-player-icon').clone(true)[0]);
            ctrls.appendChild($('#zoom-in-icon').clone(true)[0]);
            ctrls.appendChild($('#zoom-out-icon').clone(true)[0]);
            ctrls.appendChild($('#hotspots-icon').clone(true)[0]);
            ctrls.appendChild($('#facebook-icon').clone(true)[0]);
            ctrls.appendChild($('#twitter-icon').clone(true)[0]);
            ctrls.appendChild($('#fullscreen-icon').clone(true)[0]);
            $('.ctrls').remove();
            controlsDiv.appendChild(ctrls);
            $('#wrapper').append(controlsDiv);
            $('.interior-button').addClass('v-center')
        }
    }

    /** @method setPlayerSize
     * @param imgWidth {number} - Width of the images loaded
     * @param imgHeight {number} - Height of the images loaded
     * @summary This function is called when first image of the player is loaded with its dimensions, loaded image dimensions are used to build player of same size*/
    function setPlayerSize(imgWidth, imgHeight) {

        var $wrapper = $('#wrapper');
        var wrapperWidth = $wrapper.width();
        var otherWidth = 0;
        _s.aspectRatio = getAspectRatio(imgWidth, imgHeight);
        _s.maxImageHeight = _s.aspectRatio * _s.maxImageWidth;
        parent.postMessage(JSON.stringify({"aspectRation": _s.aspectRatio}), "*");
        if (_s.aspectRatio === 0.5625) {
            $("#ar").addClass('ar-16-9');
        } else if (_s.aspectRatio === 0.75) {
            $("#ar").addClass('ar-4-3');
        } else {
            $("#ar").css('padding-bottom', _s.aspectRatio * 100 + '%');
        }
        var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
        //alert(screen.width);
        /*explicit ipad condition is used because while orientation change ipad innerwidth is not updateding, this condition can be removed if ipad functionality changes*/
        if (isMobile()) {
            if (iOS && iOS[0] === "iPad") {
                $wrapper.css('width', window.outerWidth);
                _s.playerWidth = window.outerWidth;
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
            } else {
                $wrapper.css('width', $(window).innerWidth());
                _s.playerWidth = $(window).innerWidth();
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
            }

        } else {
            $wrapper.css('width', '100%');
            _s.playerWidth = $wrapper.width();
            _s.playerHeight = _s.playerWidth * _s.aspectRatio;
        }
        if (_s.isThumbsOut) {
            if (window.innerHeight < _s.playerHeight * 1.3) {
                _s.playerWidth = window.innerHeight / (_s.aspectRatio * 1.3);
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
                $("#wrapper").width(_s.playerWidth);
            }
        } else {
            if (window.innerHeight < _s.playerHeight) {
                _s.playerWidth = window.innerHeight / _s.aspectRatio;
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
                $("#wrapper").width(_s.playerWidth);
            }
        }
        $wrapper.height(_s.playerHeight);
        if (isMobile()) {
            $wrapper.css('max-width', '100%');
            $wrapper.css('max-height', '100%');
        } else {
            $wrapper.css('max-width', _s.maxImageWidth + 'px');
            $wrapper.css('max-height', _s.maxImageHeight + 'px');
        }
        _s.redrawImgCount = getSpeed(_s.totalImages);
        setSpinIndicator();
        changeSpinIndicator();
        if (thumbsSlider) {
            thumbsSlider.update();
        }
    }

    /** @method drawPlayer
     * @param e {Event} - Gyroscope event obtained from the deviceorientation api
     * @summary To rotate the player based on the gyroscope data provided by the device. This function is executed only when gyroscopic spin is enabled from URL Parameters*/
    function drawPlayer(e) {
        //console.log(e.alpha);
        if (e.alpha) {
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


    //var allfeatures = $.getJSON("?RUN_TYPE=GET_HOT_SPOTS&videoId=" + window.videoId + "&type=" + window.globalVar.playerType + "&all=true&player=true&dataType=json&time=" + Date.now(), function (data) {
    var thumbsSlider;
    var allfeatures = $.getJSON("./features.json", function (data) {

    }).done(function (allfeatures) {
        if (allfeatures.allFeatures.length) {
            var features = document.getElementById('feature-thumbs').innerHTML;
            if (_s.isThumbsPlayer) {
                allfeatures.allFeatures.forEach(function (feature, index) {
                    _s.hotspotsData.push(feature);
                    features += "<div data-fid='" + feature.id + "' class='slide-item'>" +
                        "<img src='" + (feature.src ? feature.src : './img/feature-default.jpg') + "' alt='feature' />" +
                        "<div class='slide-title'>" + feature.featureName + "</div></div>"
                });
                document.getElementById('feature-thumbs').innerHTML = features;
                initThumbsPlayer();
                thumbsSlider = new imageSlider(
                    {
                        "sliderId": 'feature-thumbs',
                        "containerId": "feature-thumbs-container",
                        "nextNav": "next-button",
                        "prevNav": "prev-button",
                        "toggleButtom": "toggle-button"
                    }
                );
                thumbsSlider.on("feature-select", function (id) {
                    var featureId = id;
                    var goToFrame = getGoToFrame(loadedData.allCars, featureId);
                    if (!goToFrame) {
                        var degree = Number(id.split('-')[1]);
                        if (typeof degree == "number") {
                            goToFrame = Math.floor(loadedData.allCars.length * (degree / 360));
                            featureId = null;
                        }
                    }
                    if ($('#modal').is(':visible')) {
                        $("#close-modal").trigger('click');
                    }
                    changeSpinIndicator(goToFrame);
                    runPlayer(_s.currentFrame, goToFrame, ctx, featureId, "1");
                });
            } else {
                $.each(allfeatures.allFeatures, function (i, f) {
                    _s.hotspotsData.push(f);
                    features += "<li data-fid='" + f.id + "'>" + f.featureName + "</li>";
                });
                $("#features-list ul").append(features);
            if (!_s.hideNavBar) {
                $("#features-list").show();
                $('#hotspots-icon').show();
            }
            }
        } else {
            if (_s.isThumbsPlayer) {
                initThumbsPlayer();
            }
            $("#features-list").hide();
            $('#hotspots-icon').hide();
        }

    }).fail(function () {
        console.log("error");
    });

    var loadedData = {};
    //var allCars = [];
    loadedData = {allCars: []};
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
        if (_s.hideNavBar) {
            hideNavbar();
        }else {
            unhideNavbar();
        }
        registerEvents(ctx);
        if (_s.isThumbsPlayer && loadedData.allCars.length >= 4) {
            var features = document.getElementById('feature-thumbs').innerHTML;
            var degrees = [0, 45, 90, 135, 180, 225, 270, 315];
            degrees.forEach(function (degree) {
                features += "<div data-fid='ext-" + degree + "' class='slide-item'>" +
                    "<img src='" + loadedData.allCars[Math.floor(loadedData.allCars.length * (degree / 360))].src + "' alt='feature' />" +
                    "<div class='slide-title'>Exterior " + degree + "<sup>o</sup></div></div>";
            });
            document.getElementById('feature-thumbs').innerHTML = features;
            thumbsSlider.init();
        }
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

    function loadHighResImages() {
        getHighResImages(function (value) {
            loadedHighResImages = value;
            assignLoadedHighImage(loadedImages, loadedHighResImages);
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
        if (window.DeviceMotionEvent) {
            _s.lastAlpha = 0;
            startGyroscopeActivity();
        }
        var wrapper = document.getElementById('wrapper');
        wrapper.style.backgroundImage = "none";
    }

    function loadHl() {
        $("#hotspots-div").children('.hotspot').empty();
        if (loadedData.allCars[_s.currentFrame].hotSpot.length) {
            $.each(loadedData.allCars[_s.currentFrame].hotSpot, function (i, hs) {
                var updatedPos = getCoordinates(hs.left, hs.top);
                drawHotspot(hs, updatedPos.x, updatedPos.y);
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
        if (loadedData.allCars[currentFrame].hotSpot.length) {
            $.each(loadedData.allCars[currentFrame].hotSpot, function (i, hs) {
                var updatedPos = getCoordinates(hs.left, hs.top);
                drawHotspot(hs, updatedPos.x, updatedPos.y);
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
        var redrawCount = isGyro ? _s.redrawGyroImgCount : _s.redrawImgCount;
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

    /** @method registerEvents
     * @param {Object} ctx - Context of the canvas where the player is rendered
     * @summary This function registers events to the all the elements of 360 player once the player renders its first frame*/
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
            if (thumbsSlider && thumbsSlider.config.sliderActive && !_s.isThumbsOut) {
                thumbsSlider.toggleSlider();
            }
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

        /**
         * @summary Evenet Listeners to detect the swipe on player to rotate it
         * @memberOf EventListeners
         * @name Swipe detection on player*/
        $("body").on("mousedown touchstart", "#hotspots-div", function (e) {
            $("#hotspots-div").removeClass("touch_mode_grab")
                .addClass("touch_mode_grabbing");
            $('#features-list ul').hide();
            if ($(e.target).attr('id') !== "hotspots-div") {
                return;
            }
            if (typeof e.pageX !== "undefined" && e.pageX > 0) {
                _s.lastX = e.pageX;
            } else if (typeof e.originalEvent.touches[0].pageX !== "undefined") {
                _s.lastX = e.originalEvent.touches[0].pageX;
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
            stopGyroscopeActivity()
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
            } while (!loadedImages[_s.currentFrame].complete);
            if (prevFrame !== _s.currentFrame) {
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
                startGyroscopeActivity();
            }
        });

        $("#info-box").on('click touch', "#info-close-icon", function (e) {

            $(this).parent().fadeOut();
            $(this).parent().removeClass('displayed');
            //zoomImg(_s.currentFrame, "zoomout");
            //_s.zoomIn = false;
            if (_s.stats.highlights.length) {
                _s.stats.highlights[0].timeEnd = getCurDateTime();
                logStats(_s.stats.highlights[0]);
            }
            if (_s.isThumbsPlayer && !_s.isThumbsOut) {
                $('#feature-thumbs-container').fadeIn(100);
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
                zoomImg(_s.currentFrame, "zoomout");
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
            //zoomImg(_s.currentFrame, "zoomout");
            //_s.zoomIn = false;
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
            //zoomImg(_s.currentFrame, "zoomout");
            //_s.zoomIn = false;
            $("#close-modal").trigger('click');

        });

        $('#zoom-in-icon').on("click touch", function (e) {
            if (zoomLevel < _s.maxZoomLevel) {
                zoomLevel += 2;
                zoomImg(_s.currentFrame, "zoomin");
                _s.zoomIn = true;
                if (thumbsSlider && thumbsSlider.config.sliderActive && !_s.isThumbsOut) {
                    thumbsSlider.toggleSlider();
                }
            }
        });

        $('#zoom-out-icon').on("click touch", function (e) {
            if (zoomLevel > 10) {
                zoomLevel -= 2;
                if (zoomLevel === 10) {
                    zoomImg(_s.currentFrame, "zoomout");
                    _s.zoomIn = false;
                    if (_s.stats.highlights.length) {
                        _s.stats.highlights[0].timeEnd = getCurDateTime();
                        logStats(_s.stats.highlights[0]);
                    }
                } else {
                    zoomImg(_s.currentFrame, "zoomstepout");
                }
            }
        });

        function MouseWheelHandler(e) {
            if (e.deltaY < 0) {
                if (zoomLevel < _s.maxZoomLevel) {
                    e.preventDefault();
                    zoomLevel += 2;
                    zoomImg(_s.currentFrame, "zoomin");
                    _s.zoomIn = true;
                    if (thumbsSlider && thumbsSlider.config.sliderActive && !_s.isThumbsOut) {
                        thumbsSlider.toggleSlider();
                    }
                }
            } else if (e.deltaY > 0) {
                if (zoomLevel > 10) {
                    e.preventDefault();
                    zoomLevel -= 2;
                    if (zoomLevel === 10) {
                        zoomImg(_s.currentFrame, "zoomout");
                        if (_s.stats.highlights.length) {
                            _s.stats.highlights[0].timeEnd = getCurDateTime();
                            logStats(_s.stats.highlights[0]);
                        }

                    } else {
                        zoomImg(_s.currentFrame, "zoomstepout");
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
    /** @method setSpinIndicator
     * @param {number} totalImages - Number of total frames loaded in 360 player
     * @summary Sets the circular spin indicator at the corner of the player according to the frames loaded in the player to indicate the position of frame corresponding to the whole player*/
    function setSpinIndicator(totalImages) {
        if (!totalImages) {
            totalImages = _s.totalImages;
        }
        var indicator = document.getElementById('progress-indicator');
        var circumference = 2 * Math.PI * indicator.r.baseVal.value;
        indicator.style.strokeDashoffset = (circumference - circumference / totalImages) + 'px';
    }

    /** @method changeSpinIndicator
     * @param {number} [goto=_s.currentFrame] - Index of the frame to which the spin indicator should rotate (default is currentFrame)
     * @summary Changes the spin indicator position according to the change in frame */
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

    /* ======= gyroscope toggling functions ==== */
    function stopGyroscopeActivity() {
        window.ondeviceorientation = null;
    }
    function startGyroscopeActivity() {
        if(isMobile() && _s.isGyroscope){
            window.ondeviceorientation = drawPlayer;
        }
    }
    /* ======= end of gyroscope toggling functions ==== */
    /**
     * @method goToFeature
     * @summary To run the player till the desired feature is visible, Invoked when you click the hotspot or feature thumbnail
     * @param {Event} e - Clicked event whick invoked this function
     * @param {String} featureId - Id string of the feature currently opened
     * @param {String} navType - Type of navigation to the feature Ex: 'nav-next' | 'nav-prev' */
    function goToFeature(e, featureId, navType) {

        var frame;
        var feature_name;
        var forder = null;
        var feature_id;
        var len = _s.hotspotsData.length;

        for (var i = 0; i < len; i++) {
            if (_s.hotspotsData[i].id === featureId) {
                forder = +_s.hotspotsData[i].forder;
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

        feature_id = _s.hotspotsData[forder].id;
        thumbsSlider.gotoSlide(forder);
        forder = null;
        frame = getGoToFrame(loadedData.allCars, feature_id);
        //console.log(frame);
        setTimeout(function () {
            runPlayer(_s.currentFrame, frame, ctx, feature_id, "3");
        }, 500);
    }

    /**
     * @method getGoToFrame
     * @param {Object} carsData - Array of frames containing Image objects
     * @param {String} featureId - Id of the hotspot to be searched for
     * @return {string} Frame in which the specified hotspot first occurred in the player
     * @summary This function is used to get the frame of player in which the selected feature is first occurred, with the obtained frame we run the player using {@link #runPlayer runPlayer} method */
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

    /**
     * @method displayModalImg
     * @param {Object} $img - Image element containing image source to display over feature*/
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

    /**
     * @method showHotspot
     * @param {event} e - Click event of the hotspot icon
     * @summary Displays the feature information like thumbnail(if any) and description of the feature in an info box, This funcitons zoom the player focusing the hotspot if there is no feature image to show*/
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
                displayInfoBox(hs);
            } else {
                displayInfoBox(hs);
                //zoomLevel += 2;
                //zoomImg(_s.currentFrame, "zoomin", {left: pos.x, top: pos.y});
                //_s.zoomIn = true;
                if (_s.isThumbsPlayer && !_s.isThumbsOut) {
                    $('#feature-thumbs-container').fadeOut(100);
                }
            }
            if (thumbsSlider) {
                thumbsSlider.gotoSlide(_s.hotspotsData.findIndex(function (hotspot) {
                    return hotspot.id == hs.mainId
                }));
            }
        } else {
            $("#info-box").removeClass('displayed');
            $("#info-box").hide();
        }
    }

    /**
     * @method buildInfoBox
     * @summary Building HTML description box for the opened hotspot with the details of hotspot
     * @param {Object} desc - Object containing the details of the hotspot needs to build an Info box
     * @param {Boolean} showImg - If set true an thumbnail of the feature image is displayed inside the info box
     * @return {String} - HTML String of the info box which will be appended to the parent from invoked function
     * */
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

    /**
     * @method displayInfoBox
     * @summary Display the info box with description of the hotspot opened and also with the controls to navigate through the next and previous features
     * @param {Object} hs - Hotspot Object with all the properties needed for the hotspot */
    function displayInfoBox(hs) {
        var $infoBox = $("#info-box");
        var desc = getFeatureDesc(hs.spotName);
        var info = buildInfoBox(desc, false);
        $infoBox.html(info);
        $infoBox.addClass('displayed');
        $infoBox.show();
    }

    /** @method getFeatureDesc
     * @summary Get particular hotspot description, thumbnail and id based on the name of hotpsot given
     * @param {string} spotName - Name of the hotspot whose description needs to be found*/
    function getFeatureDesc(spotName) {
        var desc;
        var thumb;
        var name, id;
        if (_s.hotspotsData.length) {
            $.each(_s.hotspotsData, function (i, d) {
                if (d.spotName === spotName) {
                    desc = d.description;
                    thumb = d.src;
                    name = d.featureName;
                    id = d.id;
                }
            });
        }
        return {
            desc: desc,
            thumb: thumb,
            name: name,
            id: id
        };
    }

    /**
     * @method drawHotspot
     * @summary Drawing particular hotspot on the frame given, by calculating the correct position of hotspot respective to the player
     * @param {Object} hs - Hotspot Object with all the properties needed for the hotspot
     * @param {number} left - left position of hotspot
     * @param {number} top - top position of hotspot
     * */
    function drawHotspot(hs, left, top) {
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

    /**
     * @method getCoordinates
     * @summary Scaling the coordinates of hotspot given to the current size of player
     * @param {number} x - x-coordinate or left position of the hotspot given
     * @param {number} y - y-coordinate or top position of the hotspot given
     * @return {Object} Object of scaled position of hotspot respect to the rendered player in {x : scaled-left-position, y: scaled-top-position}*/
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

    /**
     * @method findHotspot
     * @param {string} mainId - Id string of the hotspot need to be found
     * @param {number} currentFrame - frame index in which hotspot needs to be found (current frame)
     * @summary Iterates through all the hotspots in current frame and returns the found hotspot or false if nothing found
     * @returns {(Object | false)} Hotspot found on the currentframe or false if nothing found*/
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

    /**
     * @method runPlayer
     * @param {number} startFrame - Frame to start roating from (Current frame)
     * @param {number} endFrame - Frame till where the player should rotate
     * @param {Object} ctx - context of the canvas to draw the frames of player while rotating
     * @param {string} [featureId] - Id of the hotspot if any to be focused at the end of player
     * @param {number} menu - source of the invoked variable for logging stats
     * @summary Rotates the player from current frame to the required frame and zooms if any feature is specified */
    function runPlayer(startFrame, endFrame, ctx, featureId, menu) {
        $("#info-box").removeClass('displayed');
        $("#info-box").hide();
        i = startFrame;
        var total = loadedData.allCars.length,
            dist = Math.abs(startFrame - endFrame),
            outerDist = total - dist,
            isForward = endFrame < startFrame ^ dist < outerDist; //finding to rotate player in forward or backward direction where 1 is forward and 0 is backward
        clearInterval(_s.playerAnimation);
        _s.playerAnimation = setInterval(function () {
            window.ondeviceorientation = null;
            _s.runAnim = true;
            changeSpinIndicator(i);
            _s.currentFrame = i;
            draw(i, ctx, _s.playerWidth, _s.playerHeight);
            _s.runAnim = false;

            if (i === endFrame) {
                clearInterval(_s.playerAnimation);
                _s.currentFrame = i;
                var hotspot = loadedData.allCars[_s.currentFrame].hotSpot;
                if (hotspot.length) {
                    $.each(hotspot, function (index, hs) {
                        if (hs.mainId === featureId) {
                            var pos = getCoordinates(hs.left, hs.top);
                            /*=== added for the change of T476 ====*/
                            var desc = getFeatureDesc(hs.spotName);
                            if (desc.thumb) {
                                var $img = $('<img/>');
                                $img.attr('src', desc.thumb);
                                displayModalImg($img);
                                displayInfoBox(hs);
                            } else {
                                displayInfoBox(hs);
                                if (_s.isThumbsPlayer && !_s.isThumbsOut) {
                                    $('#feature-thumbs-container').fadeOut(100);
                                }
                                //zoomLevel += 2;
                                //zoomImg(_s.currentFrame, "zoomin", {left: pos.x, top: pos.y});
                                //_s.zoomIn = true;

                            }
                            /*=== added for the change of T476 ====*/
                            var data = {}; //360 stats.
                            data.hid = hs.mainId; //360 stats.
                            data.featureName = hs.featureName;
                            data.source = menu; //360 stats.
                            data.timeStart = getCurDateTime();
                            data.timeEnd = getCurDateTime();

                            _s.stats.highlights[0] = data;
                            //_s.zoomIn = true;
                            //zoomLevel += 2;
                            //zoomImg(_s.currentFrame, "zoomin", {left: pos.x, top: pos.y});
                        }
                    });
                } else {
                    //console.log("no hotspot");
                }
            }
            if (isForward) {
                if (++i === total) {
                    i = 0;
                }
            } else {
                if (--i === -1) {
                    i = (total - 1);
                }
            }
        }, 40);
    }

    /** @typedef {string} zoomAction
     * @property {string} zoomin - zooms in the frame by one level and where max is _s.maxZoomLevel and 2 units of increment or decrement is considered as one level
     * @property {string} zoomstepout - zooms out the frame by one level
     * @property {string} zoomout - zooms out completely
     * @summary Action to be specified while zooming the image */
    /**
     * @method zoomImg
     * @param {zoomAction} action - Zoom action to be performed
     * @param {Object} pos - Position to be focused while zooming a frame. Should contain ({left: left-distance, top:top-distance})
     * @param {number} frame - Index of the frame to be zoomed
     * @summary zooms the current displaying frame upto 300% of visibility*/
    function zoomImg(frame, action, pos) {
        closeShareList();
        //alert('done');
        var img = loadedZoomImages[frame];
        if (!img) {
            img = loadedImages[frame];
            if (!loadedZoomImages[frame] && loadedData.allCars[frame].highResSrc) {
                loadedZoomImages[frame] = new Image();
                loadedZoomImages[frame].onload = function () {
                    $('#zoom-div img').attr("src", this.src);
                };
                loadedZoomImages[frame].src = loadedData.allCars[frame].highResSrc;
            }
        }
        if (img) {
            if (zoomLevel === 12 && action === 'zoomin') {
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
            if ((action === 'zoomin' || action === 'zoomstepout') && zoomLevel >= 10 && zoomLevel <= _s.maxZoomLevel) {
                stopGyroscopeActivity();
                $('#circle-indicator').fadeOut();
                var e = $('#zoom-div');
                var eimg = $(".item");
                var center = _s.playerWidth / 2;
                var middle = _s.playerHeight / 2;

                var zoomedImgWidth = _s.playerWidth * zoomLevel / 10;
                var zoomedImgHeight = _s.playerHeight * zoomLevel / 10;
                var zoomSize = zoomedImgWidth / _s.playerWidth;
                var aHeight = zoomedImgHeight - _s.playerHeight;
                var aWidth = zoomedImgWidth - _s.playerWidth;
                var left = -aWidth / 2 + 'px';
                var top = -aHeight / 2 + 'px';
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
                if ($('#features-list ul li').length) {
                    $('#features-list').fadeOut();
                }
                $("#zoom-div img").stop();
                $("#zoom-div img").animate({width: zoomLevel * 10 + '%', left: left, top: top});
                $('#zoom-out-icon').removeClass('disable');
                $('#zoom-in-icon').removeClass('disable');
                if (zoomLevel === _s.maxZoomLevel) {
                    $('#zoom-in-icon').addClass('disable');
                } else if (zoomLevel === 10) {
                    $('#zoom-out-icon').addClass('disable');
                }
                var imgId = $("#zoom-div img").attr('id');

            } else if (action === "zoomout") {
                startGyroscopeActivity();
                $('#circle-indicator').fadeIn();
                if ($('#features-list ul li').length && !_s.hideNavBar) {
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

    /**
     * @memberof EventListeners
     * @summary Adding eventlisteners for panning functionality of zoomed frame
     * @name Zoome Image Panning*/
    var isDragging = false;
    var zIndexTop = 1;
    var prevX = 0;
    var prevY = 0;
    $("#zoom-div").on("mousedown touchstart", ".item", function (e) {
        var $this = $(e.target);
        if (typeof e.pageX !== "undefined" && e.pageX > 0) {
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
        if (typeof e.pageX !== "undefined" && e.pageX > 0) {
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
        var pageX = 0, pageY = 0;

        if (typeof e.pageX !== "undefined" && e.pageX > 0) {
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

        var top = $this.position().top + pageY - prevY;
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

    /**
     * @method redrawPlayer
     * @summary This method is invoked whenever we need to redraw the player i.e. while resizing the window or changing the orientation of phone e.t.c,
     * This method calculates the playerWidth and playerHeight based on the available window size and max dimensions allowed and following the aspect ratio
     * @example window.addEventListener('resize', redrawPlayer);*/
    var redrawPlayer = function () {
        var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g);
        /*explicit ipad condition is used because while orientation change ipad innerwidth is not updateding, this condition can be removed if ipad functionality changes*/
        if (isMobile()) {
            if (iOS && iOS[0] === "iPad") {
                $("#wrapper").css('width', window.outerWidth);
                _s.playerWidth = window.outerWidth;
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
            } else {
                $("#wrapper").css('width', $(window).innerWidth());
                _s.playerWidth = $(window).innerWidth();
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
            }

        } else {
            $("#wrapper").css('width', '100%');
            _s.playerWidth = $("#wrapper").width();
            _s.playerHeight = _s.playerWidth * _s.aspectRatio;
        }
        if (_s.isThumbsOut) {
            if (window.innerHeight < _s.playerHeight * 1.3) {
                _s.playerWidth = window.innerHeight / (_s.aspectRatio * 1.3);
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
                $("#wrapper").width(_s.playerWidth);
            }
        } else {
            if (window.innerHeight < _s.playerHeight) {
                _s.playerWidth = window.innerHeight / _s.aspectRatio;
                _s.playerHeight = _s.playerWidth * _s.aspectRatio;
                $("#wrapper").width(_s.playerWidth);
            }
        }
        $("#wrapper").height(_s.playerHeight);
        if ($('#features-list ul li').length) {
            $('#features-list').fadeIn();
        }
        $('#circle-indicator').fadeIn();
        /*if(_s.zoomIn){
            zoomImg(_s.currentFrame, 'zoomout');
        }*/
        $("#zoom-div img").animate(
            {width: '100%', left: '0', top: '0'}, function () {
                $(this).parent().hide();
            });
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
        if (thumbsSlider) {
            thumbsSlider.update();
        }
        draw(_s.currentFrame, ctx, _s.playerWidth, _s.playerHeight, true);
    };
    window.addEventListener('resize', redrawPlayer);

    /**
     * @method hideNavbar
     * @summary This method hides all the elements on player excluding spinner to enhance the visibility of player. This method also sends a post message to parent to remove any elements place on the player */
    function hideNavbar() {
        $('.ctrls').slideUp(100);
        $('.interior-button').slideUp(100);
        if ($('#features-list ul li').length) {
            $('#features-list').slideUp(100);
        }
        if (_s.isThumbsPlayer) {
            if (_s.isThumbsOut) {
                $('.feature-thumbs-wrapper .toggle-button').slideUp(100)
            } else {
                $('#feature-thumbs-container').fadeOut(100);
            }
        }
        parent.postMessage(JSON.stringify({"action": "removeCross"}), "*");
    }

    /**
     * @method unhideNavbar
     * @summary This method unhides all the elements on player to revert back the full functionality of the player and also sends a post message to parent to place back any hidden elements on player*/
    function unhideNavbar() {
        if(!_s.hideNavBar) {
            $('.ctrls').slideDown(100);
            $('.interior-button').slideDown(100);
            if ($('#features-list ul li').length) {
                $('#features-list').slideDown(100);
            }
            if (_s.isThumbsPlayer) {
                if (_s.isThumbsOut) {
                    $('.feature-thumbs-wrapper .toggle-button').slideDown(100)
                } else {
                    $('#feature-thumbs-container').fadeIn(100);
                }
            }
        }
        parent.postMessage(JSON.stringify({"action": "addCross"}), "*");
    }

    //360 stats enhancement - 29th jan 2018.

    /** @method toggleHotspot
     * @summary This function toggles the hotspots visibility based on a flag _s.showHighlights */
    function toggleHotspot() {
        if (_s.showHighlights) {
            $('.hotspot').show();
        } else {
            $('.hotspot').hide();
        }
    }

    /**
     * @method logStats
     * @param {Object} data - Object of data needed for logging stats of player
     * @summary This function is invoked when ever we need to log a stat*/
    function logStats(data) {
        var form_data = {
            opens: data.opens || 0,
            trackID: _s.stats.trackID,
            spins: data.spin || 0,
            hid: data.hid,
            featureName: data.featureName,
            source: data.source,
            timeStart: data.timeStart,
            timeEnd: data.timeEnd,
            imageSource: data.src,
            imageId: data.imageId,
            imageType: data.imgType,
            imageStartTime: data.imgTimeStart,
            imageEndTime: data.imgTimeEnd,
            percentCompleted: _s.stats.spins ? 0 : data.percentCompleted,
            count: data.count || 0
        };
        //console.log(form_data);
        _s.stats.spins = 0;
        if (!data.count) {
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

    /**
     * @method getCurDateTime
     * @summary This function is used to convert date object to local string similat to toLocalString() method
     * @return {string} date in yyyy-mm-dd hh:mm:ss format*/
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

    /**
     * @method getAspectRatio
     * @param {int} [imgwidth] - Width of the image whose aspect ratio needs to be found
     * @param {int} [imgheight] - Height of the image whose aspect ratio needs to be found
     * @return {float} Returns aspect ratio height/width
     * @summary Aspect ratio of image/player is calculated at very beginning of execution and maintained through out the player*/
    function getAspectRatio(imgwidth, imgheight) {
        var width = imgwidth || Number(window.globalVar.maxWidth);
        var height = imgheight || Number(window.globalVar.maxHeight);
        return height / width;
    }

    /**
     * @method isEmpty
     * @param {string} val - value needs to be verified for empty
     * @summary Use this function to check availability of any query parameter
     * @return {boolean} This function returns true if any value is not present or undefined or 0 or negative mostly used to verify query parameter*/
    function isEmpty(val) {
        return (val === undefined || val == null || val == 0 || val.length <= 0);
    }
}(window));
/* ==== code for image slider starts here ==== */
var imageSlider = function (options) {
    if (!(this instanceof imageSlider)) {
        return new imageSlider(options);
    }
    this.config = {
        lastX: 0,
        sliderActive: true,
        isDragging: false,
        childrenCount: 0,
        childPerView: 3,
        maxTranslate: 0
    };
    this.id = options.sliderId;
    this.containerId = options.containerId;
    this.nextNavId = options.nextNav;
    this.prevNavId = options.prevNav;
    this.toggleButtonId = options.toggleButtom;
    this.element = document.getElementById(this.id);
    this.container = document.getElementById(this.containerId);
    this.nextNavElement = document.getElementById(this.nextNavId);
    this.prevNavElement = document.getElementById(this.prevNavId);
    this.toggleButton = document.getElementById(this.toggleButtonId);
    this.featureClicked = this.featureClicked.bind(this);
    this.touchStart = this.touchStart.bind(this);
    this.touchMove = this.touchMove.bind(this);
    this.touchEnd = this.touchEnd.bind(this);
    this.nextSlide = this.nextSlide.bind(this);
    this.prevSlide = this.prevSlide.bind(this);
    this.toggleSlider = this.toggleSlider.bind(this);
    this.gotoSlide = this.gotoSlide.bind(this);
    this.activeSlide = 0;
    this.init();
    return this;
};
imageSlider.prototype.init = function () {
    this.element.style.cursor = "pointer";
    this.config.childrenCount = this.element.children.length;
    this.config.maxTranslate = (this.config.childrenCount - this.config.childPerView) * (this.element.clientWidth / 3);
    if (this.activeSlide === 0) {
        this.prevNavElement.disabled = true;
    } else if (this.activeSlide === (this.config.childrenCount - this.config.childPerView)) {
        this.nextNavElement.disabled = true;
    } else {
        this.prevNavElement.disabled = false;
        this.nextNavElement.disabled = false;
    }
    this.element.style.transform = "translateX(-" + this.activeSlide * this.element.offsetWidth / 3 + "px)";
    this.registerEvents();
};
imageSlider.prototype.registerEvents = function () {
    let self = this;
    this.element.children.forEveryElement(function (elem) {
        elem.addEventListener("click", self.featureClicked);
        elem.addEventListener("touch", self.featureClicked);
    });
    this.container.addEventListener("mousedown", this.touchStart);
    this.container.addEventListener("touchstart", this.touchStart);
    this.container.addEventListener("mousemove", this.touchMove);
    this.container.addEventListener("touchmove", this.touchMove);
    this.container.addEventListener("mouseup", this.touchEnd);
    this.container.addEventListener("mouseleave", this.touchEnd);
    this.container.addEventListener("touchleave", this.touchEnd);
    this.container.addEventListener("touchend", this.touchEnd);
    this.nextNavElement.addEventListener("click", this.nextSlide);
    this.nextNavElement.addEventListener("touch", this.nextSlide);
    this.prevNavElement.addEventListener("click", this.prevSlide);
    this.prevNavElement.addEventListener("touch", this.prevSlide);
    this.toggleButton.addEventListener("click", this.toggleSlider)
};
imageSlider.prototype.touchStart = function (e) {
    //e.preventDefault();
    if (typeof e.pageX !== "undefined" && e.pageX > 0) {
        this.config.lastX = e.pageX;
        this.config.touchStartX = e.clientX;
    } else if (e.touches && typeof e.touches[0].pageX !== "undefined") {
        this.config.lastX = e.touches[0].pageX;
        this.config.touchStartX = e.touches[0].pageX;
    } else if (e.originalEvent && typeof e.originalEvent.touches[0].pageX !== "undefined") {
        this.config.lastX = e.originalEvent.touches[0].pageX;
        this.config.touchStartX = e.originalEvent.touches[0].pageX;
    }
    this.config.isDragging = true;
};
imageSlider.prototype.touchMove = function (e) {
    e.preventDefault();
    var currentX;
    if (typeof e.pageX !== "undefined" && e.pageX > 0) {
        currentX = e.pageX;
    } else if (e.touches && typeof e.touches[0].pageX !== "undefined") {
        currentX = e.touches[0].pageX;
    } else if (typeof e.originalEvent.touches[0].pageX !== "undefined") {
        currentX = e.originalEvent.touches[0].pageX;
    }
    if (this.config.lastX === currentX) {
        return;
    }
    if (!this.config.isDragging) {
        return;
    }
    var transform = this.element.style.transform.replace(/[^0-9\-.,]/g, '').split(',');
    transform[0] = Number(transform[0]) + (currentX - this.config.lastX);
    if (transform[0] > 0) {
        transform[0] = 0;
        this.prevNavElement.disabled = true;
    } else if (Math.abs(transform[0]) > this.config.maxTranslate) {
        transform[0] = -this.config.maxTranslate;
        this.nextNavElement.disabled = true;
    } else {
        this.prevNavElement.disabled = false;
        this.nextNavElement.disabled = false;
    }
    this.activeSlide = Math.floor(Math.abs(transform[0]) / (this.element.clientWidth / this.config.childPerView));
    this.element.style.transform = "translateX(" + transform[0] + "px)";
    this.config.lastX = currentX;
};
imageSlider.prototype.touchEnd = function (e) {
    if (this.config.isDragging) {
        this.config.isDragging = false;
    }
};
imageSlider.prototype.featureClicked = function (e) {
    if (Math.abs(this.config.touchStartX - e.clientX) < 10) {
        this.featureSelectCallback(e.currentTarget.getAttribute('data-fid'));
    }
};
imageSlider.prototype.nextSlide = function () {
    if (this.activeSlide < (this.config.childrenCount - this.config.childPerView)) {
        this.activeSlide++;
        this.update();
    }
};
imageSlider.prototype.prevSlide = function () {
    if (this.activeSlide > 0) {
        this.activeSlide--;
        this.update();
    }
};
imageSlider.prototype.toggleSlider = function () {
    if (this.config.sliderActive) {
        this.container.classList.add('collapse');
        this.toggleButton.classList.remove('active');
        this.nextNavElement.style.display = "none";
        this.prevNavElement.style.display = "none";
    } else {
        this.container.classList.remove('collapse');
        this.toggleButton.classList.add('active');
        this.nextNavElement.style.display = "block";
        this.prevNavElement.style.display = "block";
    }
    this.config.sliderActive = !this.config.sliderActive;
};
imageSlider.prototype.gotoSlide = function (slide) {
    if (slide !== undefined && slide !== -1) {
        this.activeSlide = slide <= (this.config.childrenCount - this.config.childPerView) ? slide : (this.config.childrenCount - this.config.childPerView);
        this.update();
    }
};
imageSlider.prototype.on = function (event, callback) {
    switch (event) {
        case "feature-select":
            this.featureSelectCallback = callback;
            break;
    }
};
imageSlider.prototype.update = function () {
    this.config.maxTranslate = (this.config.childrenCount - this.config.childPerView) * (this.element.clientWidth / 3);
    if (this.activeSlide === 0) {
        this.prevNavElement.disabled = true;
    } else if (this.activeSlide === (this.config.childrenCount - this.config.childPerView)) {
        this.nextNavElement.disabled = true;
    } else {
        this.prevNavElement.disabled = false;
        this.nextNavElement.disabled = false;
    }
    this.element.style.transform = "translateX(-" + this.activeSlide * this.element.offsetWidth / 3 + "px)";
};
/* ==== coed for image slider ends here ==== */
var Player360 = function (options) {
    // return instance if called as a function
    if (!(this instanceof Player360)) {
        return new Player360(options);
    }
    // set default config first and then extend to options
    this.config = this.clone(this.DEFAULTS());
    this.deepmerge(this.config, options);
    console.log(this.config);
};
Player360.prototype.clone = function (src) {
    Player360.prototype.deepmerge(null, src)
};
Player360.prototype.deepmerge = function (target, src) {
    var first = src;
    return (function merge(target, src) {
        if (Array.isArray(src)) {
            if (!target || !Array.isArray(target)) {
                target = [];
            }
            else {
                target.length = 0;
            }
            src.forEach(function (e, i) {
                target[i] = merge(null, e);
            });
        }
        else if (typeof src === 'object') {
            if (!target || Array.isArray(target)) {
                target = {};
            }
            Object.keys(src).forEach(function (key) {
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
    return height / width;
};
Player360.prototype.elements = function () {
    return {
        wrapper: $('#wrapper'),
    }
};
Player360.prototype.DEFAULTS = function () {
    return {
        hotspotsData: [],
        lastX: 0,
        direction: "",
        currentFrame: 0,
        runAnim: false,
        imgCount: 0,
        totalImages: globalVar.totalImages,
        aspectRatio: this.getAspectRatio(1200, 675),
        playerWidth: parseFloat(this.elements().wrapper.width()),
        playerHeight: this.playerWidth * this.aspectRatio,
        maxImageWidth: globalVar.maxWidth,
        maxImageHeight: this.maxImageWidth * this.aspectRatio,
        redrawImgCount: 3,
        resetRedrawCount: 0,
        zoomIn: false,
        spinCompleted: 0,
        stats: {
            trackID: globalVar.trackID || "abc123456",
            spins: 0,
            highlights: [],
            prevImgStartTime: getCurDateTime(),
            seenImages: [],
            count: 0,
            prevImg: '',
        },
        showHighlights: true,
        swipeThreshold: (globalVar.swipeThreshold && !isNaN(Number(globalVar.swipeThreshold)) && Number(globalVar.swipeThreshold)) ? Number(globalVar.swipeThreshold) : 0.6,
        swipeTotalImages: (globalVar.totalImages && !isNaN(Number(globalVar.totalImages)) && Number(globalVar.totalImages)) ? Number(globalVar.totalImages) : 0,
        baseImgWidth: globalVar.baseImgWidth,
        baseImgHeight: globalVar.baseImgHeight,
    }
};
Player360.prototype.isPlainObject = function (obj) {
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