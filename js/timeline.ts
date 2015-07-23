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

		static $tooltip: JQuery;

		static tooltip(options: TooltipOptions): JQuery {
			var $tooltip = Timeline.$tooltip;
			if (!$tooltip) {
				$tooltip = Timeline.$tooltip = $("<div>", {
					"class": "jquery-timeline-tooltip"
				}).appendTo("body");
				$("body").click((e) => {
					if ($(e.target).is(".event")
							//|| $(e.target).parent().is(".event")
						|| $(e.target).is(".jquery-timeline-tooltip")
						|| $(e.target).parents(".event, .jquery-timeline-tooltip").length > 0) {
						return;
					}
					this.tooltip({ hide: true, fixed: true });
				});
			}
			if (options.hide) {
				if ($tooltip.is(".fixed") && !options.fixed) {
					return;
				}
				return $tooltip.removeClass("fixed").hide();
			}
			if (!$tooltip.is(".fixed") || options.fixed) {
				if (typeof options.content !== "undefined") {
					$tooltip.html(options.content);
				}
				if (typeof options.x !== "undefined") {
					var width = $tooltip.width();
					$tooltip.css("left", options.x - (width / 2));
				}
				if (typeof options.y !== "undefined") {
					$tooltip.css("top", options.y);
				}
				if (options.fixed) {
					$tooltip.addClass("fixed");
				}
			}
			return $tooltip.show();
		}

		static roundYear(year: number, step = 10, ceil = false): number {
			var high = year / step;
			high = ceil ? Math.ceil(high) : Math.floor(high);
			if (high === 0) {
				return 0; // avoid -0
			}
			return high * step;
		}

		static simplifyYear(year: number): string {
			var abs_year = Math.abs(year);
			var year_str = "" + abs_year;
			if (abs_year >= 1e9) {
				abs_year /= 1e8;
				abs_year = Math.round(abs_year) / 10;
				year_str = abs_year + "B";
			} else if (abs_year >= 1e6) {
				abs_year /= 1e5;
				abs_year = Math.round(abs_year) / 10;
				year_str = abs_year + "M";
			} else if (abs_year >= 1e4) {
				abs_year /= 1e5;
				abs_year = Math.round(abs_year) / 10;
				year_str = abs_year + "K";
			}
			return year_str;
		}

		static formatYear(year: number): string {
			var label = this.simplifyYear(year);
			return label + (year < 0 ? " BC" : " AD");
		}

		static formatRange(start: number, end: number): string {
			if ((start < 0 && end < 0) || (start > 0 && end > 0)) {
				return this.simplifyYear(start) + " - " + this.formatYear(end);
			}
			return this.formatYear(start) + " - " + this.formatYear(end);
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
						"text": Timeline.formatYear(year),
					}).appendTo($period);
				}
			}
			this.$.scrollLeft(options.major_step * options.year_width);
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
	}
}
