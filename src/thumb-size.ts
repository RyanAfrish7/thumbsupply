export interface ThumbSize {
    name: string;
    width: number;
    height: number;
}

export const ThumbSizes: { [key in 'MEDIUM' | 'LARGE']: ThumbSize } = {
    MEDIUM: {
        name: '240p',
        width: 240,
        height: 240,
    },
    LARGE: {
        name: '480p',
        width: 480,
        height: 480,
    },
};
