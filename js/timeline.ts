"use strict";

module JQueryTimeline {
	export var $: JQueryStatic;

	export class Timeline {
		static zoomBase: number = 1000;
		static yearScale: number = 0.24;
		static defaultOptions: Options = {
			zoom: 100,
			scale: 1,
			minorSections: 5,
		};

		static roundYear(year: number, step = 10, ceil = false): number {
			var high = year / step;
			high = ceil ? Math.ceil(high) : Math.floor(high);
			if (high === 0) {
				return 0; // avoid -0
			}
			return high * step;
		}

		$: JQuery;
		private $background: JQuery;
		private $content: JQuery;

		private lines: Array<Line> = [];

		private zoom: number;
		private yearScale: number;
		private minorSections: number;

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

			var max_zoom = Timeline.zoomBase / options.minorSections;
			this.zoom = options.zoom;
			if (this.zoom <= 0) {
				this.zoom = 1;
			} else if (this.zoom > max_zoom) {
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

		private initScroll() {
			this.$.bind("mousewheel", (event: JQueryEventObject) => {
				event.preventDefault();
				this.scroll((<WheelEvent>event.originalEvent).deltaY);
			});
			this.$.bind("DOMMouseScroll", (event: any) => {
				var _event = <MouseEvent>event;
				_event.preventDefault();
				this.scroll(_event.detail * 20);
			});

			this.$.data("scroll", false);
			this.$.mousedown((event: JQueryEventObject) => {
				if (event.button !== 0) {
					return;
				}
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
			line_options = $.extend(true, {}, line_options);
			var line = new Line(line_options);
			this.$content.append(line.$);
			this.lines.push(line);
			return line;
		}

		addEvent(event_options: EventOptions, line_index?: number): Event {
			var event = this._addEvent(event_options, line_index);
			this.render();
			return event;
		}

		addEvents(event_options: EventOptions[], line_index?: number) {
			event_options.forEach(function(event_options: EventOptions) {
				this._addEvent(event_options, line_index);
			}, this);
			this.render();
		}

		private _addEvent(event_options: EventOptions, line_index?: number): Event {
			event_options = $.extend(true, {}, event_options);
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
		}

		render() {
			this.$background.empty();
			var options = this.getRenderOptions();
			if (options.years.length === 0) {
				return;
			}
			this.renderBackground(options);
			this.renderLines(options);
		}

		private getRenderOptions(): RenderOptions {
			var years = [];
			this.lines.forEach((line) => {
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
		}

		private renderBackground(options: RenderOptions) {
			var year: number;
			for (year = options.min_year; year <= options.max_year; year += options.minor_step) {
				var width = Math.round(options.minor_step * options.year_width);
				var $period = $("<div>", { "class": "period" })
					.width(width)
					.appendTo(this.$background);
				if (year % options.major_step === 0) {
					$period.addClass("solid");
					$("<div>", {
						"class": "label",
						"text": (new EventDate(year)).formatYearEpoch(),
					}).appendTo($period);
				}
			}
			this.scrollTo(options.min_year + options.major_step);
		}

		private renderLines(options: RenderOptions) {
			this.lines.forEach((line) => {
				line.render(options);
			});
		}

		private scroll(delta: number) {
			var scroll_before = this.$.scrollLeft();
			this.$.scrollLeft(scroll_before + delta);
		}

		scrollTo(year: number) {
			var options = this.getRenderOptions();
			var offset = year - options.min_year;
			this.$.scrollLeft(offset * options.year_width);
		}
	}
}
