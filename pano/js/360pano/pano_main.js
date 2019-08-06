//var canvasHeight = window.innerHeight < 540 ? (window.innerHeight) : 540;
/*---- pano stats -----*/
var stats = {};
stats.trackID =  typeof window.panotrackID!=='undefined' ? window.panotrackID:'0';
stats.spin = 0;
stats.highlights = [];
stats.prevImgStartTime = getCurDateTime();
stats.currentPosition = 0;
stats.initialPosition = 0;
stats.rotation = '';
stats.count = 0;
var highlightSource = 1;
var _p = {};
_p.isThumbsPlayer = !isEmpty(window.globalVar.isThumbsPlayer);
_p.isThumbsOut = !isEmpty(window.globalVar.isThumbsOut);
function exteriorPlayer() {
    var carsJson = 'exterior';
    var url = '?video_fk=' + videoFK;
    getUrl = url + "&playerType=" + carsJson;
    location.replace(getUrl);
}
function shareFacebook() {
    e.preventDefault();
    var url = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURI(window.location);
    window.open(url, 'mywin', 'left=355, top=200, width=600, height=368, toolbar=1, resizable=0');
}
function shareTwitter() {
    e.preventDefault();
    var pageTitle = $("title").text();
    var url = "https://twitter.com/intent/tweet?text=" + encodeURI(pageTitle) + "&url=" + encodeURI(window.location);
    window.open(url, 'mywin', 'left=355, top=200, width=600, height=368, toolbar=1, resizable=0');
}
/*--- pano stats ----*/
var highlightIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="list" class="psv-button-svg svg-inline--fa fa-list fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M128 116V76c0-8.837 7.163-16 16-16h352c8.837 0 16 7.163 16 16v40c0 8.837-7.163 16-16 16H144c-8.837 0-16-7.163-16-16zm16 176h352c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H144c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h352c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H144c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zM16 144h64c8.837 0 16-7.163 16-16V64c0-8.837-7.163-16-16-16H16C7.163 48 0 55.163 0 64v64c0 8.837 7.163 16 16 16zm0 160h64c8.837 0 16-7.163 16-16v-64c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v64c0 8.837 7.163 16 16 16zm0 160h64c8.837 0 16-7.163 16-16v-64c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v64c0 8.837 7.163 16 16 16z"></path></svg>';
var fullScreenIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="psv-button-svg"><path fill="#000" d="M100 40H87.1V18.8h-21V6H100zM100 93.2H66V80.3h21.1v-21H100zM34 93.2H0v-34h12.9v21.1h21zM12.9 40H0V6h34v12.9H12.8z"></path></svg>';
var fullScreenCloseIcon = '<?xml version="1.0" encoding="iso-8859-1"?><!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --><svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"viewBox="0 0 469.333 469.333" style="enable-background:new 0 0 469.333 469.333;" xml:space="preserve"><g><g><g><path fill="#fff" d="M160,0h-21.333C132.771,0,128,4.771,128,10.667V128H10.667C4.771,128,0,132.771,0,138.667V160c0,5.896,4.771,10.667,10.667,10.667H160c5.896,0,10.667-4.771,10.667-10.667V10.667C170.667,4.771,165.896,0,160,0z"/><path fill="#fff" d="M458.667,128H341.333V10.667C341.333,4.771,336.563,0,330.667,0h-21.333c-5.896,0-10.667,4.771-10.667,10.667V160c0,5.896,4.771,10.667,10.667,10.667h149.333c5.896,0,10.667-4.771,10.667-10.667v-21.333C469.333,132.771,464.563,128,458.667,128z"/><path fill="#fff" d="M458.667,298.667H309.333c-5.896,0-10.667,4.771-10.667,10.667v149.333c0,5.896,4.771,10.667,10.667,10.667h21.333c5.896,0,10.667-4.771,10.667-10.667V341.333h117.333c5.896,0,10.667-4.771,10.667-10.667v-21.333C469.333,303.437,464.563,298.667,458.667,298.667z"/><path fill="#fff" d="M160,298.667H10.667C4.771,298.667,0,303.437,0,309.333v21.333c0,5.896,4.771,10.667,10.667,10.667H128v117.333c0,5.896,4.771,10.667,10.667,10.667H160c5.896,0,10.667-4.771,10.667-10.667V309.333C170.667,303.437,165.896,298.667,160,298.667z"/></g></g></g></svg>';
var carIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="car" class="psv-button-svg svg-inline--fa fa-car fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="white" d="M499.99 176h-59.87l-16.64-41.6C406.38 91.63 365.57 64 319.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34.37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48H494c5.51 0 10.31-3.75 11.64-9.09l6-24c1.89-7.57-3.84-14.91-11.65-14.91zm-352.06-17.83c7.29-18.22 24.94-30.17 44.57-30.17h127c19.63 0 37.28 11.95 44.57 30.17L384 208H128l19.93-49.83zM96 319.8c-19.2 0-32-12.76-32-31.9S76.8 256 96 256s48 28.71 48 47.85-28.8 15.95-48 15.95zm320 0c-19.2 0-48 3.19-48-15.95S396.8 256 416 256s32 12.76 32 31.9-12.8 31.9-32 31.9z"></path></svg>';
var facebookIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook-f" class="psv-button-svg svg-inline--fa fa-facebook-f fa-w-9" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="white" d="M215.8 85H264V3.6C255.7 2.5 227.1 0 193.8 0 124.3 0 76.7 42.4 76.7 120.3V192H0v91h76.7v229h94V283h73.6l11.7-91h-85.3v-62.7c0-26.3 7.3-44.3 45.1-44.3z"></path></svg>';
var twitterIcon = '<svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="twitter" class="psv-button-svg svg-inline--fa fa-twitter fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="white" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg>';
var bullsEyeIcon = '<svg aria-hidden="true" focusable="false" class="psv-button-svg"\n' +
    'role="img" xmlns="http://www.w3.org/2000/svg" \n' +
    'viewBox="0 0 496 512"><path fill="#FFFFFF" \n' +
    'd="M248 8C111.03 8 0 119.03 0 256s111.03 248 248 248 248-111.03 248-248S384.97 8 248 8zm0 432c-101.69 0-184-82.29-184-184 0-101.69 82.29-184 184-184 101.69 0 184 82.29 184 184 0 101.69-82.29 184-184 184zm0-312c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128-57.31-128-128-128zm0 192c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64-28.71 64-64 64z"></path></svg>';
var renderMarker = function() {
    setPlayerDimensions();
    loadData(function (data) {
        data.markers = getMarkers(data.markers);
        //console.log(window.innerHeight, window.innerWidth);
        var navBarData = [

        ];
        if(data.markers.length){
            navBarData.push(
                {
                    id : 'toggleHighlights',
                    title : 'Toggle Highlights',
                    className: 'psv-button--hover-scale',
                    content : bullsEyeIcon,
                    onClick : toggleHighlights
                });
            if(!window.globalVar.isThumbsPlayer) {
                navBarData.push({
                    id: 'toggleHighlightsButton',
                    title: 'Highlights',
                    className: 'psv-button--hover-scale',
                    content: highlightIcon,
                    onClick: toggleHighlightsList
                });
            }
        }
        navBarData.push(
            'zoom',
            'autorotate',
            'caption',
            'gyroscope'
        );
        if(document.fullscreenEnabled){
            navBarData.push({
                id: 'toggleFullScreenButton',
                title: 'Fullscreen',
                className: 'psv-button--hover-scale',
                content: fullScreenIcon,
                onClick: toggleFullScreen
            });
        }
        var viewer = new PhotoSphereViewer({
            container: 'viewer',
            panorama: data.pano_image,
            markers: data.markers,
            time_anim: false,
            caption: data.caption,
            fishEye: true,
            navbar: navBarData
        });
        viewer.on("ready", function () {
            viewer.getNavbarButton('gyroscope').supported().then(function (supported) {
                if(supported){
                    viewer.startGyroscopeControl();
                }
            });
        });
        if(_p.isThumbsPlayer){
            var features ='';
            data.markers.forEach(function (feature, index) {
                features += "<div data-fid='" + feature.id + "' class='slide-item'>" +
                    "<img src='" + (feature.data.thumbnail ? feature.data.thumbnail : './img/feature-default.jpg') + "' alt='feature' />" +
                    "<div class='slide-title'>" + feature.tooltip + "</div></div>"
            });
            var degrees = [
                {
                    degree : 0,
                    image : './img/0.png'
                },
                {
                    degree : 90,
                    image : './img/90.png'
                },
                {
                    degree : 180,
                    image : './img/180.png'
                },
                {
                    degree : 270,
                    image : './img/270.png'
                }
            ];
            degrees.forEach(function (data) {
                features += "<div data-fid='int-"+data.degree+"' class='slide-item'>" +
                    "<img src='" + data.image + "' alt='feature' />" +
                    "<div class='slide-title'>Interior " + data.degree + "<sup>0</sup></div></div>"
            });
            document.getElementById('feature-thumbs').innerHTML = features;
            if(isMobile() && !isEmpty(window.globalVar.isThumbsOut)){
                _p.isThumbsOut = (window.orientation == '0' || window.orientation == '180');
            }
            if(_p.isThumbsOut) {
                document.body.classList.remove('centered');
                document.getElementById('wrapper').classList.add('thumbs-out-player');
                document.getElementById('wrapper').classList.remove('thumbs-inline-player');
            }else{
                document.body.classList.add('centered');
                document.getElementById('wrapper').classList.remove('thumbs-out-player');
                document.getElementById('wrapper').classList.add('thumbs-inline-player');
            }
            if (data.markers.length) {
                document.getElementById('feature-thumbs-container').style.display = "block"
            }
            var thumbsSlider = new imageSlider(
                {
                    "sliderId": 'feature-thumbs',
                    "containerId": "feature-thumbs-container",
                    "nextNav": "next-button",
                    "prevNav": "prev-button",
                    "toggleButtom": "toggle-button"
                }
            );
            thumbsSlider.on("feature-select", function (id) {
                var isMarkerPresent = data.markers.findIndex(function (marker) {
                    return marker.id == id
                });
                if(isMarkerPresent !== -1) {
                    var marker = viewer.getMarker(id);
                    viewer.gotoMarker(marker, 500);
                    selectedMarker = marker;
                }else{
                    var degree = parseFloat(id.split('-')[1]) * (Math.PI/180);
                    viewer.animate({longitude:degree,latitude:0},500);
                }
            });
        }
        logStats({opens: 1});
        $('.exterior-components').hide();
        $('#viewer').addClass('viewer-style');
        if(data.markers.length){
            $('#hotspots-icon').show();
        }else{
            $('#hotspots-icon').hide();
        }
        function toggleHighlightsList() {
            viewer.toggleMarkersList();
            if($('.psv-markers-list-title').length) {
                $('.psv-markers-list-title')[0].innerText = 'Highlights';
            }
        }
        if (data.markers.length) {
            data.markers.forEach(function (marker) {
                generateHtmlTemplate(marker.data.contentId, marker.tooltip, marker.data.thumbnail, marker.data.description);
            })
        }
        viewer.on('select-marker', function (marker) {
            highlightSource = 2; //for pano-stats
            viewer.gotoMarker(marker, 500);
            if (thumbsSlider && thumbsSlider.config.sliderActive && !_p.isThumbsOut) {
                thumbsSlider.toggleSlider();
            }
            selectedMarker = marker;
        });
        viewer.on('select-marker-list', function (marker) {
            highlightSource = 1; //for pano-stats
            viewer.gotoMarker(marker, 500);
            if (thumbsSlider && thumbsSlider.config.sliderActive && !_p.isThumbsOut) {
                thumbsSlider.toggleSlider();
            }
            selectedMarker = marker;
        });
        viewer.on('goto-marker-done', function (marker) {
            if(_p.isThumbsPlayer && !_p.isThumbsOut){
                $('#feature-thumbs-container').fadeOut(100);
            }
            if (marker.data && marker.data.contentId) {
                if ($('.highlight-viewer.show').length > 0) {
                    closeHighlight();
                }
                $(document.getElementById(marker.data.contentId)).addClass('show');
                $(document.getElementById(marker.data.contentId)).find('.highlight-content-box')[0].style.display = 'block';
                /* for stats */
                var data = {};
                data.hid = marker.id;
                data.featureName = marker.tooltip.content;
                data.source = highlightSource;
                data.timeStart = getCurDateTime();
                if(selectedMarker && selectedMarker.data.thumbnail){

                }
                stats.highlights.push(data);
                /* end for stats */
            }
        });
        viewer.on('position-updated', function (e) {
            watchSpin(e);
        });
        function watchSpin(e){
            if(Math.round(e.longitude*100)/100 === 0.00 || Math.round(e.longitude*100)/100 > 6.25){
                stats.rotation = '';
                return;
            }
            if(stats.rotation==='right'){
                if(e.longitude>stats.currentPosition){
                    stats.currentPosition = e.longitude;
                    if(Math.abs(stats.currentPosition - stats.initialPosition)>=6){
                        //console.log(stats.currentPosition, stats.initialPosition);
                        stats.spin++;
                        logStats(stats);
                    }
                }
            }else if(stats.rotation === 'left'){
                if(e.longitude<stats.currentPosition){
                    stats.currentPosition = e.longitude;
                    if(Math.abs(stats.currentPosition - stats.initialPosition)>=6){
                        //console.log(stats.currentPosition, stats.initialPosition);
                        stats.spin++;
                        logStats(stats);
                    }
                }
            }else{
                if(e.longitude<3){
                    stats.rotation = 'right';
                    stats.initialPosition = 0;
                }else{
                    stats.rotation = 'left';
                    stats.initialPosition = 6.3;
                }
                return;
            }
            //stats.currentPosition = e.longitude;
        }
        viewer.on('panorama-loaded', function () {
            window.setInterval(function () {
                stats.count++;
                logStats({count:stats.count})
            },5000)
        });
        $('.highlight-image-close-button').on('click', function (e) {
            closeHighlight();
        });
        $('.close-highlight-button').on('click', function (e) {
            if($('.highlight-viewer.show .highlight-image').length){
                $('.highlight-viewer.show .highlight-content-box')[0].style.display = 'none';
            }else{
                closeHighlight();
            }
        });
        function closeHighlight() {
            if(_p.isThumbsPlayer && !_p.isThumbsOut){
                $('#feature-thumbs-container').fadeIn(100);
            }
            $('.highlight-viewer.show').removeClass('show');
            if(stats.highlights.length){
                stats.highlights[0].timeEnd = getCurDateTime();
                logStats(stats.highlights[0]);
            }
        }
        $('body').on('click', '.nextHighlight', function() {
            var markerId = this.getAttribute('data-featureid');
            //console.log(markerId);
            var indexVal;
            for(var i=0;i<data.markers.length;i++){
                if(data.markers[i].data.contentId == markerId){
                    indexVal = i;
                    break;
                }
            }
            if(indexVal===data.markers.length-1){
                indexVal = 0;
            }else{
                indexVal = indexVal + 1;
            }
            //console.log(indexVal);
            closeHighlight();
            highlightSource = 3; //for pano-stats
            var marker = viewer.getMarker(data.markers[indexVal].id);
            viewer.gotoMarker(marker, 500);
            selectedMarker = marker;
        });
        $('body').on('click', '.prevHighlight', function() {
            var markerId = this.getAttribute('data-featureid');
            //console.log(markerId);
            var indexVal;
            for(var i=0;i<data.markers.length;i++){
                if(data.markers[i].data.contentId == markerId){
                    indexVal = i;
                    break;
                }
            }
            if(indexVal===0){
                indexVal = data.markers.length-1;
            }else{
                indexVal = indexVal - 1;
            }
            closeHighlight();
            highlightSource = 3; //for pano-stats
            var marker = viewer.getMarker(data.markers[indexVal].id);
            viewer.gotoMarker(marker, 500);
            selectedMarker = marker;
        });
        function toggleHighlights(){
            data.markers.forEach(function (marker) {
                viewer.toggleMarker(marker);
            })
        }
        function toggleFullScreen() {
            var elem = document.body;
            if (!document.fullscreenElement) {
                elem.requestFullscreen();
                $('#wrapper').css({'max-width':"100%","width":"100%",'max-height':"100%","height":"100%"});
                $('[title="Fullscreen"]').find('svg').replaceWith(fullScreenCloseIcon);
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                    $('#wrapper').css('max-width', window.globalVar.maxWidth + "px").css('max-height',window.globalVar.maxHeight + "px");
                    $('[title="Fullscreen"]').find('svg').replaceWith(fullScreenIcon);
                }
            }
            setPlayerDimensions();
        }
        function fullscreenChanged() {
            if (document.fullscreenElement) {
                $('#wrapper').css({'max-width':"100%","width":"100%",'max-height':"100%","height":"100%"});
                $('[title="Fullscreen"]').find('svg').replaceWith(fullScreenCloseIcon);
            } else {
                $('#wrapper').css('max-width', window.globalVar.maxWidth + "px").css('max-height',window.globalVar.maxHeight + "px");
                $('[title="Fullscreen"]').find('svg').replaceWith(fullScreenIcon);
            }
            setPlayerDimensions();
        }
        document.addEventListener("fullscreenchange", fullscreenChanged,false);
        document.addEventListener("MSFullscreenChange", fullscreenChanged,false);
        document.addEventListener("mozfullscreenchange", fullscreenChanged,false);
        document.addEventListener("webkitfullscreenchange", fullscreenChanged,false);
        document.addEventListener("webkitfullscreenchange", fullscreenChanged,false);

    });
};
var setPlayerDimensions = function() {
    var elem = document.getElementById('wrapper');
    var aspectRatio = 0.5625;
    var aspectHeight = getWidth() * aspectRatio;
    if(_p.isThumbsPlayer && _p.isThumbsOut){
        if(window.innerHeight> aspectHeight*1.3) {
            elem.style.height = aspectHeight + 'px';
            elem.style.width = ((window.innerWidth<window.globalVar.maxWidth || document.fullscreenElement || document.webkitFullscreenElement)?window.innerWidth:window.globalVar.maxWidth) + 'px';
        }else{
            elem.style.width = (window.innerHeight / (aspectRatio*1.3)) + 'px';
            elem.style.height = ($(elem).width() * aspectRatio) + 'px';
        }
    }else {
        if (window.innerHeight > aspectHeight) {
            elem.style.height = aspectHeight + 'px';
            elem.style.width = ((window.innerWidth < window.globalVar.maxWidth || document.fullscreenElement || document.webkitFullscreenElement) ? window.innerWidth : window.globalVar.maxWidth) + 'px';
        } else {
            elem.style.width = (window.innerHeight / aspectRatio) + 'px';
            elem.style.height = ($(elem).width() * aspectRatio) + 'px';
        }
    }
    function getWidth() {
        /* ===  added this function to fix window.innerwidth issue in firefox ios and can be removed if issue fixed in ios ===*/
        if(/FxiOS/.test(navigator.userAgent) && /(iPhone|iPad|iPod)/.test(navigator.platform)){
            return window.outerWidth;
        }
        return ((window.innerWidth<window.globalVar.maxWidth || document.fullscreenElement || document.webkitFullscreenElement)?window.innerWidth:window.globalVar.maxWidth)
    }
};
function generateHtmlTemplate(id,title, image, description){
    var element = document.createElement('div');
    $(element).addClass("highlight-viewer");
    element.id = id;
    element.innerHTML = '<div class="highlight-content-box">\n' +
        '            <div class="highlight-content-title">\n' +
        '                <h3>'+title+'&nbsp;&nbsp;&nbsp;</h3>\n' +
        '                <span class=" close-highlight-button" style="font-weight: bold;">\n' +
        '                    <svg style="display: block;width: 20px;height: 20px;" aria-hidden="true" data-prefix="fas" data-icon="times" class="svg-inline--fa fa-times fa-w-11 fa-lg" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512"><path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg>\n' +
        '                </span>\n' +
        '            </div>\n' +
        '            <div class="highlight-content-content">\n' +
        '                <p>'+description+'</p>\n' +
        '                <p class="arrows">\n' +
        '                <i class="fa fa-arrow-circle-left pull-left fa-lg prevHighlight" data-featureId="'+id+'">\n' +
        '<svg style="display: block;width: 20px; height: 20px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-circle-left" class="svg-inline--fa fa-arrow-circle-left fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="white" d="M256 504C119 504 8 393 8 256S119 8 256 8s248 111 248 248-111 248-248 248zm28.9-143.6L209.4 288H392c13.3 0 24-10.7 24-24v-16c0-13.3-10.7-24-24-24H209.4l75.5-72.4c9.7-9.3 9.9-24.8.4-34.3l-11-10.9c-9.4-9.4-24.6-9.4-33.9 0L107.7 239c-9.4 9.4-9.4 24.6 0 33.9l132.7 132.7c9.4 9.4 24.6 9.4 33.9 0l11-10.9c9.5-9.5 9.3-25-.4-34.3z"></path></svg></i>\n' +
        '                <i class="fa fa-arrow-circle-right pull-right fa-lg nextHighlight" data-featureId="'+id+'">\n' +
        '<svg style="display: block;width: 20px; height: 20px;" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-circle-right" class="svg-inline--fa fa-arrow-circle-right fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="white" d="M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zm-28.9 143.6l75.5 72.4H120c-13.3 0-24 10.7-24 24v16c0 13.3 10.7 24 24 24h182.6l-75.5 72.4c-9.7 9.3-9.9 24.8-.4 34.3l11 10.9c9.4 9.4 24.6 9.4 33.9 0L404.3 273c9.4-9.4 9.4-24.6 0-33.9L271.6 106.3c-9.4-9.4-24.6-9.4-33.9 0l-11 10.9c-9.5 9.6-9.3 25.1.4 34.4z"></path></svg></i>\n' +
        '                </p>' +
        '            </div>\n' +
        '        </div>';
    if(image){
        var imageElem = document.createElement('div');
        $(imageElem).addClass('highlight-image');
        imageElem.innerHTML = '<div class="highlight-image-close-button">\n' +
            '                <svg style="display: block;width: 20px;height: 20px;" aria-hidden="true" data-prefix="fas" data-icon="times-circle" class="svg-inline--fa fa-times-circle fa-w-16 fa-2x" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm121.6 313.1c4.7 4.7 4.7 12.3 0 17L338 377.6c-4.7 4.7-12.3 4.7-17 0L256 312l-65.1 65.6c-4.7 4.7-12.3 4.7-17 0L134.4 338c-4.7-4.7-4.7-12.3 0-17l65.6-65-65.6-65.1c-4.7-4.7-4.7-12.3 0-17l39.6-39.6c4.7-4.7 12.3-4.7 17 0l65 65.7 65.1-65.6c4.7-4.7 12.3-4.7 17 0l39.6 39.6c4.7 4.7 4.7 12.3 0 17L312 256l65.6 65.1z"></path></svg>\n' +
            '            &nbsp;Close</div>\n' +
            '            <img src="'+image+'" />';
        $(element).prepend(imageElem);
    }
    $('#viewer')[0].appendChild(element);
}
function loadData(done){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            done(JSON.parse(this.responseText).data);
        }
    };
    xhttp.open("GET", "./data.json", true);
    xhttp.send();
}
function getMarkers(markers){
    var arr = [];
    markers.forEach(function (marker) {
        if(marker.latitude && marker.longitude){
            marker.width = 35;
            marker.height = 35;
            marker.latitude = parseFloat(marker.latitude);
            marker.longitude = parseFloat(marker.longitude);
            marker.data.markerId = marker.id;
            marker.data.contentId = marker.id;
            arr.push(marker);
        }
    });
    return arr;
}
function logStats(data) {
    var form_data = {
        opens : data.opens || 0,
        trackID: stats.trackID,
        spins: data.spin || 0,
        count : data.count,
        hid: data.hid,
        featureName: data.featureName,
        source: data.source,
        timeStart: data.timeStart,
        timeEnd : data.timeEnd,
        imageSource : data.src,
        imageId : data.imageId,
        imageType : 'interior-pano',
        imageStartTime : data.imgTimeStart,
        imageEndTime : data.imgTimeEnd
    };
    //console.log(form_data);
    stats.spins = 0;
    if(!data.count) {
        stats.highlights = [];
    }
    stats.initialPosition = stats.currentPosition;
    stats.rotation = '';

    /*$.ajax({
        type: "POST",
        url: "?RUN_TYPE=SAVE_360_STATS_DETAILS&trackID=" + stats.trackID,
        //url: "http://192.168.1.122/ava/apps/pano_360_preview.php?RUN_TYPE=SAVE_360_STATS_DETAILS&trackID=" + stats.trackID,
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
function isEmpty(val) {
    return (val === undefined || val == null || val == 0 || val.length <= 0) ? true : false;
}
function isMobile() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return (/android/i.test(userAgent)) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)
}
renderMarker();
window.addEventListener("resize", function() {
    setPlayerDimensions();
});
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
    this.registerEvents();
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