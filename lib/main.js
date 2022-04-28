import {
    cloneArr,
    getTextureMatrix,
    loadImage,
    split,
    linear,
} from './util.js';

class ImgTissue extends HTMLElement {
    static template() {
        const dom = document.createElement('template');
        dom.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                    overflow: visible;
                    font-size: 0;
                }
                #svg {
                    overflow: visible;
                }
            </style>
            <svg
                id="svg"
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                role="img"
                aria-labelledby="title"
            >
                <defs>
                    <image href="" id="image" x="0" y="0" width="100%" height="100%" />
                </defs>
                <title id="title"></title>
                <g id="texture">
                </g>
            </svg>
        `;
        return dom.content;
    }

    static get observedAttributes() {
        return ['src', 'title', 'column', 'row'];
    }

    // render
    #$svg = null
    #$image = null
    #$texture = null
    #$title = null
    #w = 0
    #h = 0
    #tx = 0
    #ty = 0
    #dstPoints = []
    #srcPoints = []
    #dstArea = []
    #srcArea = []
    #clipList = []
    #triList = []
    // zoom
    #reqid = null
    #start = null
    #zoomIn = true
    #duration = 0
    #distList = []
    #distMax = 1

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(
            ImgTissue.template().cloneNode(true),
        );
        this.#$svg = this.shadowRoot.querySelector('#svg');
        this.#$image = this.shadowRoot.querySelector('#image');
        this.#$texture = this.shadowRoot.querySelector('#texture');
        this.#$title = this.shadowRoot.querySelector('#title');
    }

    async attributeChangedCallback(name, prev, next) {
        if (prev === next) {
            return;
        }
        switch (name) {
            case 'src':
                const image = await loadImage({ url: this.src });
                this.#w = image.naturalWidth;
                this.#h = image.naturalHeight;
                this.#initDOM();
                this.#render();
                break;
            case 'column':
            case 'row':
                this.#initDOM();
                this.#render();
                break;
            case 'title':
                this.#renderTitle(this.title);
                break;
            default:
                break;
        }
    }

    #initDOM() {
        this.#$image.setAttribute('href', this.src);
        this.#$svg.setAttribute('viewBox', `0 0 ${this.#w} ${this.#h}`);

        const {
            points,
            area,
        } = split({ w: this.#w, h: this.#h, c: +this.column, r: +this.row })
        this.#dstPoints = points;
        this.#srcPoints = cloneArr(points);
        this.#dstArea = area;
        this.#srcArea = cloneArr(area);

        const gList = this.#dstArea.map((dst, index) => `
            <g id="g-${index}" clip-path="url(#clip-${index})">
                <clipPath id="clip-${index}">
                    <polygon points="" />
                </clipPath>
                <use id="tri-${index}" href="#image" />
            </g>
        `);
        this.#$texture.innerHTML = gList.join('');

        this.#clipList = [...this.#$texture.querySelectorAll('polygon')];
        this.#triList = [...this.#$texture.querySelectorAll('use')];
    }

    #render() {
        const offset = 1;
        const len = this.#dstArea.length;
        for (let i = 0; i < len; i++) {
            const src = this.#srcArea[i];
            const dst = this.#dstArea[i];
            const mat = getTextureMatrix(src, dst);
            const [[x1, y1], [x2, y2], [x3, y3]] = dst;
            const anti = i % 2
                ? [
                    [x1 - offset, y1 - offset],
                    [x2 - offset, y2 + offset],
                    [x3 + offset, y3],
                ]
                : [
                    [x1 - offset, y1],
                    [x2 + offset, y2 - offset],
                    [x3 + offset, y3 + offset],
                ]
            this.#clipList[i].setAttribute('points', anti.join(' '));
            // this.#clipList[i].setAttribute('points', dst.join(' '));
            this.#triList[i].setAttribute('transform', `matrix(${mat.join(' ')})`);
        }
    }

    #renderTitle(title) {
        this.#$title.textContent = title;
    }

    #frame(timestamp) {
        if (this.#start === null) {
            this.#start = timestamp;
            this.#distList = this.#srcPoints.map(([cx, cy]) => Math.hypot(cx - this.#tx, cy - this.#ty));
            this.#distMax = Math.max.apply(null, this.#distList.flatMap(item => item));
        }
        // move dst to tx, ty
        const len = this.#dstPoints.length;
        for (let i = 0; i < len; i++) {
            const dst = this.#dstPoints[i];
            const src = this.#srcPoints[i];
            if (this.#zoomIn) {
                const delay = (this.#distList[i] / this.#distMax) * this.#duration;
                dst[0] = linear(timestamp - this.#start, src[0], this.#tx, this.#duration, delay);
                dst[1] = linear(timestamp - this.#start, src[1], this.#ty, this.#duration, delay);
            } else {
                const delay = (1 - this.#distList[i] / this.#distMax) * this.#duration;
                dst[0] = linear(timestamp - this.#start, this.#tx, src[0], this.#duration, delay);
                dst[1] = linear(timestamp - this.#start, this.#ty, src[1], this.#duration, delay);
            }
        };
        this.#render();
        if (timestamp - this.#start < this.#duration * 2) {
            this.#reqid = window.requestAnimationFrame(this.#frame.bind(this));
        }
    };

    #zoom({ clientX, clientY, duration }) {
        const [{x, y, width, height}] = this.shadowRoot.host.getClientRects();
        this.#tx = (+clientX - +x) * (this.#w / width);
        this.#ty = (+clientY - +y) * (this.#h / height);
        this.#duration = duration;
        if (this.#reqid) {
            window.cancelAnimationFrame(this.#reqid);
            this.#start = null;
        }
        this.#reqid = window.requestAnimationFrame(this.#frame.bind(this));
    }

    zoomIn({ clientX, clientY, duration }) {
        this.#zoomIn = true;
        this.#zoom({ clientX, clientY, duration });
    }

    zoomOut({ clientX, clientY, duration }) {
        this.#zoomIn = false;
        this.#zoom({ clientX, clientY, duration });
    }

    reset() {
        if (this.#reqid) {
            window.cancelAnimationFrame(this.#reqid);
            this.#start = null;
        }
        this.#initDOM();
        this.#render();
    }

    get src() {
        return this.getAttribute('src');
    }

    set src(val = '') {
        this.setAttribute('src', val);
    }

    get title() {
        return this.getAttribute('title');
    }

    set title(val = '') {
        this.setAttribute('title', val);
    }

    get column() {
        return this.getAttribute('column');
    }

    set column(val = 4) {
        this.setAttribute('column', Math.max(2, Math.min(val, 20)));
    }

    get row() {
        return this.getAttribute('row');
    }

    set row(val = 4) {
        this.setAttribute('row', Math.max(2, Math.min(val, 20)));
    }

    connectedCallback() {
        if (!this.hasAttribute('src')) {
            this.src = '';
        }
        if (!this.hasAttribute('title')) {
            this.title = '';
        }
        if (!this.hasAttribute('column')) {
            this.column = 4;
        }
        if (!this.hasAttribute('row')) {
            this.row = 4;
        }
    }

    distconnectedCallback() {
        if (this.#reqid) {
            window.cancelAnimationFrame(this.#reqid);
        }
        this.#$svg = null
        this.#$image = null
        this.#$texture = null
        this.#$title = null
        this.#dstPoints = null
        this.#srcPoints = null
        this.#dstArea = null
        this.#srcArea = null
        this.#clipList = null
        this.#triList = null
        this.#reqid = null
        this.#start = null
        this.#distList = null
    }
}

export const register = ({
    tagName = 'img-tissue',
}) => {
    try {
        window.customElements.define(tagName, ImgTissue);
    } catch (event) {
        console.error(event);
    }
};

export default ImgTissue;
