(function () {

var VM;

var MediaControlVM = function (hashString) {
    var self = this;

    this.hash = ko.observable(parseHashString(hashString));
    this.hash.subscribe(function () {
        location.hash = compileHashString(self.hash().day, self.hash().index);
    });

    this.currDay = ko.computed(function () {
        if (self.hash().day && self.hash().day > 0 && self.hash().day <= 12) {
            return self.hash().day - 1;
        }
        return -1;
    });
    this.currDayUI = ko.computed(function () {
        return self.currDay() + 1;
    })
    this.currDayUI.subscribe(function (day) {
        self.hash({day: day});
    })
    this.dayDatum = ko.computed(function () {
        if (self.currDay() == undefined || self.currDay() == -1) {
            return {
                description: '',
                media: []
            }
        }
        return DayData[self.currDay()];
    });

    this.currMediaIndex = ko.computed({
        read: function () {
            var index = self.hash().index;
            if (!index && index != 0) return -1;
            if (index >= self.dayDatum().media.length) return -1;

            return index;
        },
        write: function (index) {
            var hashObj = { day: self.currDayUI() };
            if (index < self.dayDatum().media.length) {
                hashObj.index = index;
            }
            self.hash( hashObj );
            return index;
        }
    });

    this.windowView = ko.computed(function () {
        if (self.currDay() != -1 && self.currMediaIndex() != -1) {
            return 'single-media';
        } else if (self.currDay() != -1) {
            return 'day';
        } else {
            return 'closed';
        }
    });

    this.closeWindow = function () {
        self.hash('');
    }

    this.currMedia = ko.computed(function () {
        if (self.currMediaIndex() != -1) {
            return self.dayDatum().media[self.currMediaIndex()];
        } else {
            return {};
        }
    });

    this.imageMedia = ko.computed(function () {
        return self.currMedia().filetype == 'image' ? self.currMedia() : {};
    });
    this.videoMedia = ko.computed(function () {
        return self.currMedia().filetype == 'video' ? self.currMedia() : {};
    });
    this.audioMedia = ko.computed(function () {
        return self.currMedia().filetype == 'audio' ? self.currMedia() : {};
    });


    this.mediaElementVisible = ko.observable(false).extend({ notify: 'always' });
    this.mediaElementVisible.subscribe(function(value) {
        $('video, audio').each(function(i, el) {
            var find = $(el).find('[src]').addBack('[src]');
            if (find.length) {
                var player = $(el).mediaelementplayer({
                    // Do not forget to put a final slash (/)
                    pluginPath: '../jslib/mediaelement/',
                    // this will allow the CDN to use Flash without restrictions
                    // (by default, this is set as `sameDomain`)
                    shimScriptAccess: 'always',

                    success: function(mediaElement, originalNode, instance) {
                        // do things
                    }
                });
            }
        });
    })

    this.dayTitle = ko.computed(function () {
        return 'Day ' + self.currDayUI() + ': ' + self.dayDatum().date;
    })
    this.daySubtitle = ko.computed(function () {
        return self.dayDatum().distance;
    })

    this.backToDay = function($data) { return this.openDay(); }

    this.openDay = function (dayUI) {
        $('.media').removeClass('loaded');
        setTimeout(function () {
            if ((dayUI || dayUI == 0) && !isNaN(dayUI)) {
                self.hash({day: dayUI});
            } else {
                self.hash({day: self.currDayUI()});
            }
            return false;
        }, 200)
    }
    
    this.prevDay = function () {
        self.openDay(self.currDayUI() - 1);
        return false;
    }
    this.nextDay = function () {
        self.openDay(self.currDayUI() + 1);
        return false;
    }
    this.prevDayActive = ko.computed(function () {
        return self.currDay() > 0;
    })
    this.nextDayActive = ko.computed(function () {
        return self.currDay() < 11;
    })

    this.numLoaded = 0;
    this.repeatMasonry = false;

    this.imageLoad = function(data, e) {

        self.numLoaded += 1;
        if (self.numLoaded == self.dayDatum().media.length) {
            self.numLoaded = 0;

            if (self.repeatMasonry) {
                var parent = $('#window.day .media-wrapper').parent();
                var child = $('#window.day .media-wrapper').remove();
                parent.append(child);

                $('.grid').masonry({
                    // options
                    itemSelector: '.grid-item',
                    gutter: 2
                });
            } else {
                $('.grid').masonry({
                    // options
                    itemSelector: '.grid-item',
                    gutter: 2
                });
            }
            $('#window.day .media .media-element').click(function () {
                console.log('click');
                var index = $(this).data('index');
                self.selectMedia(index);
            })
            setTimeout(function () {
                $('.media').addClass('loaded');
            }, 200) // length of css transition

            self.repeatMasonry = true;

        }
    }

    // single image controls

    this.selectMedia = function (index) {
        self.currMediaIndex(index);
    }
    this.prevImage = function () {
        self.selectMedia(self.currMediaIndex() - 1);
        return false;
    }
    this.nextImage = function () {
        self.selectMedia(self.currMediaIndex() + 1);
        return false;
    }
    this.prevImageActive = ko.computed(function () {
        return self.currMediaIndex() > 0;
    })
    this.nextImageActive = ko.computed(function () {
        if (!self.dayDatum()) { return false; }
        return self.currMediaIndex() < self.dayDatum().media.length - 1;
    })

    function parseHashString(hash) {
        var urlParams = {};
        hash.replace(
            new RegExp("([^#=&]+)(=([^&]*))?", "g"),
            function($0, $1, $2, $3) {
                urlParams[$1] = isNaN($3) ? $3 : parseInt($3);
            }
        );
        return urlParams;
    }

    function compileHashString(day, mediaIndex) {
        return day ? day && mediaIndex || mediaIndex == 0 ? 'day=' + day + '&index=' + mediaIndex : 'day=' + day : '';
    }

    $(window).on('hashchange', function (e) {
        self.hash(parseHashString(location.hash));
    })

    $(window).keydown(function (evt) {
        if (self.windowView() == 'single-media') {
            if (evt.keyCode == 37 && self.prevImageActive()) { // left arrow key
                self.prevImage();
            } else if (evt.keyCode == 39 && self.nextImageActive()) { // right arrow key
                self.nextImage();
            }
        } else if (self.windowView() == 'day') {
            if (evt.keyCode == 37 && self.prevDayActive()) { // left arrow key
                self.prevDay();
            } else if (evt.keyCode == 39 && self.nextDayActive()) { // right arrow key
                self.nextDay();
            }
        }

    });

};



$(document).ready(function() {
    var view = $('body');
    VM = new MediaControlVM(location.hash);
    ko.applyBindings(VM, view[0]);

    window.MediaControlVM = VM;
})


})();
