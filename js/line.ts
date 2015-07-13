"use strict";

module JQueryTimeline {
	export class Line {
		$: JQuery;

		private color: string;

		private events: Array<Event> = [];

		constructor(options: LineOptions = {}) {
			this.$ = $("<div>", {
				"class": "line",
				"data": { "line": this }
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
			this.$.append(event.$);
			this.events.push(event);
			return event;
		}

		getYears(): Array<number> {
			var years: Array<number> = [];
			this.events.forEach((event) => {
				years.push(event.getStartYear(), event.getEndYear());
			});
			return years;
		}

		render(min_year: number, year_length: number) {
			this.events.forEach((event) => {
				event.render(min_year, year_length);
			});
		}
	}
}
