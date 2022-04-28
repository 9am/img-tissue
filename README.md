<div align="center">
	<img src="https://user-images.githubusercontent.com/1435457/169444162-b05cd10f-f3cf-47e3-8b95-289eedbd84ad.svg" alt="img-tissue" width="180" height="180" />
	<h1>&lt;img-tissue&gt;</h1>
	<p>A web component animates an image with a minimization effect.</p>
</div>

## Demo
https://user-images.githubusercontent.com/1435457/169442632-62b8e967-6a4f-4c9f-a00f-c17cb436ad8f.mp4

## Usage
1. Installation

	```
	npm install @9am/img-tissue
	```
2. ESM

	```html
	// HTML
	<img-tissue src="/url.png"></img-tissue>
	```

	```js
	import { register } from '@9am/img-tissue'
	register({})
	```
	or try it with skypack without installation

	```js
	import { register } from 'https://cdn.skypack.dev/@9am/img-tissue'
	register({})
	```

3. Zoom

	```javascript
	// js
	const tissue = document.querySelector('img-tissue')
	tissue.zoomIn({ clientX: 0, clientY: 0, duration: 300 })
	tissue.zoomOut({ clientX: 0, clientY: 0, duration: 300 })
	```

## API
1. < img-tissue > attributes

	|Name|Type|Default|Description|
	|:--:|:--:|:-----:|:----------|
	|`src`|{String}|**Required**|The image URL|
	|`title`|{String}|`''`|For screen readers|
	|`column`|{Number}|`4`|Split area into {column} vertically|
	|`row`|{Number}|`4`|Split area into {row} horizontally|
2. < img-tissue > methods

	|Name|Params|Type|Default|Description|
	|:--:|:----:|:--:|:-----:|:----------|
	|`zoomIn({ clientX, clientY, duration })`||{Function}||ZoomIn the image to target position|
	|`zoomOut({ clientX, clientY, duration })`||{Function}||ZoomOut the image to 
	||`clientX`|{Number}|**Required**|X position on the client viewport|
	||`clientY`|{Number}|**Required**|Y position on the client viewport|
	||`duration`|{Number}|**Required**|Duration of the animation(ms)|
3. register options

	|Name|Type|Default|Description|
	|:--:|:--:|:-----:|:----------|
	|`tagName`|{String}|`img-tissue`|Change tag name of the web component|

## Development
1. Install dependencies

	`npm install`
4. Start dev server

	`npm run dev`
5. Put images under `./demo/img`, replace image URL in `index.html`
6. Open `localhost:3000` in the browser

## Testing
TBD


## License
[MIT](LICENSE)
