/* jquery-timeline v0.3.0 | (c) 2015 Sergey Mashentsev <d.ashesss@gmail.com> | MIT License */
"use strict";
var JQueryTimeline;
(function (JQueryTimeline) {
    JQueryTimeline.$;
    var Timeline = (function () {
        function Timeline(options) {
            this.lines = [];
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
            this.$ = options.container
                .addClass("jquery-timeline")
                .data("timeline", this);
            this.$background = JQueryTimeline.$("<div>", { "class": "background" }).appendTo(this.$);
            this.$content = JQueryTimeline.$("<div>", { "class": "content" }).appendTo(this.$);
            this.initScroll();
            var max_zoom = Timeline.zoomBase / options.minorSections;
            this.zoom = options.zoom;
            if (this.zoom <= 0) {
                this.zoom = 1;
            }
            else if (this.zoom > max_zoom) {
                this.zoom = max_zoom;
            }
            this.yearScale = Timeline.yearScale * options.scale;
            this.minorSections = options.minorSections;
            options.lines = options.lines || [];
            if (options.events) {
                options.lines.push({
                    events: options.events
                });
            }
            options.lines.forEach(this._addLine, this);
            this.render();
        }
        Timeline.roundYear = function (year, step, ceil) {
            if (step === void 0) { step = 10; }
            if (ceil === void 0) { ceil = false; }
            var high = year / step;
            high = ceil ? Math.ceil(high) : Math.floor(high);
            if (high === 0) {
                return 0;
            }
            return high * step;
        };
        Timeline.prototype.initScroll = function () {
            var _this = this;
            this.$.bind("mousewheel", function (event) {
                event.preventDefault();
                _this.scroll(event.originalEvent.deltaY);
            });
            this.$.bind("DOMMouseScroll", function (event) {
                var _event = event;
                _event.preventDefault();
                _this.scroll(_event.detail * 20);
            });
            this.$.data("scroll", false);
            this.$.mousedown(function (event) {
                if (event.button !== 0) {
                    return;
                }
                var timeout = setTimeout(function () {
                    _this.$.data("scroll", event.pageX)
                        .addClass("dragging");
                }, 50);
                _this.$.data("scroll-timeout", timeout);
            });
            JQueryTimeline.$(document).mousemove(function (event) {
                var prev_scroll = _this.$.data("scroll");
                if (prev_scroll !== false) {
                    _this.scroll(prev_scroll - event.pageX);
                    _this.$.data("scroll", event.pageX);
                }
            });
            JQueryTimeline.$(document).mouseup(function () {
                _this.$.data("scroll", false)
                    .removeClass("dragging");
                clearTimeout(_this.$.data("scroll-timeout"));
            });
        };
        Timeline.prototype.addLine = function (line_options) {
            var line = this._addLine(line_options);
            this.render();
            return line;
        };
        Timeline.prototype._addLine = function (line_options) {
            line_options = JQueryTimeline.$.extend(true, {}, line_options);
            var line = new JQueryTimeline.Line(line_options);
            this.$content.append(line.$);
            this.lines.push(line);
            return line;
        };
        Timeline.prototype.addEvent = function (event_options, line_index) {
            var event = this._addEvent(event_options, line_index);
            this.render();
            return event;
        };
        Timeline.prototype.addEvents = function (event_options, line_index) {
            event_options.forEach(function (event_options) {
                this._addEvent(event_options, line_index);
            }, this);
            this.render();
        };
        Timeline.prototype._addEvent = function (event_options, line_index) {
            event_options = JQueryTimeline.$.extend(true, {}, event_options);
            if (typeof line_index === "undefined") {
                if (this.lines.length === 0) {
                    this._addLine();
                }
                line_index = this.lines.length - 1;
            }
            if (typeof this.lines[line_index] === "undefined") {
                return;
            }
            return this.lines[line_index].addEvent(event_options);
        };
        Timeline.prototype.render = function () {
            this.$background.empty();
            var options = this.getRenderOptions();
            if (options.years.length === 0) {
                return;
            }
            this.renderBackground(options);
            this.renderLines(options);
        };
        Timeline.prototype.getRenderOptions = function () {
            var years = [];
            this.lines.forEach(function (line) {
                years = years.concat(line.getYears());
            });
            var major_step = Timeline.roundYear(Timeline.zoomBase / this.zoom, this.minorSections);
            var minor_step = major_step / this.minorSections;
            var min_year = Timeline.roundYear(Math.min.apply(null, years), major_step, false);
            min_year -= major_step;
            var max_year = Timeline.roundYear(Math.max.apply(null, years), major_step, true);
            max_year += minor_step * (this.minorSections - 1);
            return {
                years: years,
                year_width: this.zoom * this.yearScale,
                major_step: major_step,
                minor_step: minor_step,
                min_year: min_year,
                max_year: max_year,
            };
        };
        Timeline.prototype.renderBackground = function (options) {
            var year;
            for (year = options.min_year; year <= options.max_year; year += options.minor_step) {
                var width = Math.round(options.minor_step * options.year_width);
                var $period = JQueryTimeline.$("<div>", { "class": "period" })
                    .width(width)
                    .appendTo(this.$background);
                if (year % options.major_step === 0) {
                    $period.addClass("solid");
                    JQueryTimeline.$("<div>", {
                        "class": "label",
                        "text": (new JQueryTimeline.EventDate(year)).formatYearEpoch(),
                    }).appendTo($period);
                }
            }
            this.scrollTo(options.min_year + options.major_step);
        };
        Timeline.prototype.renderLines = function (options) {
            this.lines.forEach(function (line) {
                line.render(options);
            });
        };
        Timeline.prototype.scroll = function (delta) {
            var scroll_before = this.$.scrollLeft();
            this.$.scrollLeft(scroll_before + delta);
        };
        Timeline.prototype.scrollTo = function (year) {
            var options = this.getRenderOptions();
            var offset = year - options.min_year;
            this.$.scrollLeft(offset * options.year_width);
        };
        Timeline.zoomBase = 1000;
        Timeline.yearScale = 0.24;
        Timeline.defaultOptions = {
            zoom: 100,
            scale: 1,
            minorSections: 5,
        };
        return Timeline;
    })();
    JQueryTimeline.Timeline = Timeline;
})(JQueryTimeline || (JQueryTimeline = {}));
"use strict";
"use strict";
var JQueryTimeline;
(function (JQueryTimeline) {
    var Event = (function () {
        function Event(options) {
            this.children = [];
            this.$ = JQueryTimeline.$("<div>", {
                "class": "event",
                "data": { "event": this },
            });
            this.$marker = JQueryTimeline.$("<div>", {
                "class": "marker",
                "css": {
                    "background-color": options.color || Event.defaultColor,
                },
            }).appendTo(this.$);
            if (options.color === "transparent") {
                this.$marker.addClass("border");
            }
            this.$label = JQueryTimeline.$("<div>", {
                "class": "label",
                text: options.label,
            }).appendTo(this.$);
            this.startDate = new JQueryTimeline.EventDate(options.start);
            if (options.length) {
                this.endDate = new JQueryTimeline.EventDate(options.start, options.length);
            }
            else if (options.end) {
                this.endDate = new JQueryTimeline.EventDate(options.end);
            }
            if (this.isSingle()) {
                this.$.addClass("single");
            }
            else {
                this.$.addClass("range");
            }
            this.name = (options.name || options.label) || "";
            this.description = options.description || "";
            this.initTooltip();
        }
        Event.prototype.getStartYear = function () {
            return this.startDate.getYear();
        };
        Event.prototype.getEndYear = function () {
            if (!this.endDate) {
                return this.getStartYear();
            }
            return this.endDate.getYear();
        };
        Event.prototype.getLength = function () {
            return this.getEndYear() - this.getStartYear();
        };
        Event.prototype.render = function (options) {
            var offset = (this.getStartYear() - options.min_year) * options.year_width;
            this.$.css("left", offset);
            var width = this.getLength() * options.year_width;
            if (width > 0) {
                this.$marker.width(width);
            }
        };
        Event.prototype.initTooltip = function () {
            var _this = this;
            this.$.hover(function (event) {
                _this.showTooltip(event);
            }, function () {
                _this.hideTooltip();
            }).mousemove(function (event) {
                _this.showTooltip(event);
            });
            this.$.click(function (event) {
                _this.showTooltip(event, true);
            });
        };
        Event.prototype.hideTooltip = function () {
            JQueryTimeline.Tooltip.hide();
        };
        Event.prototype.showTooltip = function (event, fixed) {
            if (fixed === void 0) { fixed = false; }
            if (!this.tooltip) {
                this.tooltip = this.tooltipContent();
            }
            JQueryTimeline.Tooltip.show({
                content: this.tooltip,
                x: event.clientX,
                y: event.clientY,
                fixed: fixed
            });
        };
        Event.prototype.tooltipContent = function () {
            var $tooltip = JQueryTimeline.$("<div>")
                .append(this.tooltipTitle());
            if (this.description.length > 0) {
                JQueryTimeline.$("<div>", { "class": "content" })
                    .html(this.description)
                    .appendTo($tooltip);
            }
            return $tooltip.html();
        };
        Event.prototype.tooltipTitle = function () {
            var titles = [this].concat(this.children).reduce(function (titles, event) {
                var $title = event.renderTooltipTitle();
                var index = event.getDateIndex();
                if (typeof titles[index] === "undefined") {
                    titles[index] = $title;
                }
                else {
                    titles[index] = titles[index].after($title);
                }
                return titles;
            }, []);
            return titles.reduce(function ($title, $title_group, i) {
                return $title.append($title_group);
            }, JQueryTimeline.$("<div>", { "class": "title" }));
        };
        Event.prototype.renderTooltipTitle = function () {
            var $title = JQueryTimeline.$("<div>");
            var date = this.startDate.render(this.endDate);
            JQueryTimeline.$("<strong>").text(date + ": ").appendTo($title);
            $title.append(this.name);
            return $title;
        };
        Event.prototype.isSingle = function () {
            return this.getLength() === 0;
        };
        Event.prototype.isMergable = function () {
            return this.isSingle() && this.description.length === 0;
        };
        Event.prototype.addChild = function (event) {
            this.children.push(event);
            var total_events = this.children.length + 1;
            this.$label.text("(" + total_events + " events)");
        };
        Event.prototype.getDateIndex = function () {
            return this.startDate.getDateIndex();
        };
        Event.defaultColor = "gray";
        return Event;
    })();
    JQueryTimeline.Event = Event;
})(JQueryTimeline || (JQueryTimeline = {}));
"use strict";
var JQueryTimeline;
(function (JQueryTimeline) {
    var EventDate = (function () {
        function EventDate(date, length) {
            this.year = 0;
            var negative = false;
            if (typeof date === "number") {
                date = date.toFixed(0);
            }
            if (date.substr(0, 1) === "-") {
                date = date.substr(1);
                negative = true;
            }
            var match;
            if (/^\d+$/.exec(date)) {
                this.year = parseInt(date);
            }
            else if (match = /^(\d+)-(\d+)$/.exec(date)) {
                this.month = parseInt(match[1]);
                this.year = parseInt(match[2]);
            }
            else if (match = /^(\d+)-(\d+)-(\d+)$/.exec(date)) {
                this.date = parseInt(match[1]);
                this.month = parseInt(match[2]);
                this.year = parseInt(match[3]);
            }
            if (negative) {
                this.year *= -1;
            }
            this.year += length || 0;
        }
        EventDate.simplifyYear = function (year) {
            var abs_year = Math.abs(year);
            var year_str = "" + abs_year;
            if (abs_year >= 1e9) {
                abs_year /= 1e8;
                abs_year = Math.round(abs_year) / 10;
                year_str = abs_year + "B";
            }
            else if (abs_year >= 1e6) {
                abs_year /= 1e5;
                abs_year = Math.round(abs_year) / 10;
                year_str = abs_year + "M";
            }
            else if (abs_year >= 1e4) {
                abs_year /= 1e5;
                abs_year = Math.round(abs_year) / 10;
                year_str = abs_year + "K";
            }
            return year_str;
        };
        EventDate.formatRange = function (start, end) {
            if (start.getYear() < 0 && 0 <= end.getYear()) {
                return start.formatEpoch() + " - " + end.formatEpoch();
            }
            if (start.getYear() !== end.getYear()) {
                return start.formatYear() + " - " + end.formatEpoch();
            }
            if (typeof start.getMonth() === "undefined" || typeof end.getMonth() === "undefined") {
                return start.formatEpoch();
            }
            if (start.getMonth() !== end.getMonth()) {
                return start.formatMonth() + " - " + end.formatEpoch();
            }
            if (typeof start.getDate() === "undefined" || typeof end.getDate() === "undefined") {
                return start.formatEpoch();
            }
            return start.getDate() + " - " + end.formatEpoch();
        };
        EventDate.join = function (arr) {
            return arr.join(" ").trim();
        };
        EventDate.prototype.getDateIndex = function () {
            var date = "0" + (this.date || "0");
            var month = "0" + (this.month || "0");
            return parseInt(month.substr(-2) + date.substr(-2));
        };
        EventDate.prototype.getDate = function () {
            return this.date;
        };
        EventDate.prototype.getMonth = function () {
            return this.month;
        };
        EventDate.prototype.getMonthName = function () {
            if (typeof this.month === "undefined") {
                return "";
            }
            return EventDate.monthNames[this.month - 1];
        };
        EventDate.prototype.getYear = function () {
            return this.year;
        };
        EventDate.prototype.getEpoch = function () {
            return this.year < 0 ? "BC" : "AD";
        };
        EventDate.prototype.formatMonth = function () {
            return EventDate.join([
                this.getDate(),
                this.getMonthName(),
            ]);
        };
        EventDate.prototype.formatYear = function () {
            return EventDate.join([
                this.formatMonth(),
                EventDate.simplifyYear(this.getYear()),
            ]);
        };
        EventDate.prototype.formatEpoch = function () {
            return EventDate.join([
                this.formatYear(),
                this.getEpoch(),
            ]);
        };
        EventDate.prototype.formatYearEpoch = function () {
            return EventDate.join([
                EventDate.simplifyYear(this.getYear()),
                this.getEpoch(),
            ]);
        };
        EventDate.prototype.render = function (end) {
            if (end) {
                return EventDate.formatRange(this, end);
            }
            return this.formatEpoch();
        };
        EventDate.monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return EventDate;
    })();
    JQueryTimeline.EventDate = EventDate;
})(JQueryTimeline || (JQueryTimeline = {}));
"use strict";
var JQueryTimeline;
(function (JQueryTimeline) {
    var Line = (function () {
        function Line(options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            this.events = [];
            this.mergedEvents = {};
            this.$ = JQueryTimeline.$("<div>", {
                "class": "line",
                "data": { "line": this },
            });
            if (options.color) {
                this.color = options.color;
            }
            var events = options.events || [];
            events.forEach(function (event_options) {
                _this.addEvent(event_options);
            });
        }
        Line.prototype.addEvent = function (event_options) {
            var _this = this;
            event_options.color = event_options.color || this.color;
            var event = new JQueryTimeline.Event(event_options);
            if (event.isMergable()) {
                var year = event.getStartYear();
                if (typeof this.mergedEvents[year] !== "undefined") {
                    this.mergedEvents[year].addChild(event);
                    return event;
                }
                else {
                    this.mergedEvents[year] = event;
                }
            }
            var added = this.events.some(function (e, i) {
                if (e.getStartYear() < event.getStartYear()) {
                    return false;
                }
                if (e.getStartYear() === event.getStartYear() && (event.isSingle() || !e.isSingle())) {
                    return false;
                }
                _this.events.splice(i, 0, event);
                return true;
            });
            if (!added) {
                this.events.push(event);
            }
            return event;
        };
        Line.prototype.getYears = function () {
            var years = [];
            this.events.forEach(function (event) {
                years.push(event.getStartYear(), event.getEndYear());
            });
            return years;
        };
        Line.prototype.render = function (options) {
            var _this = this;
            this.$.find(".row").detach();
            this.events.forEach(function (event) {
                var added = _this.$.find(".row").toArray().some(function (row) {
                    var left = (event.getStartYear() - options.min_year) * options.year_width;
                    var $prev_event = JQueryTimeline.$(row).find(".event").last();
                    var prev_event_right = $prev_event.width() + parseFloat($prev_event.css("left"));
                    if ((prev_event_right - 10) < left) {
                        JQueryTimeline.$(row).append(event.$);
                        return true;
                    }
                });
                if (!added) {
                    JQueryTimeline.$("<div>", { "class": "row" }).append(event.$).appendTo(_this.$);
                }
                event.render(options);
            });
        };
        return Line;
    })();
    JQueryTimeline.Line = Line;
})(JQueryTimeline || (JQueryTimeline = {}));
"use strict";
var JQueryTimeline;
(function (JQueryTimeline) {
    var Tooltip = (function () {
        function Tooltip() {
        }
        Tooltip.init = function () {
            Tooltip.$ = JQueryTimeline.$("<div>", {
                "class": "jquery-timeline-tooltip"
            }).appendTo("body");
            JQueryTimeline.$("body").click(function (e) {
                if (JQueryTimeline.$(e.target).is(".event")
                    || JQueryTimeline.$(e.target).is(".jquery-timeline-tooltip")
                    || JQueryTimeline.$(e.target).parents(".event, .jquery-timeline-tooltip").length > 0) {
                    return;
                }
                Tooltip.hide(true);
            });
            return Tooltip.$;
        };
        Tooltip.show = function (options) {
            var $tooltip = Tooltip.$ || Tooltip.init();
            if (!$tooltip.is(".fixed") || options.fixed) {
                if (typeof options.content !== "undefined") {
                    $tooltip.html(options.content);
                }
                if (typeof options.x !== "undefined") {
                    var width = $tooltip.width();
                    $tooltip.css("left", options.x - (width / 2));
                }
                if (typeof options.y !== "undefined") {
                    $tooltip.css("top", options.y + 15);
                }
                if (options.fixed) {
                    $tooltip.addClass("fixed");
                }
            }
            return $tooltip.show();
        };
        Tooltip.hide = function (force) {
            if (force === void 0) { force = false; }
            if (Tooltip.$.is(".fixed") && !force) {
                return;
            }
            return Tooltip.$.removeClass("fixed").hide();
        };
        return Tooltip;
    })();
    JQueryTimeline.Tooltip = Tooltip;
})(JQueryTimeline || (JQueryTimeline = {}));
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="timeline.ts" />
/// <reference path="options.ts" />
/// <reference path="event.ts" />
/// <reference path="eventdate.ts" />
/// <reference path="line.ts" />
/// <reference path="tooltip.ts" />
"use strict";
(function ($) {
    JQueryTimeline.$ = $;
    $.fn.timeline = function timeline(method, data) {
        var timeline = this.data("timeline");
        if (typeof method === "string") {
            if (!(timeline instanceof JQueryTimeline.Timeline)) {
                timeline = new JQueryTimeline.Timeline({ container: this });
            }
            if (typeof timeline[method] === "function") {
                timeline[method](data);
            }
            return this;
        }
        var options = method || {};
        if (!(timeline instanceof JQueryTimeline.Timeline)) {
            options.container = this;
            timeline = new JQueryTimeline.Timeline(options);
        }
        return timeline.$;
    };
    $.timeline = function timeline(options) {
        if (options === void 0) { options = {}; }
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