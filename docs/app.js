import  {h, text, patch} from 'https://unpkg.com/superfine';

main();

async function main() {
    setState({
        n: 40,
        v: 11,
        images: [],
        currentImageIndex: 0,
        maxImageHistory: 10,
        nRecommendedMax: 4000,
        thumbnailSize: 32,
        placeholderImage: 'https://placehold.it/1x1'
    });
}

async function setState(state) {
    return patch(
        document.getElementById("app"),
        h("main", {id: "app"}, [
            h("div", {class:"columns"}, [
                h("div", {class:"column"}, [
                    h("h1", {class:"title"}, text("Display")),
                    h("p", {class:"subtitle"}, text("An abstract pixel art generator")),
                    ...form(state),
                ]),
                h("div", {class:"column theatre"}, [
                    ...imagePreview(state)
                ])
            ]),
            ...history(state)
        ])
    );
}

function form(state) {
    return [
        h("form", {
            onsubmit: e => {
                e.preventDefault();
                renderImage(state);
            }
        }, [
            h("div", {class:"form-control"}, [
                h("label", {for: "n" }, text("N")),
                h("input", {
                    name:"n",
                    id:"n_range",
                    type:"range",
                    value: state.n,
                    oninput: ({target: {value}}) => setState({
                        ...state,
                        n: value
                    })
                }),
                h("input", {
                    name: "n",
                    id: "n",
                    type: "number",
                    value: state.n,
                    oninput: ({target:{value}}) => setState({
                        ...state,
                        n: value
                    })
                })
            ]),
            h("div", {class:"form-control"}, [
                h("label", {for: "v" }, text("V")),
                h("input", {
                    name:"v",
                    id:"v_range",
                    type:"range",
                    value: state.v,
                    oninput: ({target: {value}}) => setState({
                        ...state,
                        v: value
                    })
                }),
                h("input", {
                    name: "v",
                    id: "v",
                    type: "number",
                    value: state.v,
                    oninput: ({target:{value}}) => setState({
                        ...state,
                        v: value
                    })
                })
            ]),
            h("div", {class:"form-control"}, [
                h("input", {
                    type: "submit",
                    value: "Render"
                })
            ])
        ])
    ]
}

function imagePreview(state) {
    const activeImage = state.images[state.currentImageIndex];

    if (!activeImage) {
        return [
            h("img", {src: state.placeholderImage, alt: "Placeholder Image"})
        ]
    }

    return [
        h("div", {}, [
            h("img", {src:activeImage.src, alt: `Generated pixel art where values are n=${activeImage.n} and v=${activeImage.v}`}),
            h("div", {class:"level"}, [
                h("span", {class:"level-item"}, text(`N=${activeImage.n}`)),
                h("span", {class:"level-item"}, text(`V=${activeImage.v}`))
            ])
        ])
    ]
}

function history(state) {
    if (state.images.length === 0) return [];
    return [
        h("div", {}, [
            h("p", {}, text(`Last ${state.maxImageHistory} images:`)),
            h("ul", {}, state.images.map((image, i) => 
                h("li", {}, [
                    h("a", {
                        href: "#loadPreviousImage-"+image.n+"-"+image.v,
                        class: state.currentImageIndex === i ? 'active': '',
                        onclick: () => setState({
                            ...state,
                            n: image.n,
                            v: image.v,
                            currentImageIndex: i
                        })
                    }, [
                        h("img", {src: image.src, width: state.thumbnailSize, height: state.thumbnailSize, alt:`Thumbnail for generated image with values n=${image.n} and v=${image.v}`}),
                        text(`N=${image.n}, V=${image.v}`)
                    ])
                ])))
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
        const imageData = e.data.imageData;
        const canvasDataURL = renderPixelData(state.n, imageData);

        worker.terminate();
        setState({
            ...state,
            currentImageIndex: 0,
            images: [
                {
                    n: state.n,
                    v: state.v,
                    src: canvasDataURL
                },
                ...state.images
            ].slice(0, state.maxImageHistory)
        })
    }
    worker.postMessage([state.n, state.v]);
}

function renderPixelData(n, sourceImageData) {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("width", n);
    canvas.setAttribute("height", n);
    const ctx = canvas.getContext("2d");

    const imageData = ctx.createImageData(n,n);
    sourceImageData.forEach((v, i) => imageData.data[i] = v);
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL();
}