# History Timeline jQuery Plugin

## Install via bower
```bash
bower install jquery-timeline
```

## Usage
Create a div container
```html
<div id="timeline"><div>
```

Initialize the Timeline
```js
$("#timeline").timeline({
	// options
}); // Returns a jQuery object
// OR
$.timeline({
	container: $("#timeline")
	// more options
}); // Returns Timeline object
```

## Reference
### Options
- container: jQuery [optional]
- zoom: number [optional] — zoom level, 0 < zoom <= 200, default: 100
- lines: Array<LineOptions>

### LineOptions
- color: string — any CSS compatible color value like `red` or `#FF0000`
- events: Array<EventOptions>

### EventOptions
- label: string
- start: number — a year when asingle event happened or a date range started
- length: number [optional] — length of a date range
- end: number [optional] — a year when a date range ended
- color: string — any CSS compatible color value like `red` or `#FF0000`, overwrites color defined in line options

If only **start** option is provided event will be considered as single event.

Only one of **length** or **end** options required to define a date range event. If both provided **length** has higher priority.

### Timeline
*No useful public API yet*

## License
Released under the [MIT license](http://www.opensource.org/licenses/MIT).