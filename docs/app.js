import { h, text, patch } from 'https://unpkg.com/superfine';

main();

async function main() {
    setState(getInitialState());

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js');
    }
}

function getInitialState() {
    return {
        n: 40,
        v: 11,
        images: new Map(),
        currentImage: '',
        maxImageHistory: 10,
        nRecommendedMax: 4000,
        thumbnailSize: 32,
        placeholderImage: 'https://placehold.it/1x1',
        page: 'main'
    };
}

async function setState(state) {
    const error = new Error();
    try {
        const page = getPage(state);
        return patch(
            document.getElementById("app"),
            h("main", { id: "app", class: "container" },
                h("div", { class: "main-container" }, [
                    ...page
                ]))
        );

    } catch (e) {
        error.message = e.message;
        throw error
    }
}

function getPage(state) {
    if (state.page === 'main') {
        return [
            h("div", { class: "columns" }, [
                h("div", { class: "column" }, [
                    h("h1", { class: "title" }, text("Display")),
                    h("p", { class: "subtitle" }, text("An abstract pixel art generator")),
                    ...form(state),
                ]),
                h("div", { class: "column theatre" }, [
                    ...imagePreview(state)
                ])
            ]),
            ...history(state)
        ]
    } else if (state.page === 'preview') {
        if (!state.images.has(state.currentImage)) {
            setState({
                ...state,
                page: 'main'
            });
            return;
        }

        const image = state.images.get(state.currentImage);
        return [
            h("div", { class: "columns" }, [
                h("div", { class: "column" }, [
                    h("a", {
                        class: "button",
                        href: "#",
                        onclick: () => {
                            setState({
                                ...state,
                                page: 'main'
                            })
                        }
                    }, text("Back"))
                ]),
                h("div", {class: "column"}, [
                    h("figure", {
                        class: "image"
                    }, h("img", {
                        class: 'is-pixelated',
                        src:image.src
                    }))
                ])
            ])
        ]
    }
}

function form(state) {
    return [
        h("form", {
            onsubmit: e => {
                e.preventDefault();
                renderImage(state);
            }
        }, [
            h("div", { class: "form-control" }, [
                h("label", { for: "n" }, text("N")),
                h("input", {
                    name: "n",
                    id: "n_range",
                    type: "range",
                    value: state.n,
                    oninput: ({ target: { value } }) => setState({
                        ...state,
                        n: value
                    })
                }),
                h("input", {
                    name: "n",
                    id: "n",
                    type: "number",
                    value: state.n,
                    oninput: ({ target: { value } }) => setState({
                        ...state,
                        n: value
                    })
                })
            ]),
            h("div", { class: "form-control" }, [
                h("label", { for: "v" }, text("V")),
                h("input", {
                    name: "v",
                    id: "v_range",
                    type: "range",
                    value: state.v,
                    oninput: ({ target: { value } }) => setState({
                        ...state,
                        v: value
                    })
                }),
                h("input", {
                    name: "v",
                    id: "v",
                    type: "number",
                    value: state.v,
                    oninput: ({ target: { value } }) => setState({
                        ...state,
                        v: value
                    })
                })
            ]),
            h("div", { class: "form-control" }, [
                h("input", {
                    type: "submit",
                    value: "Render"
                })
            ])
        ])
    ]
}

function imagePreview(state) {
    if (!state.images.has(state.currentImage)) {
        return [
            h("div", { class: "box" },
                h("img", { src: state.placeholderImage, alt: "Placeholder Image" })
            )
        ]
    }

    const activeImage = state.images.get(state.currentImage);

    return [
        h("div", { class: "image-preview box" }, [
            h("a", {
                href: "#image-preview",
                onclick: () => {
                    setState({
                        ...state,
                        page: 'preview'
                    })
                }
            },
                h("img", { src: activeImage.src, alt: `Generated pixel art where values are n=${activeImage.n} and v=${activeImage.v}` }),
            ),
            h("div", { class: "level" }, [
                h("span", { class: "level-item" }, text(`N=${activeImage.n}`)),
                h("span", { class: "level-item" }, text(`V=${activeImage.v}`))
            ])
        ])
    ]
}

function history(state) {
    if (state.images.size === 0) return [];
    return [
        h("div", {
            class: "container"
        }, [
            h("p", {}, text(`Last ${state.maxImageHistory} images:`)),
            h("div", {
                class: "columns is-multiline is-mobile"
            }, [
                ...Array.from(state.images.entries()).reverse().map(([key, image], i) =>
                    h("div", {
                        class: "column",
                        key: `${i}`
                    }, [
                        h("a", {
                            href: "#loadPreviousImage-" + image.n + "-" + image.v,
                            class: state.currentImage === key ? 'active' : '',
                            onclick: () => setState({
                                ...state,
                                n: image.n,
                                v: image.v,
                                currentImage: key
                            })
                        }, [
                            h("figure", { class: "image is-128x128" },
                                h("img", {
                                    class: "is-rounded",
                                    src: image.src, width: state.thumbnailSize, height: state.thumbnailSize, alt: `Thumbnail for generated image with values n=${image.n} and v=${image.v}`
                                }),
                            ),
                            text(`N=${image.n}, V=${image.v}`)
                        ])
                    ]))
            ])
        ])
    ]
}

function renderImage(state) {
    if (state.n > state.nRecommendedMax) {
        const doContinue = confirm("You entered an n greater than " + state.nRecommendedMax + ". (n=" + state.n + "). This may take a long time. Proceed?");
        if (!doContinue) return;
    }

    const worker = new Worker("./worker.js");
    worker.onmessage = e => {
        worker.terminate();

        const imageData = e.data.imageData;
        const canvasDataURL = renderPixelData(state.n, imageData);
        const key = `n${state.n}v${state.v}`;
        const images = state.images;
        images.set(key, {
            n: state.n,
            v: state.v,
            src: canvasDataURL
        });

        setState({
            ...state,
            currentImage: key,
            images
        })
    }
    worker.postMessage([state.n, state.v]);
}

function renderPixelData(n, sourceImageData) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", n);
    canvas.setAttribute("height", n);
    const ctx = canvas.getContext("2d");

    const imageData = ctx.createImageData(n, n);
    sourceImageData.forEach((v, i) => imageData.data[i] = v);
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
}