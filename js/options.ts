"use strict";

module JQueryTimeline {
	export interface Options {
		container?: JQuery
		zoom?: number
		scale?: number
		minorSections?: number
		lines?: Array<LineOptions>
		events?: Array<EventOptions>
	}

	export interface LineOptions {
		color?: string
		events?: Array<EventOptions>
	}

	export interface EventOptions {
		label: string
		start: number
		end?: number
		length?: number
		color?: string
	}

	export interface RenderOptions {
		years: Array<number>
		year_width: number
		major_step: number
		minor_step: number
		min_year: number
		max_year: number
	}
}
