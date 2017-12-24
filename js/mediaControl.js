(function () {

var MediaControlVM = function (hashString) {
    var self = this;

    this.hash = ko.observable(parseHashString(hashString));
    this.hash.subscribe(function () {
        console.log('here');
        location.hash = compileHashString(self.hash().day, self.hash().index);
    });

    this.currDay = ko.computed(function () {
        console.log(self.hash());
        if (self.hash().day && self.hash().day > 0 && self.hash().day <= 12) {
            console.log('returning ' + (self.hash().day - 1));
            return self.hash().day - 1;
        }
        return -1;
    });
    this.currDayUI = ko.computed(function () {
        return self.currDay() + 1;
    })
    this.currDayUI.subscribe(function (day) {
        console.log(day);
        self.hash({day: day});
    })
    this.dayDatum = ko.computed(function () {
        console.log(self.currDay());
        console.log(DayData);
        if (self.currDay() == undefined || self.currDay() == -1) {
            return {
                description: '',
                media: []
            }
        }
        return DayData[self.currDay()];
    });
    console.log(self.hash());
    this.currMediaIndex = ko.computed({
        read: function () {
            var index = self.hash().index;
            if (!index && index != 0) return -1;
            if (index >= self.dayDatum().media.length) return -1;

            console.log(index);
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
            console.log('day and media');
            return 'single-media';
        } else if (self.currDay() != -1) {
            console.log('day');
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
            return { img: '', filename: ''};
        }
    });

    this.dayTitle = ko.computed(function () {
        return 'Day ' + self.currDayUI() + ': ' + self.dayDatum().date;
    })
    this.daySubtitle = ko.computed(function () {
        return self.dayDatum().distance;
    })

    this.backToDay = function($data) { return this.openDay(); }

    this.openDay = function (dayUI) {
        console.log(dayUI);
        if ((dayUI || dayUI == 0) && !isNaN(dayUI)) {
            self.hash({day: dayUI});
        } else {
            self.hash({day: self.currDayUI()});
        }
        return false;
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

    this.imageLoad = function(data, e) {
        $(e.target).parent().addClass('img-loaded');
    }

    // single image controls

    this.selectImage = function (index) {
        self.currMediaIndex(index);
    }
    this.prevImage = function () {
        self.selectImage(self.currMediaIndex() - 1);
        return false;
    }
    this.nextImage = function () {
        self.selectImage(self.currMediaIndex() + 1);
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

var view = $('body');
var VM = new MediaControlVM(location.hash);
ko.applyBindings(VM, view[0]);

window.MediaControlVM = VM;

})();
