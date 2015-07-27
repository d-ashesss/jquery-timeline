"use strict";

module JQueryTimeline {
	export class EventDate {
		private year: number;

		constructor(date: string, length?: number) {
			this.year = parseInt(date);
			this.year += length || 0;
		}

		getYear(): number {
			return this.year;
		}
	}
}
