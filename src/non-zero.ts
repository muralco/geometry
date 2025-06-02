declare const nonZero: unique symbol;

/**
 * A tag for non-zero values.
 * Can be required for some operations to avoid division by zero.
 * @see {@link Point.isNonZero}
 */
export type NonZero = { [nonZero]: true };
