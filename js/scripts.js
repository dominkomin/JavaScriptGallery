var $pageId = 0;

jQuery(document).ready(function() {

    var $smallMoveValue = 15;
    var $bigMoveValue = 90;

    var cubeHashMap = new HashMap();

    function getCubeId($cubeDiv) {
        return "#" + $($cubeDiv).parents().eq(2).attr("id");
    }

    function getCubeAngle($cubeId) {
        var angle = cubeHashMap.get($cubeId);
        if (angle == null) {
            return 0;
        } else {
            return angle;
        }
    }

    $(".overlay-left").hover(function() {
            var $cubeId = getCubeId($(this));
            var $currnetAngle = getCubeAngle($cubeId);
            $currnetAngle -= $smallMoveValue;

            $($cubeId + " ._3dbox").css("transform", "rotateY(" + $currnetAngle + "deg)");
            $(this).css("cursor", "pointer");
            $(this).css("background-image", "url(leftArrow.png)");
        },
        function() {
            var cubeId = getCubeId($(this));
            var $currnetAngle = getCubeAngle(cubeId);
            $(cubeId + " ._3dbox").css("transform", "rotateY(" + $currnetAngle + "deg)");
            $("#selector").css("cursor", "default");
            $(this).css("background-image", "none");
        }
    );

    $(".overlay-left").click(function() {
        var $cubeId = getCubeId($(this));
        var $currnetAngle = getCubeAngle($cubeId);
        $currnetAngle -= $bigMoveValue;
        cubeHashMap.put($cubeId, $currnetAngle);

        $($cubeId + " ._3dbox").css("transform", "rotateY(" + $currnetAngle + "deg)");
    });

    $(".overlay-right, .overlay-rightSmall").hover(function() {
            var $cubeId = getCubeId($(this));
            var $currnetAngle = getCubeAngle($cubeId);
            $currnetAngle += $smallMoveValue;

            $($cubeId + " ._3dbox").css("transform", "rotateY(" + $currnetAngle + "deg)");
            $(this).css("cursor", "pointer");
            $(this).css("background-image", "url(rightArrow.png)");
        },
        function() {
            var cubeId = getCubeId($(this));
            var $currnetAngle = getCubeAngle(cubeId);
            $(cubeId + " ._3dbox").css("transform", "rotateY(" + $currnetAngle + "deg)");
            $("#selector").css("cursor", "default");
            $(this).css("background-image", "none");
        }
    );

    $(".overlay-right, .overlay-rightSmall").click(function() {
        var $cubeId = getCubeId($(this));
        var $currnetAngle = getCubeAngle($cubeId);
        $currnetAngle += $bigMoveValue;
        cubeHashMap.put($cubeId, $currnetAngle);

        $($cubeId + " ._3dbox").css("transform", "rotateY(" + $currnetAngle + "deg)");
    });
    $(function() {
        $(".overlay-middle-image").glisse({
            changeSpeed: 550,
            speed: 500,
            effect: "flipY",
            fullscreen: false
        });
    });

    $(".overlay-middle, .overlay-middleSmall").hover(function() {
            $(this).css("cursor", "pointer");
            $(this).css("background-image", "url(glass3.png)");
        },
        function() {
            $(this).css("background-image", "none");
            $("#selector").css("cursor", "default");
        });

    $(document).ready(function() {
        $("#simple-menu").sidr();
    });

    $("#location").click(function() {
        loadPhotosByCurrentLoaction();
    });

    $("#tagSearch").click(function() {
        populateCubes($("#tagsHolder").val());
    });

    populateCubes();
});

HashMap = function() {
    this._dict = [];
}

HashMap.prototype._get = function(key) {
    for (var i = 0, couplet; couplet === this._dict[i]; i++) {
        if (couplet[0] === key) {
            return couplet;
        }
    }
    return null;
}

HashMap.prototype.put = function(key, value) {
    var couplet = this._get(key);
    if (couplet) {
        couplet[1] = value;
    } else {
        this._dict.push([key, value]);
    }
    return this; 
}

HashMap.prototype.get = function(key) {
    var couplet = this._get(key);
    if (couplet) {
        return couplet[1];
    }
    return null;
}

function populateCubes($tags, $woeId) {
    $pageId = 0;

    var $safeTags = $tags ? $tags : "";
    var $safeVoeId = $woeId ? $woeId : "";

    loadPhotos("#one", true, ++$pageId, $safeVoeId, $safeTags);
    loadPhotos("#two", false, ++$pageId, $safeVoeId, $safeTags);
    loadPhotos("#three", false, ++$pageId, $safeVoeId, $safeTags);
    loadPhotos("#four", false, ++$pageId, $safeVoeId, $safeTags);
    loadPhotos("#five", false, ++$pageId, $safeVoeId, $safeTags);

}

function loadPhotosByCurrentLoaction() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {

            $.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
                'method': "flickr.places.findByLatLon",
                'api_key': "ea680fca2eea5b42b631c94c1601b11a",
                'lat': position.coords.latitude,
                'lon': position.coords.longitude,
                'accuracy': "16",
                'format': "json"
            }, function(data) {
                if (data.places.place.length > 0) {
                    populateCubes("*", data.places.place[0].woeid);
                } else {
                    alert("No images for this location.");
                }
            });
        });
    } else {
        alert("Geo location is not supported by this browser.");
    }
}

function loadPhotos($cubeId, $isBig, $page, $woeId, $tags) {

    // Mention JSONP here
    $.getJSON("https://api.flickr.com/services/rest/?jsoncallback=?", {
        'method': "flickr.photos.search",
        'api_key': "ea680fca2eea5b42b631c94c1601b11a",
        'tags': $tags,
        'page': $page,
        'per_page': "4",
        'woe_id': $woeId,
        'format': "json"
    }, function(data) {
        console.log(data);

        var $bigSmallSelector = $isBig ? "._3dface" : "._3dfaceSmall";

        // jQuery loop
        $.each(data.photos.photo, function(i, photo) {
            var imgUrl = "http://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_n.jpg";

            // want to take randomly every //
            console.log(imgUrl);

            // Pre-cache image see, http://perishablepress.com/a-way-to-preload-images-without-javascript-that-is-so-much-better/

            $("<img />").attr({ 'src': imgUrl, 'data-image-num': i }).load(function() {
                console.log("image cached");
                $($cubeId + " " + $bigSmallSelector).eq(i).css({ 'background': "url(" + imgUrl + ")", 'background-size': "cover", 'background-position': "center", 'background-repeat': "no-repeat" });
                $($cubeId + " .overlay-middle-image").eq(i).attr("data-glisse-big", imgUrl);

            });

        });
    });

}