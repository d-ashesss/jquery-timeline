"use strict";

module JQueryTimeline {
	export class Line {
		$: JQuery;

		private color: string;

		private events: Array<Event> = [];
		private mergedEvents: { [s: number]: Event; } = {};

		constructor(options: LineOptions = {}) {
			this.$ = $("<div>", {
				"class": "line",
				"data": { "line": this },
			});
			if (options.color) {
				this.color = options.color;
			}
			var events = options.events || [];
			events.forEach((event_options) => {
				this.addEvent(event_options);
			});
		}

		addEvent(event_options: EventOptions): Event {
			event_options.color = event_options.color || this.color;
			var event = new Event(event_options);
			if (event.isMergable()) {
				var year = event.getStartYear();
				if (typeof this.mergedEvents[year] !== "undefined") {
					this.mergedEvents[year].addChild(event);
					return event;
				} else {
					this.mergedEvents[year] = event;
				}
			}
			var added = this.events.some((e: Event, i: number) => {
				if (e.getStartYear() < event.getStartYear()) {
					return false;
				}
				if (e.getStartYear() === event.getStartYear() && (event.isSingle() || !e.isSingle())) {
					return false;
				}
				this.events.splice(i, 0, event);
				return true;
			});
			if (!added) {
				this.events.push(event);
			}
			return event;
		}

		getYears(): Array<number> {
			var years: Array<number> = [];
			this.events.forEach((event) => {
				years.push(event.getStartYear(), event.getEndYear());
			});
			return years;
		}

		render(options: RenderOptions) {
			this.$.find(".row").detach();
			this.events.forEach((event) => {
				var added = this.$.find(".row").toArray().some((row) => {
					var left = (event.getStartYear() - options.min_year) * options.year_width;
					var $prev_event = $(row).find(".event").last();
					var prev_event_right = $prev_event.width() + parseFloat($prev_event.css("left"));
					if ((prev_event_right - 10) < left) {
						$(row).append(event.$);
						return true;
					}
				});
				if (!added) {
					$("<div>", { "class": "row" }).append(event.$).appendTo(this.$);
				}
				event.render(options);
			});
		}
	}
}
