import p5 from "p5";

const DEFAULT_MAX_X = 32;

/**
 * This class defines conversion functions between screen and world coordinate systems.
 */
export class CoordinateSystem {
    private transform: number[];
    private inverseTransform: number[];

    constructor() {
        this.transform = [1, 0, 0, 1, 0, 0];
        this.inverseTransform = [1, 0, 0, 1, 0, 0];
    }

    /**
     * Creates a coordinate system, that transforms screen coordinates to default dkwdp-coordinates.
     * dkwdp-coordinates are defined as follows:
     * The zero point is in the center of the screen.
     * The x-axis is horizontal and points to the right.
     * The y-axis is vertical and points up.
     * Screenpoint [0, 0] -> [-32, 18]. Screenpoint [width, height] -> [32, -18].
     * @param width
     * @param height
     */
    static default(width: number, height: number): CoordinateSystem {
        const cs = new CoordinateSystem();
        const xScale = (2 * DEFAULT_MAX_X) / width;
        const yScale = (2 * DEFAULT_MAX_X * 9 / 16) / height;
        cs.set(xScale, 0, 0, yScale, -DEFAULT_MAX_X,  -DEFAULT_MAX_X * 9 / 16);
        return cs;
    }

    /**
     * Applies transformation like in the following transformation matrix:
     * (a c e)
     * (b d f)
     * (0 0 1)
     *
     * Like this: CoordinateSystem.apply(a, b, c, d, e, f);
     *
     * @param x - The x-scale factor or an array containing all 6 transformation factors.
     * @param [ySheer=0] - The y-shear factor, defaults to 0.
     * @param [xSheer=0] - The x-shear factor, defaults to 0.
     * @param [y=1] - The y-scale factor, defaults to 1.
     * @param [xTranslate=0] - The x-translation value, defaults to 0.
     * @param [yTranslate=0] - The y-translation value, defaults to 0.
     * @return This method does not return a value.
     */
    set(x: number | number[], ySheer: number = 0, xSheer: number = 0, y: number = 1, xTranslate: number = 0, yTranslate: number = 0): void {
        if (Array.isArray(x)) {
            this.set(x[0], x[1], x[2], x[3], x[4], x[5]);
        } else {
            this.transform = [x, ySheer, xSheer, y, xTranslate, yTranslate];
            this.inverseTransform = this.calcInverse(x, ySheer, xSheer, y, xTranslate, yTranslate);
        }
    }

    /**
     * Given the values of the forward transformation, this calculates the backward transformation matrix.
     * @param x
     * @param ySheer
     * @param xSheer
     * @param y
     * @param xTranslate
     * @param yTranslate
     * @private
     */
    private calcInverse(x: number, ySheer: number = 0, xSheer: number = 0, y: number = 1, xTranslate: number = 0, yTranslate: number = 0): number[] {
        const invDet = 1.0 / (x * y - ySheer * xSheer);
        return [y * invDet, -ySheer * invDet, -xSheer * invDet, x * invDet, (xSheer * yTranslate - y * xTranslate) * invDet, (ySheer * xTranslate - x * yTranslate) * invDet];
    }

    /**
     * Use this transformation matrix for p5 calls.
     */
    use(p: p5) {
        p.resetMatrix();
        const [invX, invY] = [1 / this.transform[0], 1 / this.transform[3]];
        p.applyMatrix(invX, this.transform[1], this.transform[2], invY, -this.transform[4] * invX, -this.transform[5] * invY);
    }

    /**
     * Converts screen coordinates to world coordinates.
     * @param x The x-coordinate in screen space
     * @param y The y-coordinate in screen space
     * @returns The transformed vector in world space
     */
    s2w(x: number, y: number = 0): [number, number] {
        return matMul(x, y, this.transform);
    }

    /**
     * Converts screen coordinates to world coordinates without translation.
     * @param x The x-coordinate in screen space
     * @param y The y-coordinate in screen space
     * @returns The transformed vector in world space
     */
    s2wScale(x: number, y: number = 0): [number, number] {
        return matMulScale(x, y, this.transform);
    }

    /**
     * Converts world coordinates to screen coordinates.
     * @param x The x-coordinate in world space
     * @param y The y-coordinate in world space
     * @returns The x- and y-coordinates in screen space
     */
    w2s(x: number, y: number): [number, number] {
        return matMul(x, y, this.inverseTransform);
    }

    /**
     * Converts world coordinates to screen coordinates.
     * @param x The x-coordinate in world space
     * @param y The y-coordinate in world space
     * @returns The x- and y-coordinates in screen space
     */
    w2sScale(x: number, y: number): [number, number] {
        return matMulScale(x, y, this.inverseTransform);
    }
}

/**
 * Applies a transformation matrix to a vector.
 * @param x The x-coordinate of the vector to transform
 * @param y The y-coordinate of the vector to transform
 * @param transform The transformation matrix to apply
 */
function matMul(x: number, y: number, transform: number[]): [number, number] {
    return [
        x * transform[0] + y * transform[2] + transform[4],
        x * transform[1] + y * transform[3] + transform[5],
    ];
}

/**
 * Applies a transformation matrix to a vector, ignoring the translation part.
 * @param x The x-coordinate of the vector to transform
 * @param y The y-coordinate of the vector to transform
 * @param transform The transformation matrix to apply
 */
function matMulScale(x: number, y: number, transform: number[]): [number, number] {
    return [
        x * transform[0] + y * transform[2],
        x * transform[1] + y * transform[3]
    ];
}