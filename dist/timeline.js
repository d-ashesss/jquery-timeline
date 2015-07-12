"use strict";
var JQueryTimeline;
(function (JQueryTimeline) {
    JQueryTimeline.$;
    var Timeline = (function () {
        function Timeline(options) {
            this.lines = [];
            this.events = [];
            if (!(this instanceof Timeline)) {
                return new Timeline(options);
            }
            options = JQueryTimeline.$.extend(true, {}, Timeline.defaultOptions, options);
            if (!options.container || !options.container.length) {
                options.container = JQueryTimeline.$("<div>");
            }
            var existing_timeline = options.container.data("timeline");
            if (existing_timeline) {
                throw existing_timeline;
            }
            this.$ = options.container.addClass("jquery-timeline").bind("mousewheel", scroll).data("timeline", this);
            this.$background = JQueryTimeline.$("<div>", { "class": "background" }).appendTo(this.$);
            this.$content = JQueryTimeline.$("<div>", { "class": "content" }).appendTo(this.$);
            this.zoom = options.zoom;
            if (this.zoom <= 0) {
                this.zoom = 1;
            }
            else if (this.zoom > 200) {
                this.zoom = 200;
            }
            options.lines.forEach(this.addLine, this);
            this.buildBackground();
        }
        Timeline.prototype.addLine = function (line) {
            var _this = this;
            var $line = JQueryTimeline.$("<div>", { "class": "line " + line.color }).data("line", line).appendTo(this.$content);
            this.lines.push($line);
            line.events.forEach(function (event) {
                _this.addEvent(event, $line);
            });
            return $line;
        };
        Timeline.prototype.addEvent = function (event, $line) {
            if (typeof $line === "number") {
                $line = this.lines[$line];
            }
            var line = $line.data("line");
            var $event = JQueryTimeline.$("<div>", { "class": "event" }).data("event", event).append(JQueryTimeline.$("<div>", { "class": "marker" })).append(JQueryTimeline.$("<div>", { "class": "label" }).text(event.label)).appendTo($line);
            this.events.push($event);
            if (event.length) {
                event.end = event.start + event.length;
            }
            if (event.end) {
                event.length = event.end - event.start;
                $event.addClass("range");
                $event.find(".marker").css("background-color", line.color).width(this.yearWidth(event.length));
            }
            else {
                $event.addClass("single");
            }
            if (event.color) {
                $event.find(".marker").css("background-color", event.color);
            }
            return $event;
        };
        Timeline.prototype.yearWidth = function (year) {
            return year * this.zoom * Timeline.yearAtom;
        };
        Timeline.prototype.buildBackground = function () {
            this.$background.empty();
            var years = [];
            this.events.forEach(function ($event) {
                var event = $event.data("event");
                years.push(event.start);
                if (event.end) {
                    years.push(event.end);
                }
            });
            if (years.length === 0) {
                return;
            }
            var inner_sections = 5;
            var high_step = round_year(1000 / this.zoom, inner_sections);
            var low_step = high_step / inner_sections;
            var min_year = round_year(Math.min.apply(null, years), high_step, false);
            min_year -= high_step;
            var max_year = round_year(Math.max.apply(null, years), high_step, true);
            max_year += low_step * (inner_sections - 1);
            var year;
            for (year = min_year; year <= max_year; year += low_step) {
                var width = Math.round(this.yearWidth(low_step));
                var $period = JQueryTimeline.$("<div>", { "class": "period" }).width(width).appendTo(this.$background);
                if (year % high_step === 0) {
                    $period.addClass("solid").append(JQueryTimeline.$("<div>", { "class": "label" }).text(format_year(year)));
                }
            }
            this.alignEvents(min_year);
        };
        Timeline.prototype.alignEvents = function (min_year) {
            var _this = this;
            this.events.forEach(function ($event) {
                var event = $event.data("event");
                var width = _this.yearWidth(event.start - min_year);
                $event.css("left", width);
            });
        };
        Timeline.yearAtom = 0.24;
        Timeline.defaultOptions = {
            zoom: 100,
            lines: []
        };
        return Timeline;
    })();
    JQueryTimeline.Timeline = Timeline;
    function scroll(event) {
        event.preventDefault();
        var wheel_event = event.originalEvent;
        var scroll_before = JQueryTimeline.$(this).scrollLeft();
        JQueryTimeline.$(this).scrollLeft(scroll_before + wheel_event.deltaY);
    }
    function round_year(year, step, ceil) {
        if (step === void 0) { step = 10; }
        if (ceil === void 0) { ceil = false; }
        var high = year / step;
        high = ceil ? Math.ceil(high) : Math.floor(high);
        if (high === 0) {
            return 0;
        }
        return high * step;
    }
    function format_year(year) {
        var abs_year = Math.abs(year);
        var label = "" + abs_year;
        if (abs_year >= 1e9) {
            abs_year /= 1e8;
            abs_year = Math.round(abs_year) / 10;
            label = abs_year + 'B';
        }
        else if (abs_year >= 1e6) {
            abs_year /= 1e5;
            abs_year = Math.round(abs_year) / 10;
            label = abs_year + 'M';
        }
        else if (abs_year >= 1e4) {
            abs_year /= 1e5;
            abs_year = Math.round(abs_year) / 10;
            label = abs_year + 'K';
        }
        return label + (year < 0 ? ' BC' : ' AD');
    }
})(JQueryTimeline || (JQueryTimeline = {}));
"use strict";
"use strict";
(function ($) {
    JQueryTimeline.$ = $;
    $.fn.timeline = function timeline(options) {
        var timeline = this.data("timeline");
        if (!timeline) {
            options.container = this;
            timeline = new JQueryTimeline.Timeline(options);
        }
        return timeline.$;
    };
    $.timeline = function timeline(options) {
        var timeline = null;
        try {
            timeline = new JQueryTimeline.Timeline(options);
        }
        catch (e) {
            if (e instanceof JQueryTimeline.Timeline) {
                timeline = e;
            }
        }
        return timeline;
    };
})(jQuery);
//# sourceMappingURL=timeline.js.map