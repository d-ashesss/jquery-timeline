"use strict";

module JQueryTimeline {
	export var $: JQueryStatic;

	export class Timeline {
		static yearAtom: number = 0.24;
		static defaultOptions: Options = {
			zoom: 100,
			lines: []
		};

		$: JQuery;
		private $background: JQuery;
		private $content: JQuery;

		private lines: Array<JQuery> = [];
		private events: Array<Event> = [];

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
				.bind("mousewheel", scroll)
				.data("timeline", this);
			this.$background = $("<div>", { "class": "background" }).appendTo(this.$);
			this.$content = $("<div>", { "class": "content" }).appendTo(this.$);

			this.zoom = options.zoom;
			if (this.zoom <= 0) {
				this.zoom = 1;
			} else if (this.zoom > 200) {
				this.zoom = 200;
			}

			options.lines.forEach(this._addLine, this);
			this.render();
		}

		addLine(line: LineOptions): JQuery {
			var $line = this._addLine(line);
			this.render();
			return $line;
		}

		private _addLine(line_options: LineOptions): JQuery {
			var $line = $("<div>", { "class": "line " + line_options.color })
				.data("line", line_options)
				.appendTo(this.$content);
			this.lines.push($line);
			line_options.events = line_options.events || [];
			line_options.events.forEach((event_options) => {
				event_options.color = event_options.color || line_options.color;
				var event = new Event(event_options);
				$line.append(event.$);
				this.events.push(event);
			});
			return $line;
		}

		addEvent(event_options: EventOptions, line_index?: number) {
			if (typeof line_index === "undefined") {
				if (this.lines.length === 0) {
					this._addLine({ color: "gray" });
				}
				line_index = this.lines.length - 1;
			}
			if (typeof this.lines[line_index] === "undefined") {
				return;
			}
			var $line = this.lines[line_index];
			var line_options = <LineOptions>$line.data("line");
			event_options.color = event_options.color || line_options.color;
			var event = new Event(event_options);
			$line.append(event.$);
			this.events.push(event);
			this.render();
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
			this.events.forEach((event) => {
				years.push(event.getStartYear(), event.getEndYear());
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
			this.renderEvents(min_year);
		}

		private renderEvents(min_year: number) {
			this.events.forEach((event) => {
				event.render(min_year, this.getYearWidth());
			});
		}
	}

	function scroll(event: JQueryEventObject) {
		event.preventDefault();
		var wheel_event = <WheelEvent>event.originalEvent;
		var scroll_before = $(this).scrollLeft();
		$(this).scrollLeft(scroll_before + wheel_event.deltaY);
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
