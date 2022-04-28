export const fillTriangle = (img, ctx, src, dst) => {
    const [,,[x2,y2]] = dst;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    for (let [x, y] of dst) {
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.clip();
    const mat = getTextureMatrix(src, dst); 
    ctx.transform.apply(
        ctx, mat,
    );
    ctx.drawImage(img, 0, 0)
    ctx.restore();
}

export const getTextureMatrix = (src, dst) => {
    let [[x0, y0], [x1, y1], [x2, y2]] = dst;
    let [[u0, v0], [u1, v1], [u2, v2]] = src;
    let a, b, c, d, e, f, det, idet;

    let _x1 = x1 - x0;
    let _y1 = y1 - y0;
    let _x2 = x2 - x0;
    let _y2 = y2 - y0;

    let _u1 = u1 - u0;
    let _v1 = v1 - v0;
    let _u2 = u2 - u0;
    let _v2 = v2 - v0;

    det = _u1 * _v2 - _u2 * _v1;

    if ( det === 0 ) return [1, 0, 0, 1, 0, 0];

    idet = 1 / det;

    a = (_v2 * _x1 - _v1 * _x2) * idet;
    b = (_v2 * _y1 - _v1 * _y2) * idet;
    c = (_u1 * _x2 - _u2 * _x1) * idet;
    d = (_u1 * _y2 - _u2 * _y1) * idet;
    e = x0 - a * u0 - c * v0;
    f = y0 - b * u0 - d * v0;
    return [a, b, c, d, e, f];
};

export const loadImage = ({ url }) => new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = () => {
        resolve(img);
    }
    img.onerror = reject;
    img.src = url;
})

export const split = ({ w, h, c, r }) => {
    const wc = w / c;
    const hr = h / r;
    const points = [];
    for (let j = 0; j < r + 1; j++) {
        for (let i = 0; i < c + 1; i++) {
            points.push([i * wc, j * hr]);
        }
    }
    const area = points.flatMap((point, i) => {
        if (!((i + 1) % (c + 1))
            || i / (c + 1) >= r
        ) {
            return [];
        }
        return [
            [
                point,
                points[i + 1],
                points[i + c + 2],
            ],
            [
                point,
                points[i + c + 1],
                points[i + c + 2],
            ],
        ];
    });
    return { points, area };
}

export const cloneArr = (list = []) => list
    .map(item => (Array.isArray(item)
        ? cloneArr(item)
        : item
    ));

export const linear = (t, b, c, d, delay = 0) => {
    const next = b + (c - b) * (Math.max(0, t - delay) / d);
    return c - b > 0
        ? Math.min(next, c)
        : Math.max(next, c);
}
