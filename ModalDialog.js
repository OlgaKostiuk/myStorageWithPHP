function ModalDialog() {

    var template = $("#templateContainer");

    var dialog = $(".modalDialog", template).clone();
    dialog.appendTo('body');

    var header = $(".modalDialogHeader", dialog);
    var label = $(".modalDialogLabel", dialog);
    var input = $(".modalDialogInput", dialog);
    var OKbtn = $(".modalDialogOK", dialog);

    this.destroyModalDialog = function () {
        dialog.hide(function () {
            dialog.remove();
            dialog = undefined;
        });
        dialog.removeClass("fade").modal("hide");
    };

    this.renderModalDialog = function (settings) {
        let self = this;
        if (settings.header) {
            header.text(settings.header);
        }
        if (settings.label) {
            label.text(settings.label);
        }
        if (settings.input) {
            input.val(settings.input);
        }
        if (settings.OKText) {
            OKbtn.text(settings.OKText);
        }
        if (settings.OKHandler) {
            OKbtn.click(function () {
                settings.OKHandler(input.val());
            });
            OKbtn.click(self.destroyModalDialog);
        }
        dialog.modal();
    };
}