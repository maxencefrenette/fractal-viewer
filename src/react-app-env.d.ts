/// <reference types="react-scripts" />

declare module "raw.macro" {
    const raw: (path: string) => string;
    export default raw;
}

declare module "pan-zoom" {
    interface PanZoomEvent {
        dx: number;
        dy: number;
        dz: number;
        x: number;
        y: number;
        type: "mouse" | "touch" | "keyboard";
        target: HTMLElement;
        srcElement: HtmlElement;
        x0: number;
        y0: number;
    }
    type Callback = (e: PanZoomEvent) => void;
    const panzoom: (element: HTMLElement, callback: Callback) => () => void;
    export default panzoom;
}
