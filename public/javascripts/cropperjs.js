window.onload = function () {

    'use strict';

    let Cropper = window.Cropper;
    let URL = window.URL || window.webkitURL;
    let container = document.querySelector('.img-container');
    let image = container.getElementsByTagName('img').item(0);
    let download = document.getElementById('download');
    let actions = document.getElementById('actions');
    let dataX = document.getElementById('dataX');
    let dataY = document.getElementById('dataY');
    let dataHeight = document.getElementById('dataHeight');
    let dataWidth = document.getElementById('dataWidth');
    let dataRotate = document.getElementById('dataRotate');
    let dataScaleX = document.getElementById('dataScaleX');
    let dataScaleY = document.getElementById('dataScaleY');
    let options = {
        preview: '.img-preview',
        ready: function (e) {
            console.log(e.type);
        },
        zoom: function (e) {
            console.log(e.type, e.detail.ratio);
        },
        responsive: true, //default is true
        restore: true, //default is true
        checkCrossOrigin: true, //default is true
        checkOrientation: true, //default is true
        modal: true, //default is true
        guides: true, //default is true
        center: true, //default is true
        highlight: true, //default is true
        background: true, //default is true
        autoCrop: true, //default is true
        movable: true, //default is true
        rotatable: true, //default is true
        scalable: true, //default is true
        zoomable: true, //default is true
        zoomOnTouch: true, //default is true
        zoomOnWheel: true, //default is true
        cropBoxMovable: true, //default is true
        cropBoxResizable: true, //default is true
        toggleDragModeOnDblclick: true, //default is true
    };
    let cropper = new Cropper(image, options);
    let originalImageURL = image.src;
    let uploadedImageURL;

    // Tooltip
    $('[data-toggle="tooltip"]').tooltip();


    // Buttons
    if (!document.createElement('canvas').getContext) {
        $('button[data-method="getCroppedCanvas"]').prop('disabled', true);
    }

    if (typeof document.createElement('cropper').style.transition === 'undefined') {
        $('button[data-method="rotate"]').prop('disabled', true);
        $('button[data-method="scale"]').prop('disabled', true);
    }

    // Download
    if (typeof download.download === 'undefined') {
        download.className += ' disabled';
    }


    // Methods
    actions.querySelector('.docs-buttons').onclick = function (event) {
        let e = event || window.event;
        let target = e.target || e.srcElement;
        let result;
        let input;
        let data;

        if (!cropper) {
            return;
        }

        while (target !== this) {
            if (target.getAttribute('data-method')) {
                break;
            }

            target = target.parentNode;
        }

        if (target === this || target.disabled || target.className.indexOf('disabled') > -1) {
            return;
        }

        data = {
            method: target.getAttribute('data-method'),
            target: target.getAttribute('data-target'),
            option: target.getAttribute('data-option'),
            secondOption: target.getAttribute('data-second-option')
        };

        if (data.method) {
            if (typeof data.target !== 'undefined') {
                input = document.querySelector(data.target);

                if (!target.hasAttribute('data-option') && data.target && input) {
                    try {
                        data.option = JSON.parse(input.value);
                    } catch (e) {
                        console.log(e.message);
                    }
                }
            }

            if (data.method === 'getCroppedCanvas') {
                data.option = JSON.parse(data.option);
            }

            result = cropper[data.method](data.option, data.secondOption);

            switch (data.method) {
                case 'scaleX':
                case 'scaleY':
                    target.setAttribute('data-option', -data.option);
                    break;

                case 'getCroppedCanvas':
                    if (result) {

                        // Bootstrap's Modal
                        $('#getCroppedCanvasModal').modal().find('.modal-body').html(result);

                        if (!download.disabled) {
                            /**
                             *
                             * @TODO if image is less than a min pixel resolution, make bigger.
                             */

                            download.href = result.toDataURL('image/jpeg');
                        }
                    }

                    break;

                case 'destroy':
                    cropper = null;

                    if (uploadedImageURL) {
                        URL.revokeObjectURL(uploadedImageURL);
                        uploadedImageURL = '';
                        image.src = originalImageURL;
                    }

                    break;
            }

            if (typeof result === 'object' && result !== cropper && input) {
                try {
                    input.value = JSON.stringify(result);
                } catch (e) {
                    console.log(e.message);
                }
            }
        }
    };

    document.body.onkeydown = function (event) {
        let e = event || window.event;

        if (!cropper || this.scrollTop > 300) {
            return;
        }

        switch (e.keyCode) {
            case 37:
                e.preventDefault();
                cropper.move(-1, 0);
                break;

            case 38:
                e.preventDefault();
                cropper.move(0, -1);
                break;

            case 39:
                e.preventDefault();
                cropper.move(1, 0);
                break;

            case 40:
                e.preventDefault();
                cropper.move(0, 1);
                break;
        }
    };


    // Import image
    let inputImage = document.getElementById('inputImage');

    if (URL) {
        inputImage.onchange = function () {
            let files = this.files;
            let file;

            if (cropper && files && files.length) {
                file = files[0];

                if (/^image\/\w+/.test(file.type)) {
                    if (uploadedImageURL) {
                        URL.revokeObjectURL(uploadedImageURL);
                    }

                    image.src = uploadedImageURL = URL.createObjectURL(file);
                    cropper.destroy();
                    cropper = new Cropper(image, options);
                    inputImage.value = null;
                } else {
                    window.alert('Please choose an image file.');
                }
            }
        };
    } else {
        inputImage.disabled = true;
        inputImage.parentNode.className += ' disabled';
    }
};