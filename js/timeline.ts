"use strict";

module JQueryTimeline {
	export var $: JQueryStatic;

	export class Timeline {
		static yearAtom: number = 0.24;
		static defaultOptions: Options = {
			zoom: 100
		};

		$: JQuery;
		private $background: JQuery;
		private $content: JQuery;

		private lines: Array<Line> = [];

		private zoom: number;

		constructor(options: Options) {
			if (!(this instanceof Timeline)) {
				return new Timeline(options);
			}
			options = $.extend(true, {}, Timeline.defaultOptions, options);
			if (!options.container || !options.container.length) {
				options.container = $("<div>");
			}
			var existing_timeline = options.container.data("timeline");
			if (existing_timeline) {
				throw existing_timeline;
			}

			this.$ = options.container
				.addClass("jquery-timeline")
				.data("timeline", this);
			this.$background = $("<div>", { "class": "background" }).appendTo(this.$);
			this.$content = $("<div>", { "class": "content" }).appendTo(this.$);
			this.initScroll();

			this.zoom = options.zoom;
			if (this.zoom <= 0) {
				this.zoom = 1;
			} else if (this.zoom > 200) {
				this.zoom = 200;
			}

			options.lines = options.lines || [];
			if (options.events) {
				options.lines.push({
					events: options.events
				});
			}
			options.lines.forEach(this._addLine, this);
			this.render();
		}

		private initScroll() {
			this.$.bind("mousewheel", (event: JQueryEventObject) => {
				event.preventDefault();
				this.scroll((<WheelEvent>event.originalEvent).deltaY);
			});

			this.$.data("scroll", false);
			this.$.mousedown((event: JQueryEventObject) => {
				var timeout = setTimeout(() => {
					this.$.data("scroll", event.pageX)
						.addClass("dragging");
				}, 50);
				this.$.data("scroll-timeout", timeout);
			});
			$(document).mousemove((event: JQueryEventObject) => {
				var prev_scroll = this.$.data("scroll");
				if (prev_scroll !== false) {
					this.scroll(prev_scroll - event.pageX);
					this.$.data("scroll", event.pageX);
				}
			});
			$(document).mouseup(() => {
				this.$.data("scroll", false)
					.removeClass("dragging");
				clearTimeout(this.$.data("scroll-timeout"));
			});
		}

		addLine(line_options?: LineOptions): Line {
			var line = this._addLine(line_options);
			this.render();
			return line;
		}

		private _addLine(line_options?: LineOptions): Line {
			var line = new Line(line_options);
			this.$content.append(line.$);
			this.lines.push(line);
			return line;
		}

		addEvent(event_options: EventOptions, line_index?: number): Event {
			if (typeof line_index === "undefined") {
				if (this.lines.length === 0) {
					this._addLine();
				}
				line_index = this.lines.length - 1;
			}
			if (typeof this.lines[line_index] === "undefined") {
				return;
			}
			var event = this.lines[line_index].addEvent(event_options);
			this.render();
			return event;
		}

		getYearWidth(): number {
			return this.zoom * Timeline.yearAtom;
		}

		yearWidth(year: number): number {
			return year * this.getYearWidth();
		}

		render() {
			this.$background.empty();
			var years = [];
			this.lines.forEach((line) => {
				years = years.concat(line.getYears());
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
			var year: number;
			for (year = min_year; year <= max_year; year += low_step) {
				var width = Math.round(this.yearWidth(low_step));
				var $period = $("<div>", { "class": "period" })
					.width(width)
					.appendTo(this.$background);
				if (year % high_step === 0) {
					$period
						.addClass("solid")
						.append($("<div>", { "class": "label" }).text(format_year(year)));
				}
			}
			this.$.scrollLeft(this.yearWidth(high_step));
			this.renderLines(min_year);
		}

		private renderLines(min_year: number) {
			this.lines.forEach((event) => {
				event.render(min_year, this.getYearWidth());
			});
		}

		private scroll(delta: number) {
			var scroll_before = this.$.scrollLeft();
			this.$.scrollLeft(scroll_before + delta);
		}
	}

	function round_year(year: number, step = 10, ceil = false): number {
		var high = year / step;
		high = ceil ? Math.ceil(high) : Math.floor(high);
		if (high === 0) {
			return 0; // avoid -0
		}
		return high * step;
	}

	function format_year(year: number): string {
		var abs_year = Math.abs(year);
		var label = "" + abs_year;
		if (abs_year >= 1e9) {
			abs_year /= 1e8;
			abs_year = Math.round(abs_year) / 10;
			label = abs_year + 'B';
		} else if (abs_year >= 1e6) {
			abs_year /= 1e5;
			abs_year = Math.round(abs_year) / 10;
			label = abs_year + 'M';
		} else if (abs_year >= 1e4) {
			abs_year /= 1e5;
			abs_year = Math.round(abs_year) / 10;
			label = abs_year + 'K';
		}
		return label + (year < 0 ? ' BC' : ' AD');
	}
}
