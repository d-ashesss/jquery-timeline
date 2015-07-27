"use strict";

module JQueryTimeline {
	export class EventDate {
		static monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

		static formatRange(start: EventDate, end: EventDate): string {
			// Different epochs "[[DD ]MMM ]YYYY BC - [[DD ]MMM ]YYYY AD"
			if (start.getYear() < 0 && 0 <= end.getYear()) {
				return start.formatEpoch() + " - " + end.formatEpoch();
			}
			// Different years "[[DD ]MMM ]YYYY - [[DD ]MMM ]YYYY BC/AD"
			if (start.getYear() !== end.getYear()) {
				return start.formatYear() + " - " + end.formatEpoch();
			}
			// No month "YYYY AD"
			if (typeof start.getMonth() === "undefined" || typeof end.getMonth() === "undefined") {
				return start.formatEpoch();
			}
			// Different months "[DD ]MMM - [DD ]MMM YYYY AD"
			if (start.getMonth() !== end.getMonth()) {
				return start.formatMonth() + " - " + end.formatEpoch();
			}
			// No date "MMM YYYY AD"
			if (typeof start.getDate() === "undefined" || typeof end.getDate() === "undefined") {
				return start.formatEpoch();
			}
			// Different dates "DD - DD MMM YYYY AD"
			return start.getDate() + " - " + end.formatEpoch();
		}

		static join(arr: Array<any>): string {
			return arr.join(" ").trim();
		}

		private date: number;
		private month: number;
		private year: number = 0;

		constructor(date: number, length?: number);
		constructor(date: string, length?: number);
		constructor(date, length?) {
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
			} else if (match = /^(\d+)-(\d+)$/.exec(date)) {
				this.month = parseInt(match[1]) - 1;
				this.year = parseInt(match[2]);
			} else if (match = /^(\d+)-(\d+)-(\d+)$/.exec(date)) {
				this.date = parseInt(match[1]);
				this.month = parseInt(match[2]) - 1;
				this.year = parseInt(match[3]);
			}
			if (negative) {
				this.year *= -1;
			}
			this.year += length || 0;
		}

		getDate(): number {
			return this.date;
		}

		getMonth(): number {
			return this.month;
		}

		getMonthName(): string {
			return EventDate.monthNames[this.month];
		}

		getYear(): number {
			return this.year;
		}

		getEpoch(): string {
			return this.year < 0 ? "BC" : "AD";
		}

		formatMonth(): string {
			return EventDate.join([
				this.getDate(),
				this.getMonthName(),
			]);
		}

		formatYear(): string {
			return EventDate.join([
				this.formatMonth(),
				EventDate.simplifyYear(this.getYear()),
			]);
		}

		formatEpoch(): string {
			return EventDate.join([
				this.formatYear(),
				this.getEpoch(),
			]);
		}

		formatYearEpoch(): string {
			return EventDate.join([
				EventDate.simplifyYear(this.getYear()),
				this.getEpoch(),
			]);
		}

		render(end?: EventDate): string {
			if (end) {
				return EventDate.formatRange(this, end);
			}
			return this.formatEpoch();
		}
	}
}
