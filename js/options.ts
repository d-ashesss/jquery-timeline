"use strict";

module JQueryTimeline {
	export interface Options {
		container?: JQuery
		zoom?: number
		lines?: Array<LineOptions>
	}

	export interface LineOptions {
		color: string
		events?: Array<EventOptions>
	}

	export interface EventOptions {
		label: string
		start: number
		end?: number
		length?: number
		color?: string
	}
}
